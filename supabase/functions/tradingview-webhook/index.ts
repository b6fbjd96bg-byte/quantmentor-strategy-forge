import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const strategyId = url.searchParams.get("strategy");

    if (!strategyId) {
      return new Response(JSON.stringify({ error: "Missing strategy parameter" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, ticker, price, time, secret, volume } = body;

    if (!action || !ticker) {
      return new Response(JSON.stringify({ error: "Missing required fields: action, ticker" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up the strategy to find the owner
    const { data: strategy, error: stratErr } = await supabase
      .from("strategies")
      .select("id, user_id, name")
      .eq("id", strategyId)
      .single();

    if (stratErr || !strategy) {
      return new Response(JSON.stringify({ error: "Strategy not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine trade side from action
    const side = action.toLowerCase() === "buy" ? "long" : "short";
    const tradeAction = action.toLowerCase();

    // Log the webhook signal as a bot trade
    const { data: trade, error: tradeErr } = await supabase
      .from("bot_trades")
      .insert({
        user_id: strategy.user_id,
        symbol: ticker.toUpperCase(),
        trade_type: "webhook",
        side: side,
        entry_price: parseFloat(price) || 0,
        quantity: 1,
        status: tradeAction === "buy" ? "open" : "closed",
        broker: "tradingview_webhook",
        entry_reason: `TradingView webhook: ${action} signal for ${strategy.name}`,
      })
      .select()
      .single();

    if (tradeErr) {
      console.error("Trade insert error:", tradeErr);
      return new Response(JSON.stringify({ error: "Failed to log trade" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Webhook processed: ${action} ${ticker} @ ${price} for strategy ${strategy.name}`);

    return new Response(JSON.stringify({
      success: true,
      message: `${action} signal processed for ${ticker}`,
      tradeId: trade.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
