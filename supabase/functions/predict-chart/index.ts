import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symbol, assetType, messages, currentPrice, priceChange, chartTimeframe } = await req.json();

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build conversation history
    const conversationHistory: Message[] = messages || [];
    
    // Create system prompt for the AI trading assistant
    const systemPrompt = `You are an expert AI trading assistant specialized in technical analysis, chart patterns, and market predictions. You analyze charts and provide trading insights.

Current Context:
- Symbol: ${symbol}
- Asset Type: ${assetType || 'Unknown'}
- Current Price: ${currentPrice || 'N/A'}
- Price Change: ${priceChange || 'N/A'}
- Chart Timeframe: ${chartTimeframe || '1D'}

Your role:
1. Analyze chart patterns (head & shoulders, double tops/bottoms, triangles, flags, etc.)
2. Identify key support and resistance levels
3. Analyze price action and momentum
4. Consider volume patterns and trends
5. Provide clear Buy/Sell/Hold recommendations with confidence levels
6. Give specific entry points, stop-losses, and target prices when asked
7. Explain your reasoning clearly and educationally
8. Be willing to discuss and defend your analysis
9. Accept user corrections and incorporate new information
10. Adapt your analysis based on user's trading style and risk tolerance

IMPORTANT: 
- Always state that this is educational analysis, not financial advice
- Be specific with price levels when possible
- Explain the reasoning behind each prediction
- If you're uncertain, say so and explain why
- Engage in dialogue - users can challenge or question your analysis
- Learn from user feedback to improve your analysis

Response Format:
- Be conversational and engaging
- Use markdown for formatting (headers, lists, bold text)
- Include emojis for visual appeal (📈 📉 🎯 ⚠️ 💡)
- Keep responses focused but comprehensive`;

    // Prepare messages for the AI
    const aiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory
    ];

    console.log(`Processing prediction for ${symbol}, messages: ${conversationHistory.length}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
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

    // Return streaming response
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
