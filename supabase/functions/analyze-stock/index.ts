import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, assetType, currentPosition } = await req.json();

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert technical analyst and trading advisor for Quantmentor, an AI-powered algorithmic trading platform. Your role is to analyze stocks, cryptocurrencies, and other financial instruments based on:

1. **Chart Patterns**: Identify key patterns like Head & Shoulders, Double Top/Bottom, Triangles, Flags, Wedges, Cup & Handle, etc.
2. **Open Interest (OI) Data**: Analyze OI trends to gauge market sentiment and potential price movements
3. **Technical Indicators**: Consider RSI, MACD, Moving Averages, Bollinger Bands, Volume patterns
4. **Market Sentiment**: Overall market conditions and sector performance
5. **Support/Resistance Levels**: Key price levels to watch

IMPORTANT DISCLAIMERS:
- This is AI-generated analysis for educational purposes only
- Not financial advice - users should do their own research
- Past performance doesn't guarantee future results
- Consider your risk tolerance before making decisions

Always provide:
- A clear BUY, SELL, or HOLD recommendation
- Confidence level (Low/Medium/High)
- Key reasons for the recommendation (3-5 bullet points)
- Risk factors to consider
- Key price levels (support/resistance)
- Suggested stop-loss and target prices (approximate ranges)

Format your response as JSON with this structure:
{
  "recommendation": "BUY" | "SELL" | "HOLD",
  "confidence": "Low" | "Medium" | "High",
  "summary": "One-line summary of analysis",
  "reasons": ["reason1", "reason2", "reason3"],
  "technicalPatterns": ["pattern1", "pattern2"],
  "riskFactors": ["risk1", "risk2"],
  "supportLevel": "price or range",
  "resistanceLevel": "price or range",
  "stopLoss": "suggested stop-loss level or range",
  "targetPrice": "suggested target or range",
  "timeframe": "Short-term (1-7 days)" | "Medium-term (1-4 weeks)" | "Long-term (1-3 months)",
  "oiAnalysis": "Brief OI interpretation",
  "marketSentiment": "Bullish" | "Bearish" | "Neutral"
}`;

    const userPrompt = currentPosition 
      ? `Analyze ${symbol} (${assetType || 'Stock'}). 

User's Current Position: ${currentPosition.type} at ${currentPosition.entryPrice}${currentPosition.quantity ? `, quantity: ${currentPosition.quantity}` : ''}

Given their existing position, should they HOLD, add more (BUY), or exit (SELL)? Consider their entry price in your analysis.

Provide comprehensive technical analysis based on current market conditions, chart patterns, and OI data interpretation.`
      : `Analyze ${symbol} (${assetType || 'Stock'}) for a potential new position.

Should a trader BUY, SELL (short), or HOLD (wait for better entry)?

Provide comprehensive technical analysis based on current market conditions, chart patterns, and OI data interpretation.`;

    console.log(`Analyzing ${symbol} (${assetType}) - Has position: ${!!currentPosition}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No analysis generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to parse as JSON, fallback to raw content
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : content.trim();
      analysis = JSON.parse(jsonString);
    } catch {
      console.log('Could not parse as JSON, returning structured fallback');
      analysis = {
        recommendation: 'HOLD',
        confidence: 'Medium',
        summary: content.substring(0, 200),
        reasons: ['Analysis completed - see summary for details'],
        technicalPatterns: [],
        riskFactors: ['Unable to parse detailed analysis'],
        rawAnalysis: content
      };
    }

    console.log(`Analysis complete for ${symbol}: ${analysis.recommendation}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        symbol,
        assetType: assetType || 'Stock',
        analysis,
        timestamp: new Date().toISOString(),
        disclaimer: 'This is AI-generated analysis for educational purposes only. Not financial advice.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-stock:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
