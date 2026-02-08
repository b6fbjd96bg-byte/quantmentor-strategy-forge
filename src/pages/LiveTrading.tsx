import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Zap, Bot, TrendingUp, TrendingDown, Activity, Play, Pause,
  BarChart3, Settings, LogOut, LineChart, PieChart, ArrowUpRight,
  ArrowDownRight, Clock, CheckCircle2, XCircle, RefreshCw, Bell,
  BookOpen, Wifi, WifiOff, AlertTriangle, Shield
} from 'lucide-react';

interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  strategy: string;
  broker: string;
}

interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  status: 'executed' | 'pending' | 'cancelled';
  quantity: number;
  entryPrice: number;
  pnl: number;
  strategy: string;
  timestamp: Date;
}

const LiveTrading = () => {
  const [isLive, setIsLive] = useState(true);
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history'>('positions');
  const [brokerConnected, setBrokerConnected] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);

  const [positions, setPositions] = useState<Position[]>([
    { id: '1', symbol: 'BTC/USDT', side: 'long', quantity: 0.5, entryPrice: 42150, currentPrice: 42580, pnl: 215, pnlPercent: 1.02, strategy: 'Momentum Alpha', broker: 'Binance' },
    { id: '2', symbol: 'ETH/USDT', side: 'long', quantity: 3.2, entryPrice: 2280, currentPrice: 2310, pnl: 96, pnlPercent: 1.32, strategy: 'Breakout Hunter', broker: 'Binance' },
    { id: '3', symbol: 'AAPL', side: 'short', quantity: 25, entryPrice: 182.50, currentPrice: 181.20, pnl: 32.5, pnlPercent: 0.71, strategy: 'Mean Reversion Pro', broker: 'Alpaca' },
    { id: '4', symbol: 'EUR/USD', side: 'long', quantity: 10000, entryPrice: 1.0875, currentPrice: 1.0892, pnl: 17, pnlPercent: 0.16, strategy: 'Scalper Elite', broker: 'OANDA' },
  ]);

  const [trades, setTrades] = useState<Trade[]>([
    { id: '1', symbol: 'BTC/USDT', type: 'buy', status: 'executed', quantity: 0.5, entryPrice: 42150, pnl: 215, strategy: 'Momentum Alpha', timestamp: new Date(Date.now() - 120000) },
    { id: '2', symbol: 'TSLA', type: 'sell', status: 'pending', quantity: 10, entryPrice: 248.50, pnl: 0, strategy: 'Swing Master', timestamp: new Date(Date.now() - 300000) },
    { id: '3', symbol: 'ETH/USDT', type: 'buy', status: 'executed', quantity: 3.2, entryPrice: 2280, pnl: 96, strategy: 'Breakout Hunter', timestamp: new Date(Date.now() - 900000) },
  ]);

  const [marketData, setMarketData] = useState({
    btc: { price: 42580, change: 2.4 },
    eth: { price: 2310, change: 1.8 },
    spy: { price: 485.20, change: 0.35 },
    eur: { price: 1.0892, change: -0.12 },
  });

  const supportedBrokers = [
    { id: 'binance', name: 'Binance', markets: 'Crypto', status: 'Available' },
    { id: 'delta', name: 'Delta Exchange', markets: 'Crypto Derivatives', status: 'Available' },
    { id: 'bybit', name: 'Bybit', markets: 'Crypto', status: 'Available' },
    { id: 'kucoin', name: 'KuCoin', markets: 'Crypto', status: 'Available' },
    { id: 'zerodha', name: 'Zerodha', markets: 'Indian Stocks', status: 'Available' },
    { id: 'upstox', name: 'Upstox', markets: 'Indian Stocks', status: 'Available' },
    { id: 'ibkr', name: 'Interactive Brokers', markets: 'Global', status: 'Available' },
    { id: 'alpaca', name: 'Alpaca', markets: 'US Stocks', status: 'Available' },
    { id: 'oanda', name: 'OANDA', markets: 'Forex', status: 'Available' },
  ];

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setPositions(prev => prev.map(pos => {
        const fluctuation = (Math.random() - 0.5) * 0.002;
        const newCurrent = pos.currentPrice * (1 + fluctuation);
        const newPnl = pos.side === 'long' 
          ? (newCurrent - pos.entryPrice) * pos.quantity 
          : (pos.entryPrice - newCurrent) * pos.quantity;
        const newPnlPercent = ((newCurrent - pos.entryPrice) / pos.entryPrice) * 100 * (pos.side === 'long' ? 1 : -1);
        return { ...pos, currentPrice: newCurrent, pnl: newPnl, pnlPercent: newPnlPercent };
      }));
      setMarketData(prev => ({
        btc: { price: prev.btc.price * (1 + (Math.random() - 0.5) * 0.001), change: prev.btc.change + (Math.random() - 0.5) * 0.1 },
        eth: { price: prev.eth.price * (1 + (Math.random() - 0.5) * 0.001), change: prev.eth.change + (Math.random() - 0.5) * 0.1 },
        spy: { price: prev.spy.price * (1 + (Math.random() - 0.5) * 0.0005), change: prev.spy.change + (Math.random() - 0.5) * 0.05 },
        eur: { price: prev.eur.price * (1 + (Math.random() - 0.5) * 0.0001), change: prev.eur.change + (Math.random() - 0.5) * 0.02 },
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isLive]);

  const totalPnl = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalValue = positions.reduce((sum, pos) => sum + (pos.currentPrice * pos.quantity), 0);

  const handleConnectBroker = (brokerId: string) => {
    setSelectedBroker(brokerId);
    toast.info('Broker connection requires API keys. Go to Settings → Broker Connection to set up.');
  };

  const handleClosePosition = (posId: string) => {
    toast.success('Position close order submitted');
    setPositions(prev => prev.filter(p => p.id !== posId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'executed': return <CheckCircle2 className="w-4 h-4 text-accent" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border p-6 flex flex-col z-50">
        <Link to="/" className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">QuantMentor</span>
        </Link>
        <nav className="flex-1 space-y-2">
          {[
            { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
            { icon: TrendingUp, label: 'Chart Analysis', href: '/chart-analysis' },
            { icon: Bot, label: 'AI Strategies', href: '/ai-strategies' },
            { icon: LineChart, label: 'Live Trading', active: true, href: '/live-trading' },
            { icon: BookOpen, label: 'Trade Journal', href: '/trade-journal' },
            { icon: PieChart, label: 'Analytics', href: '/analytics' },
            { icon: Settings, label: 'Settings', href: '/settings' },
          ].map((item, i) => (
            <Link key={i} to={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                item.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}>
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="pt-4 border-t border-border">
          <Link to="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1 flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              Live Trading
              {isLive && (
                <motion.span animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-3 h-3 rounded-full bg-accent" />
              )}
            </h1>
            <p className="text-muted-foreground">
              Monitor positions, execute trades, and connect your broker accounts.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2"><Bell className="w-4 h-4" />Alerts</Button>
            <Button variant={isLive ? "hero" : "outline"} onClick={() => setIsLive(!isLive)} className="gap-2">
              {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isLive ? 'Pause Feed' : 'Resume Feed'}
            </Button>
          </div>
        </div>

        {/* Market Ticker */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-4 mb-6 overflow-x-auto">
          <div className="flex items-center gap-8 min-w-max">
            {[
              { label: 'BTC/USDT', ...marketData.btc },
              { label: 'ETH/USDT', ...marketData.eth },
              { label: 'SPY', ...marketData.spy },
              { label: 'EUR/USD', ...marketData.eur },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-muted-foreground font-medium">{item.label}</span>
                <motion.span key={item.price} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="font-bold">
                  ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: item.price < 10 ? 4 : 2 })}
                </motion.span>
                <span className={`flex items-center text-sm ${item.change >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  {item.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(item.change).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, positive: totalPnl >= 0, icon: TrendingUp },
            { label: 'Open Positions', value: positions.length.toString(), icon: Activity },
            { label: 'Portfolio Value', value: `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: BarChart3 },
            { label: 'Connected Brokers', value: brokerConnected ? '1' : '0', icon: Wifi },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5 text-primary" />
                {stat.positive !== undefined && (
                  <span className={stat.positive ? 'text-accent' : 'text-destructive'}>
                    {stat.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`font-display text-2xl font-bold ${stat.positive !== undefined ? (stat.positive ? 'text-accent' : 'text-destructive') : ''}`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Broker Connection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-6 mb-8">
          <h2 className="font-display text-xl font-bold mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Connect Your Broker
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your trading account to enable live execution. All API keys are encrypted and stored securely.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {supportedBrokers.map((broker) => (
              <motion.button key={broker.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleConnectBroker(broker.id)}
                className={`p-4 rounded-xl border transition-colors text-left ${
                  selectedBroker === broker.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/30 bg-muted/20'
                }`}>
                <p className="font-bold text-sm mb-1">{broker.name}</p>
                <p className="text-xs text-muted-foreground">{broker.markets}</p>
              </motion.button>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-yellow-400">Paper Trading Mode:</strong> Currently using simulated data. 
              To connect real APIs, go to <Link to="/settings" className="text-primary underline">Settings → Broker Connection</Link> and enter your API credentials.
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['positions', 'orders', 'history'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}>{tab}</button>
          ))}
        </div>

        {/* Content */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-card rounded-2xl border border-border overflow-hidden">
          {activeTab === 'positions' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Symbol</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Side</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Broker</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Qty</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Entry</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Current</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">P&L</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Strategy</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <motion.tr key={pos.id} layout className="border-t border-border hover:bg-muted/20">
                      <td className="p-4 font-medium">{pos.symbol}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          pos.side === 'long' ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'
                        }`}>{pos.side.toUpperCase()}</span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{pos.broker}</td>
                      <td className="p-4 text-right">{pos.quantity}</td>
                      <td className="p-4 text-right">${pos.entryPrice.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <motion.span key={pos.currentPrice}>
                          ${pos.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </motion.span>
                      </td>
                      <td className={`p-4 text-right font-medium ${pos.pnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
                        {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)} ({pos.pnlPercent.toFixed(2)}%)
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{pos.strategy}</td>
                      <td className="p-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => handleClosePosition(pos.id)}>Close</Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Symbol</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Quantity</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Price</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Strategy</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <tr key={trade.id} className="border-t border-border hover:bg-muted/20">
                      <td className="p-4">{getStatusIcon(trade.status)}</td>
                      <td className="p-4 font-medium">{trade.symbol}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.type === 'buy' ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'
                        }`}>{trade.type.toUpperCase()}</span>
                      </td>
                      <td className="p-4 text-right">{trade.quantity}</td>
                      <td className="p-4 text-right">${trade.entryPrice.toLocaleString()}</td>
                      <td className="p-4 text-sm text-muted-foreground">{trade.strategy}</td>
                      <td className="p-4 text-sm text-muted-foreground">{trade.timestamp.toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Trade history will appear here</p>
              <p className="text-xs text-muted-foreground mb-4">Connect a broker to see your historical trades</p>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Load History
              </Button>
            </div>
          )}
        </motion.div>

        {/* Disclaimer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-muted/30 rounded-xl border border-border">
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ <strong>Paper Trading Mode:</strong> All positions shown are simulated. Connect your broker API keys in Settings to enable live trading.
            Trading involves substantial risk. Past performance is not indicative of future results.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default LiveTrading;
