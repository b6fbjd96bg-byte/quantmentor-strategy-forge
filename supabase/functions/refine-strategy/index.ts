import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { strategy, feedback, history } = await req.json();

    if (!strategy) {
      return new Response(
        JSON.stringify({ error: "Missing strategy" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a quantitative trading strategy AI agent for QuantMentor. Your job is to analyze a trading strategy and generate precise chart data with buy/sell signals.

IMPORTANT: You must respond with VALID JSON only. No markdown, no code blocks, just pure JSON.

The JSON must have this exact structure:
{
  "analysis": "Brief analysis of the strategy (2-3 sentences)",
  "chartData": [
    {
      "bar": 1,
      "price": 100.5,
      "ema20": 100.2,
      "ema50": 99.8,
      "rsi": 45,
      "volume": 1200,
      "macd": 0.3,
      "macd_signal": 0.1,
      "bb_upper": 103,
      "bb_lower": 97
    }
  ],
  "signals": [
    {
      "bar": 15,
      "type": "buy",
      "price": 101.2,
      "reason": "RSI crossed above 30 + EMA20 > EMA50",
      "indicators": { "rsi": 32, "ema20": 101.0, "ema50": 100.5 }
    }
  ],
  "summary": {
    "totalSignals": 6,
    "buySignals": 3,
    "sellSignals": 3,
    "estimatedWinRate": 65,
    "estimatedProfitFactor": 1.8,
    "maxDrawdown": 4.2,
    "suggestion": "The strategy looks solid. Consider adding a volume confirmation filter."
  }
}

Rules:
- Generate exactly 80 bars of realistic price data
- Indicators should match what the user's strategy uses
- Buy/sell signals MUST follow the exact entry/exit rules described
- Show accurate indicator values at each signal point
- Generate 4-8 signals total with realistic spacing
- estimatedWinRate should be between 40-75 (realistic)
- If user gives feedback, adjust the signals and chart accordingly
- Always explain WHY each signal fired based on the strategy rules`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history if any
    if (history && Array.isArray(history)) {
      messages.push(...history);
    }

    // Build user message
    let userMessage = "";
    if (feedback) {
      userMessage = `The user wants to refine their strategy. Here's their feedback: "${feedback}"\n\nOriginal strategy:\n`;
    }
    userMessage += `Strategy: ${strategy.name}
Type: ${strategy.strategyType || 'custom'}
Entry Rules: ${strategy.entryRules}
Exit Rules: ${strategy.exitRules}
Indicators: ${strategy.indicators || 'EMA, RSI'}
Timeframe: ${strategy.timeframe || '4H'}
Markets: ${(strategy.markets || []).join(', ')}
Stop Loss: ${strategy.stopLossType || 'Fixed %'}
Take Profit: ${strategy.takeProfitType || 'Fixed %'}
Risk Per Trade: ${strategy.riskPerTrade || '1%'}

Generate the chart data and signals following these exact rules. Return ONLY valid JSON.`;

    messages.push({ role: "user", content: userMessage });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    // Parse JSON from response (handle possible markdown wrapping)
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      parsed = {
        analysis: "Strategy analyzed successfully. Here are the simulated results.",
        chartData: [],
        signals: [],
        summary: {
          totalSignals: 0, buySignals: 0, sellSignals: 0,
          estimatedWinRate: 50, estimatedProfitFactor: 1.0, maxDrawdown: 5,
          suggestion: "Could not parse AI response. Please try refining your strategy."
        }
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("refine-strategy error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
