import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface MessageContent {
  type: string;
  text?: string;
  image_url?: { url: string };
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | MessageContent[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, imageBase64, mode } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Two modes: "structured" for initial analysis (returns JSON dashboard), "chat" for follow-ups (streams)
    const isStructuredMode = mode === 'structured';

    const structuredSystemPrompt = `You are an elite AI trading analyst specializing in visual chart analysis. You analyze screenshots of TradingView charts and provide highly accurate, actionable trading insights.

IMPORTANT: You MUST respond ONLY with valid JSON. No markdown, no text before or after. Just pure JSON.

Respond with this exact JSON structure:
{
  "overview": {
    "symbol": "detected symbol or 'Unknown'",
    "timeframe": "detected timeframe",
    "market_structure": "Bullish Trend / Bearish Trend / Ranging / Breakout",
    "trend_strength": "Strong / Moderate / Weak"
  },
  "recommendation": {
    "action": "BUY / SELL / HOLD",
    "confidence": 75,
    "entry_zone": "price range string",
    "stop_loss": "price with reasoning",
    "take_profit_1": "TP1 price",
    "take_profit_2": "TP2 price", 
    "take_profit_3": "TP3 price",
    "risk_reward": "1:2.5"
  },
  "patterns": [
    {"name": "pattern name", "type": "bullish/bearish/neutral", "confidence": 80, "description": "short explanation"}
  ],
  "indicators": {
    "rsi": {"value": "65", "signal": "Neutral / Overbought / Oversold", "interpretation": "brief"},
    "macd": {"signal": "Bullish / Bearish crossover", "interpretation": "brief"},
    "moving_averages": {"signal": "Above/Below MA", "interpretation": "brief"},
    "volume": {"signal": "Increasing / Decreasing / Average", "interpretation": "brief"}
  },
  "support_resistance": [
    {"level": "price", "type": "support/resistance", "strength": "strong/moderate/weak"}
  ],
  "risk_assessment": {
    "level": "Low / Medium / High",
    "max_loss_percent": "2%",
    "key_invalidation": "If price breaks below X",
    "catalysts": ["list of potential catalysts"]
  },
  "summary": "2-3 sentence executive summary of the analysis"
}

Guidelines:
1. Be extremely specific about what you SEE in the chart
2. Reference exact visual elements (candles, lines, indicators visible)
3. Acknowledge if chart quality is poor or elements are hard to read
4. Provide realistic confidence levels, not always high
5. All price levels should be specific numbers when visible`;

    const chatSystemPrompt = `You are an elite AI trading analyst. You previously analyzed a chart and now the user is asking follow-up questions or challenging your analysis. 

Respond conversationally but with precision. Use emojis for visual scanning: 📈 📉 🎯 ⚠️ 💡 🔥 ⛔

Be willing to debate and reconsider based on user counter-arguments. Always remind that this is educational and not financial advice.`;

    const systemPrompt = isStructuredMode ? structuredSystemPrompt : chatSystemPrompt;

    // Build AI messages
    const aiMessages: Message[] = [
      { role: 'system', content: systemPrompt }
    ];

    for (const msg of messages) {
      if (msg.role === 'user' && msg.imageBase64) {
        aiMessages.push({
          role: 'user',
          content: [
            { type: 'text', text: msg.content || 'Please analyze this chart screenshot.' },
            {
              type: 'image_url',
              image_url: { url: `data:image/png;base64,${msg.imageBase64}` }
            }
          ]
        });
      } else {
        aiMessages.push({ role: msg.role, content: msg.content });
      }
    }

    console.log(`Processing chart analysis, mode: ${mode}, messages: ${messages.length}`);

    if (isStructuredMode) {
      // Non-streaming for structured JSON response
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: aiMessages,
          stream: false,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const errorText = await response.text();
        console.error('AI Gateway error:', response.status, errorText);
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || '';
      
      // Try to parse as JSON, clean up if needed
      let parsed;
      try {
        // Remove markdown code fences if present
        const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        console.error('Failed to parse structured response, returning raw:', content);
        parsed = { summary: content, error: 'Failed to parse structured response' };
      }

      return new Response(
        JSON.stringify(parsed),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Streaming for chat mode
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: aiMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const errorText = await response.text();
        console.error('AI Gateway error:', response.status, errorText);
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
        },
      });
    }

  } catch (error) {
    console.error('Error in predict-chart:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
