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
    const { trade } = await req.json();

    if (!trade) {
      return new Response(JSON.stringify({ error: "Missing trade data" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const isProfitable = (trade.profit_loss || 0) > 0;
    const pnlPct = trade.profit_loss_percentage || 0;

    const prompt = `Analyze this completed trade and explain why it ${isProfitable ? 'won' : 'lost'}. Be specific about technical factors.

Trade Details:
- Symbol: ${trade.symbol}
- Type: ${trade.trade_type} (${trade.side || 'long'})
- Entry Price: $${trade.entry_price}
- Exit Price: $${trade.exit_price || 'N/A'}
- P&L: $${trade.profit_loss || 0} (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%)
- Market: ${trade.market}
- Timeframe: ${trade.timeframe || 'Unknown'}
- Entry Reason: ${trade.entry_reason || 'Not specified'}
- Exit Reason: ${trade.exit_reason || 'Not specified'}
- Strategy Used: ${trade.strategy_used || 'Manual'}
- Entry Date: ${trade.entry_date}
- Exit Date: ${trade.exit_date || 'N/A'}

Provide your analysis in this JSON format:
{
  "verdict": "WIN" or "LOSS",
  "confidence": 75,
  "summary": "One sentence summary of why the trade won/lost",
  "technicalFactors": [
    {
      "factor": "RSI at Entry",
      "value": "estimated value",
      "impact": "positive" or "negative",
      "explanation": "How this factor influenced the trade"
    }
  ],
  "trendAnalysis": "Was the trade with or against the trend?",
  "volumeAnalysis": "Volume context for this trade",
  "candleStructure": "Key candle patterns that may have been present",
  "keyMistake": "The main mistake (if loss) or key strength (if win)",
  "improvementTip": "One specific actionable improvement",
  "riskRewardRatio": "Estimated R:R based on entry/exit",
  "gradeOutOf10": 7
}

Return ONLY valid JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert trade analyst for QuantMentor. Analyze trades based on technical indicators (RSI, trend direction, volume, candle structure). Be honest about mistakes. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      parsed = {
        verdict: isProfitable ? "WIN" : "LOSS",
        confidence: 60,
        summary: "Analysis could not be fully parsed.",
        technicalFactors: [],
        keyMistake: "Unable to determine",
        improvementTip: "Review your entry and exit criteria",
        gradeOutOf10: 5,
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-trade error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
