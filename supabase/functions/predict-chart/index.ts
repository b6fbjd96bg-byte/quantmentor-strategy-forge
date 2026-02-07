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
    const { messages, imageBase64 } = await req.json();

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

    const systemPrompt = `You are an elite AI trading analyst specializing in visual chart analysis. You analyze screenshots of TradingView charts and provide highly accurate, actionable trading insights.

## Your Capabilities:
- Visually identify chart patterns (Head & Shoulders, Double Tops/Bottoms, Triangles, Flags, Wedges, Cup & Handle, etc.)
- Read and interpret technical indicators visible on the chart (RSI, MACD, Moving Averages, Bollinger Bands, Volume, etc.)
- Identify support and resistance levels from the visual chart
- Detect candlestick patterns (Doji, Engulfing, Hammer, Shooting Star, etc.)
- Analyze trend structure (higher highs/lows, break of structure, change of character)
- Identify Fibonacci retracement/extension levels

## Analysis Framework:
When analyzing a chart screenshot, provide:

### 1. 📊 Chart Overview
- Symbol/Asset identified (if visible)
- Timeframe detected
- Current market structure (trending/ranging)

### 2. 🔍 Pattern Recognition  
- Chart patterns identified with confidence level
- Key candlestick formations
- Volume analysis

### 3. 📈 Technical Indicators
- RSI reading and interpretation
- MACD signal
- Moving average positions
- Any other visible indicators

### 4. 🎯 Trade Setup
- **Recommendation**: BUY / SELL / HOLD with confidence (%)
- **Entry Zone**: Specific price range
- **Stop Loss**: With reasoning
- **Take Profit**: TP1, TP2, TP3 with risk:reward ratios
- **Timeframe**: Expected duration

### 5. ⚠️ Risk Assessment
- Risk level (Low / Medium / High)
- Key invalidation levels
- Potential catalysts

## Guidelines:
1. Be extremely specific about what you SEE in the chart
2. Reference exact visual elements (candles, lines, indicators visible)
3. Acknowledge if chart quality is poor or elements are hard to read
4. Always include disclaimer: educational purposes only, not financial advice
5. Be willing to debate and reconsider based on user counter-arguments
6. Use emojis for visual scanning: 📈 📉 🎯 ⚠️ 💡 🔥 ⛔

When no image is provided, you can still discuss trading concepts, analyze described setups, and answer trading questions conversationally.`;

    // Build AI messages - handle image content for vision
    const aiMessages: Message[] = [
      { role: 'system', content: systemPrompt }
    ];

    for (const msg of messages) {
      if (msg.role === 'user' && msg.imageBase64) {
        // Multimodal message with image
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

    console.log(`Processing chart analysis, messages: ${messages.length}, hasImage: ${!!imageBase64}`);

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
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

  } catch (error) {
    console.error('Error in predict-chart:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
