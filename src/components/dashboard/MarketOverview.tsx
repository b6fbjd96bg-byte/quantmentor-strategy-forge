import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface MarketItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: string;
}

const MarketOverview = () => {
  const [markets, setMarkets] = useState<MarketItem[]>([
    { symbol: 'BTC', name: 'Bitcoin', price: 42580, change: 2.4, volume: '28.5B' },
    { symbol: 'ETH', name: 'Ethereum', price: 2310, change: 1.8, volume: '12.3B' },
    { symbol: 'SPY', name: 'S&P 500 ETF', price: 485.20, change: 0.35, volume: '85.2M' },
    { symbol: 'AAPL', name: 'Apple Inc.', price: 181.20, change: -0.45, volume: '52.1M' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: 3.2, volume: '108.5M' },
    { symbol: 'EUR/USD', name: 'Euro/Dollar', price: 1.0892, change: -0.12, volume: '1.2T' },
  ]);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets(prev => prev.map(market => ({
        ...market,
        price: market.price * (1 + (Math.random() - 0.5) * 0.001),
        change: market.change + (Math.random() - 0.5) * 0.1,
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const marketStatus = {
    us: { label: 'US Market', status: 'Open', color: 'green' },
    eu: { label: 'EU Market', status: 'Closed', color: 'red' },
    crypto: { label: 'Crypto', status: '24/7', color: 'green' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-bold">Market Overview</h2>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {Object.values(marketStatus).map((m, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${m.color === 'green' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {markets.map((market, index) => (
          <motion.div
            key={market.symbol}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.05 }}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-xs font-bold">
                {market.symbol.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium">{market.symbol}</p>
                <p className="text-xs text-muted-foreground">{market.name}</p>
              </div>
            </div>
            <div className="text-right">
              <motion.p 
                key={market.price}
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium"
              >
                ${market.price.toLocaleString(undefined, { 
                  minimumFractionDigits: market.price < 10 ? 4 : 2,
                  maximumFractionDigits: market.price < 10 ? 4 : 2 
                })}
              </motion.p>
              <p className={`text-xs flex items-center justify-end gap-0.5 ${market.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {market.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {market.change >= 0 ? '+' : ''}{market.change.toFixed(2)}%
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default MarketOverview;
