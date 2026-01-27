import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Pause, 
  Play, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Position {
  id: string;
  symbol: string;
  type: 'long' | 'short';
  entry: number;
  current: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
}

const LiveTradingPanel = () => {
  const [isLive, setIsLive] = useState(true);
  const [positions, setPositions] = useState<Position[]>([
    { id: '1', symbol: 'BTC/USD', type: 'long', entry: 42150, current: 42580, quantity: 0.5, pnl: 215, pnlPercent: 1.02 },
    { id: '2', symbol: 'ETH/USD', type: 'long', entry: 2280, current: 2310, quantity: 3.2, pnl: 96, pnlPercent: 1.32 },
    { id: '3', symbol: 'AAPL', type: 'short', entry: 182.50, current: 181.20, quantity: 25, pnl: 32.5, pnlPercent: 0.71 },
  ]);

  const [marketData, setMarketData] = useState({
    btc: { price: 42580, change: 2.4 },
    eth: { price: 2310, change: 1.8 },
    sol: { price: 98.75, change: 5.2 },
    bnb: { price: 312.50, change: 0.9 },
    xrp: { price: 0.5234, change: -1.2 },
    avax: { price: 35.42, change: 3.8 },
    doge: { price: 0.0823, change: -0.5 },
    link: { price: 14.82, change: 2.9 },
  });

  // Simulate live price updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setPositions(prev => prev.map(pos => {
        const fluctuation = (Math.random() - 0.5) * 0.002;
        const newCurrent = pos.current * (1 + fluctuation);
        const newPnl = pos.type === 'long' 
          ? (newCurrent - pos.entry) * pos.quantity 
          : (pos.entry - newCurrent) * pos.quantity;
        const newPnlPercent = ((newCurrent - pos.entry) / pos.entry) * 100 * (pos.type === 'long' ? 1 : -1);
        
        return {
          ...pos,
          current: newCurrent,
          pnl: newPnl,
          pnlPercent: newPnlPercent,
        };
      }));

      setMarketData(prev => {
        const update = (p: number, c: number, volatility = 0.001) => ({
          price: p * (1 + (Math.random() - 0.5) * volatility),
          change: c + (Math.random() - 0.5) * 0.1
        });
        return {
          btc: update(prev.btc.price, prev.btc.change),
          eth: update(prev.eth.price, prev.eth.change),
          sol: update(prev.sol.price, prev.sol.change, 0.002),
          bnb: update(prev.bnb.price, prev.bnb.change),
          xrp: update(prev.xrp.price, prev.xrp.change),
          avax: update(prev.avax.price, prev.avax.change, 0.0015),
          doge: update(prev.doge.price, prev.doge.change, 0.002),
          link: update(prev.link.price, prev.link.change),
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const totalPnl = positions.reduce((sum, pos) => sum + pos.pnl, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="w-5 h-5 text-primary" />
            {isLive && (
              <motion.span
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"
              />
            )}
          </div>
          <h2 className="font-display text-xl font-bold">Live Trading</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isLive ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
            {isLive ? 'LIVE' : 'PAUSED'}
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsLive(!isLive)}
          className="gap-2"
        >
          {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isLive ? 'Pause' : 'Resume'}
        </Button>
      </div>

      {/* Market Ticker - Scrolling Animation */}
      <div className="relative overflow-hidden bg-muted/30 border-b border-border">
        <motion.div 
          className="flex items-center gap-6 px-6 py-3"
          animate={{ x: [0, -50, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          {[
            { label: 'BTC', ...marketData.btc },
            { label: 'ETH', ...marketData.eth },
            { label: 'SOL', ...marketData.sol },
            { label: 'BNB', ...marketData.bnb },
            { label: 'XRP', ...marketData.xrp },
            { label: 'AVAX', ...marketData.avax },
            { label: 'DOGE', ...marketData.doge },
            { label: 'LINK', ...marketData.link },
          ].map((item, index) => (
            <motion.div 
              key={index} 
              className="flex items-center gap-2 whitespace-nowrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
              <motion.span 
                className="text-sm font-medium"
                key={item.price}
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
              >
                ${item.price.toLocaleString(undefined, { maximumFractionDigits: item.price < 1 ? 4 : 2 })}
              </motion.span>
              <motion.span 
                className={`text-xs flex items-center ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}
                animate={Math.abs(item.change) > 3 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                {item.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(item.change).toFixed(2)}%
              </motion.span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Open Positions */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Open Positions</h3>
          <div className={`text-sm font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
                    position.type === 'long' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {position.type === 'long' ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{position.symbol}</p>
                    <p className="text-xs text-muted-foreground">
                      {position.quantity} @ ${position.entry.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <motion.p 
                    key={position.current}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium"
                  >
                    ${position.current.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </motion.p>
                  <p className={`text-xs font-medium ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)} ({position.pnlPercent.toFixed(2)}%)
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-border flex gap-3">
          <Button variant="outline" size="sm" className="flex-1 gap-2">
            <Zap className="w-4 h-4" />
            Quick Trade
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-2">
            <AlertCircle className="w-4 h-4" />
            Set Alert
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveTradingPanel;
