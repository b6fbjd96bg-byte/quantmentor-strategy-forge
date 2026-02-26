import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Activity, Zap, AlertCircle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Position {
  id: string;
  symbol: string;
  side: string;
  entry_price: number;
  quantity: number;
  profit_loss: number | null;
  profit_loss_percentage: number | null;
}

const LiveTradingPanel = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setIsLoading(false); return; }

      const { data } = await supabase
        .from('bot_trades')
        .select('id, symbol, side, entry_price, quantity, profit_loss, profit_loss_percentage')
        .eq('user_id', session.user.id)
        .eq('status', 'open')
        .order('entry_time', { ascending: false })
        .limit(5);

      setPositions((data as Position[]) || []);
      setIsLoading(false);
    };
    load();
  }, []);

  const totalPnl = positions.reduce((sum, pos) => sum + (Number(pos.profit_loss) || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-bold">Open Positions</h2>
        </div>
        <Link to="/live-trading">
          <Button variant="outline" size="sm" className="gap-2">
            View All
          </Button>
        </Link>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : positions.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No open positions</p>
            <p className="text-xs text-muted-foreground">Activate a strategy bot to start trading.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Open Positions</h3>
              <div className={`text-sm font-bold ${totalPnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
                P&L: {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {positions.map((position) => (
                  <motion.div
                    key={position.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        position.side === 'buy' ? 'bg-accent/20' : 'bg-destructive/20'
                      }`}>
                        {position.side === 'buy' ? (
                          <TrendingUp className="w-4 h-4 text-accent" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{position.symbol}</p>
                        <p className="text-xs text-muted-foreground">
                          {position.quantity} @ ${Number(position.entry_price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${(Number(position.profit_loss) || 0) >= 0 ? 'text-accent' : 'text-destructive'}`}>
                        {(Number(position.profit_loss) || 0) >= 0 ? '+' : ''}${(Number(position.profit_loss) || 0).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        <div className="mt-4 pt-4 border-t border-border flex gap-3">
          <Link to="/live-trading" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Zap className="w-4 h-4" />
              Live Trading
            </Button>
          </Link>
          <Link to="/ai-strategies" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <AlertCircle className="w-4 h-4" />
              Strategies
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveTradingPanel;
