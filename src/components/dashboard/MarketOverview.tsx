import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, TrendingUp, TrendingDown, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TradeMarketItem {
  market: string;
  count: number;
  totalPnl: number;
  winRate: number;
}

const MarketOverview = () => {
  const [markets, setMarkets] = useState<TradeMarketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setIsLoading(false); return; }

      const { data: trades } = await supabase
        .from('trade_journal')
        .select('market, profit_loss, status')
        .eq('user_id', session.user.id);

      if (trades && trades.length > 0) {
        const marketMap: Record<string, { count: number; pnl: number; wins: number; closed: number }> = {};
        trades.forEach(t => {
          if (!marketMap[t.market]) marketMap[t.market] = { count: 0, pnl: 0, wins: 0, closed: 0 };
          marketMap[t.market].count++;
          if (t.status === 'closed') {
            marketMap[t.market].closed++;
            marketMap[t.market].pnl += Number(t.profit_loss) || 0;
            if ((Number(t.profit_loss) || 0) > 0) marketMap[t.market].wins++;
          }
        });

        setMarkets(Object.entries(marketMap).map(([market, d]) => ({
          market,
          count: d.count,
          totalPnl: d.pnl,
          winRate: d.closed > 0 ? (d.wins / d.closed) * 100 : 0,
        })).sort((a, b) => b.count - a.count));
      }
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.55, type: "spring", stiffness: 100 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}>
            <Globe className="w-5 h-5 text-primary" />
          </motion.div>
          <h2 className="font-display text-xl font-bold">Your Markets</h2>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : markets.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No market data yet</p>
            <p className="text-xs text-muted-foreground">Log trades in your journal to see market breakdown.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {markets.map((market) => (
              <motion.div
                key={market.market}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{market.market}</p>
                  <p className="text-xs text-muted-foreground">{market.count} trades • {market.winRate.toFixed(0)}% win rate</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${market.totalPnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
                    {market.totalPnl >= 0 ? '+' : ''}${market.totalPnl.toFixed(2)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MarketOverview;
