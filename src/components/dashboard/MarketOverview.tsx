import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, TrendingUp, TrendingDown, Clock, Flame, Star, ChevronDown, ChevronUp } from 'lucide-react';

interface MarketItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  category: 'crypto' | 'stock' | 'forex';
  isHot?: boolean;
}

const MarketOverview = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'crypto' | 'stocks' | 'forex'>('crypto');
  const [sortBy, setSortBy] = useState<'change' | 'volume'>('change');
  const [sortAsc, setSortAsc] = useState(false);
  
  const [markets, setMarkets] = useState<MarketItem[]>([
    // Major Cryptos
    { symbol: 'BTC', name: 'Bitcoin', price: 42580, change: 2.4, volume: '28.5B', category: 'crypto', isHot: true },
    { symbol: 'ETH', name: 'Ethereum', price: 2310, change: 1.8, volume: '12.3B', category: 'crypto', isHot: true },
    { symbol: 'BNB', name: 'BNB', price: 312.50, change: 0.9, volume: '1.2B', category: 'crypto' },
    { symbol: 'SOL', name: 'Solana', price: 98.75, change: 5.2, volume: '2.8B', category: 'crypto', isHot: true },
    { symbol: 'XRP', name: 'Ripple', price: 0.5234, change: -1.2, volume: '1.5B', category: 'crypto' },
    { symbol: 'ADA', name: 'Cardano', price: 0.4821, change: 0.7, volume: '420M', category: 'crypto' },
    { symbol: 'AVAX', name: 'Avalanche', price: 35.42, change: 3.8, volume: '890M', category: 'crypto', isHot: true },
    { symbol: 'DOGE', name: 'Dogecoin', price: 0.0823, change: -0.5, volume: '650M', category: 'crypto' },
    { symbol: 'DOT', name: 'Polkadot', price: 7.25, change: 1.1, volume: '380M', category: 'crypto' },
    { symbol: 'LINK', name: 'Chainlink', price: 14.82, change: 2.9, volume: '520M', category: 'crypto' },
    { symbol: 'MATIC', name: 'Polygon', price: 0.8542, change: 4.1, volume: '410M', category: 'crypto', isHot: true },
    { symbol: 'UNI', name: 'Uniswap', price: 6.12, change: 1.5, volume: '180M', category: 'crypto' },
    { symbol: 'ATOM', name: 'Cosmos', price: 9.85, change: -0.8, volume: '240M', category: 'crypto' },
    { symbol: 'LTC', name: 'Litecoin', price: 72.35, change: 0.4, volume: '320M', category: 'crypto' },
    { symbol: 'FIL', name: 'Filecoin', price: 5.42, change: 6.2, volume: '290M', category: 'crypto', isHot: true },
    // DeFi & Layer 2
    { symbol: 'ARB', name: 'Arbitrum', price: 1.12, change: 3.5, volume: '380M', category: 'crypto' },
    { symbol: 'OP', name: 'Optimism', price: 2.45, change: 4.8, volume: '210M', category: 'crypto', isHot: true },
    { symbol: 'INJ', name: 'Injective', price: 24.50, change: 7.2, volume: '165M', category: 'crypto', isHot: true },
    { symbol: 'NEAR', name: 'NEAR Protocol', price: 3.82, change: 2.1, volume: '195M', category: 'crypto' },
    { symbol: 'APT', name: 'Aptos', price: 8.95, change: 1.9, volume: '175M', category: 'crypto' },
    { symbol: 'SUI', name: 'Sui', price: 1.35, change: 5.5, volume: '220M', category: 'crypto', isHot: true },
    // Stocks
    { symbol: 'SPY', name: 'S&P 500 ETF', price: 485.20, change: 0.35, volume: '85.2M', category: 'stock' },
    { symbol: 'AAPL', name: 'Apple Inc.', price: 181.20, change: -0.45, volume: '52.1M', category: 'stock' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: 3.2, volume: '108.5M', category: 'stock', isHot: true },
    { symbol: 'NVDA', name: 'NVIDIA', price: 485.20, change: 2.8, volume: '42.3M', category: 'stock', isHot: true },
    { symbol: 'MSFT', name: 'Microsoft', price: 378.90, change: 0.65, volume: '22.1M', category: 'stock' },
    // Forex
    { symbol: 'EUR/USD', name: 'Euro/Dollar', price: 1.0892, change: -0.12, volume: '1.2T', category: 'forex' },
    { symbol: 'GBP/USD', name: 'Pound/Dollar', price: 1.2645, change: 0.08, volume: '890B', category: 'forex' },
    { symbol: 'USD/JPY', name: 'Dollar/Yen', price: 148.25, change: 0.22, volume: '750B', category: 'forex' },
  ]);

  // Simulate price updates with smooth animation
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets(prev => prev.map(market => ({
        ...market,
        price: market.price * (1 + (Math.random() - 0.5) * 0.002),
        change: market.change + (Math.random() - 0.5) * 0.15,
      })));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const marketStatus = {
    us: { label: 'US Market', status: 'Open', color: 'green' },
    eu: { label: 'EU Market', status: 'Closed', color: 'red' },
    crypto: { label: 'Crypto', status: '24/7', color: 'green' },
  };

  const filteredMarkets = markets
    .filter(m => activeTab === 'all' || 
      (activeTab === 'crypto' && m.category === 'crypto') ||
      (activeTab === 'stocks' && m.category === 'stock') ||
      (activeTab === 'forex' && m.category === 'forex'))
    .sort((a, b) => {
      const factor = sortAsc ? 1 : -1;
      return sortBy === 'change' ? (b.change - a.change) * factor : 0;
    });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.95 },
    show: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 200, damping: 20 }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.55, type: "spring", stiffness: 100 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            >
              <Globe className="w-5 h-5 text-primary" />
            </motion.div>
            <h2 className="font-display text-xl font-bold">Market Overview</h2>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {Object.values(marketStatus).map((m, i) => (
              <motion.div 
                key={i} 
                className="flex items-center gap-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <motion.span 
                  className={`w-1.5 h-1.5 rounded-full ${m.color === 'green' ? 'bg-green-500' : 'bg-red-500'}`}
                  animate={m.color === 'green' ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <span className="text-muted-foreground">{m.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {(['all', 'crypto', 'stocks', 'forex'] as const).map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === tab 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
          <div className="flex-1" />
          <motion.button
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            whileHover={{ scale: 1.05 }}
          >
            {sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Change
          </motion.button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        <motion.div 
          className="space-y-1"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          key={activeTab}
        >
          <AnimatePresence mode="popLayout">
            {filteredMarkets.map((market) => (
              <motion.div
                key={market.symbol}
                variants={itemVariants}
                layout
                whileHover={{ 
                  scale: 1.02, 
                  backgroundColor: 'rgba(var(--muted), 0.5)',
                  transition: { duration: 0.2 }
                }}
                className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-bold"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {market.symbol.slice(0, 2)}
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{market.symbol}</p>
                      {market.isHot && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <Flame className="w-3 h-3 text-orange-500" />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{market.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <motion.p 
                    key={market.price}
                    initial={{ opacity: 0.7, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-medium"
                  >
                    ${market.price.toLocaleString(undefined, { 
                      minimumFractionDigits: market.price < 10 ? 4 : 2,
                      maximumFractionDigits: market.price < 10 ? 4 : 2 
                    })}
                  </motion.p>
                  <motion.p 
                    className={`text-xs flex items-center justify-end gap-0.5 ${market.change >= 0 ? 'text-green-400' : 'text-red-400'}`}
                    animate={market.change > 3 || market.change < -3 ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {market.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {market.change >= 0 ? '+' : ''}{market.change.toFixed(2)}%
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer with hot movers */}
      <motion.div 
        className="p-3 border-t border-border bg-gradient-to-r from-orange-500/5 via-transparent to-green-500/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Flame className="w-3 h-3 text-orange-500" />
          <span className="font-medium">Hot:</span>
          <div className="flex items-center gap-2 overflow-x-auto">
            {markets.filter(m => m.isHot && m.change > 3).slice(0, 4).map(m => (
              <motion.span 
                key={m.symbol}
                className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 whitespace-nowrap"
                whileHover={{ scale: 1.1 }}
              >
                {m.symbol} +{m.change.toFixed(1)}%
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MarketOverview;
