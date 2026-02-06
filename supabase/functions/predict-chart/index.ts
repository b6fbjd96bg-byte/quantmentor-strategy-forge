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
    
    // Create enhanced system prompt for accurate trading analysis
    const systemPrompt = `You are an elite AI trading analyst with expertise in technical analysis, price action, and market psychology. You provide highly accurate, actionable trading insights based on chart analysis.

## Current Market Context:
- **Symbol**: ${symbol}
- **Asset Type**: ${assetType || 'Unknown'}
- **Current Price**: ${currentPrice || 'Check chart'}
- **Price Change**: ${priceChange || 'Check chart'}
- **Chart Timeframe**: ${chartTimeframe || '1D'}

## Your Analysis Framework:

### 1. Chart Pattern Recognition
Identify and analyze: Head & Shoulders, Double/Triple Tops/Bottoms, Ascending/Descending Triangles, Bull/Bear Flags, Pennants, Wedges, Cup & Handle, Inverse Cup & Handle, Rounding Bottoms, Diamond patterns.

### 2. Technical Indicators Analysis
- **RSI (Relative Strength Index)**: Overbought (>70), Oversold (<30), Divergences
- **MACD**: Signal line crossovers, histogram momentum, divergences
- **Moving Averages**: 20/50/100/200 EMA/SMA crossovers, support/resistance
- **Bollinger Bands**: Squeeze patterns, breakouts, mean reversion
- **Volume**: Confirmation of moves, accumulation/distribution

### 3. Price Action Analysis
- **Candlestick Patterns**: Doji, Engulfing, Hammer, Shooting Star, Morning/Evening Star
- **Support/Resistance Levels**: Historical pivots, psychological levels, Fibonacci retracements
- **Trend Analysis**: Higher highs/lows, lower highs/lows, trend channels
- **Market Structure**: Break of structure (BOS), change of character (CHoCH)

### 4. Recommendation Format
Always provide:
- **Recommendation**: BUY / SELL / HOLD with confidence level (%)
- **Entry Zone**: Specific price range
- **Stop Loss**: With reasoning (below support, ATR-based, etc.)
- **Take Profit Targets**: TP1, TP2, TP3 with risk:reward ratios
- **Timeframe**: Expected duration for the trade
- **Risk Level**: Low / Medium / High

## Guidelines:
1. Be specific with exact price levels when possible
2. Always explain your reasoning clearly
3. Acknowledge uncertainty when the setup isn't clear
4. Consider multiple timeframe analysis
5. Factor in overall market conditions
6. Mention key upcoming catalysts (earnings, events) when relevant
7. Be willing to debate and adjust based on user feedback
8. ALWAYS include the disclaimer that this is educational, not financial advice

## Response Style:
- Use markdown formatting for clarity
- Include relevant emojis (📈 📉 🎯 ⚠️ 💡 🔥 ⛔)
- Keep responses comprehensive but scannable
- Prioritize actionable information`;

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
