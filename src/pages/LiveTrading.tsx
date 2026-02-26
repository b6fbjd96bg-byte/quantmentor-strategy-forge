import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Zap, Bot, TrendingUp, TrendingDown, Activity, Play, Pause,
  BarChart3, Settings, LogOut, LineChart, PieChart, ArrowUpRight,
  ArrowDownRight, Clock, CheckCircle2, XCircle, RefreshCw, Bell,
  BookOpen, Wifi, WifiOff, AlertTriangle, Shield
} from 'lucide-react';

interface BotTrade {
  id: string;
  symbol: string;
  side: string;
  quantity: number;
  entry_price: number;
  exit_price: number | null;
  profit_loss: number | null;
  profit_loss_percentage: number | null;
  status: string;
  broker: string;
  entry_reason: string | null;
  entry_time: string;
  trade_type: string;
}

interface BrokerConnection {
  id: string;
  broker: string;
  is_connected: boolean;
  is_paper_trading: boolean;
  connection_status: string | null;
}

const LiveTrading = () => {
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history'>('positions');
  const [openTrades, setOpenTrades] = useState<BotTrade[]>([]);
  const [closedTrades, setClosedTrades] = useState<BotTrade[]>([]);
  const [brokerConnections, setBrokerConnections] = useState<BrokerConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const supportedBrokers = [
    { id: 'binance', name: 'Binance', markets: 'Crypto' },
    { id: 'delta', name: 'Delta Exchange', markets: 'Crypto Derivatives' },
    { id: 'bybit', name: 'Bybit', markets: 'Crypto' },
    { id: 'kucoin', name: 'KuCoin', markets: 'Crypto' },
    { id: 'zerodha', name: 'Zerodha', markets: 'Indian Stocks' },
    { id: 'upstox', name: 'Upstox', markets: 'Indian Stocks' },
    { id: 'ibkr', name: 'Interactive Brokers', markets: 'Global' },
    { id: 'alpaca', name: 'Alpaca', markets: 'US Stocks' },
    { id: 'oanda', name: 'OANDA', markets: 'Forex' },
  ];

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/auth'); return; }
      const userId = session.user.id;

      const [openRes, closedRes, brokerRes] = await Promise.all([
        supabase.from('bot_trades').select('*').eq('user_id', userId).eq('status', 'open').order('entry_time', { ascending: false }),
        supabase.from('bot_trades').select('*').eq('user_id', userId).eq('status', 'closed').order('entry_time', { ascending: false }).limit(50),
        supabase.from('broker_connections').select('*').eq('user_id', userId),
      ]);

      setOpenTrades((openRes.data as BotTrade[]) || []);
      setClosedTrades((closedRes.data as BotTrade[]) || []);
      setBrokerConnections((brokerRes.data as BrokerConnection[]) || []);
      setIsLoading(false);
    };
    loadData();
  }, [navigate]);

  const totalPnl = openTrades.reduce((sum, t) => sum + (Number(t.profit_loss) || 0), 0);
  const connectedBrokers = brokerConnections.filter(b => b.is_connected).length;

  const handleConnectBroker = (brokerId: string) => {
    toast.info('Go to Settings → Broker Connection to set up API keys.');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <CheckCircle2 className="w-4 h-4 text-accent" />;
      case 'closed': return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
          <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
      </aside>

      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1 flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              Live Trading
            </h1>
            <p className="text-muted-foreground">Monitor positions, execute trades, and connect your broker accounts.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading trading data...</span>
          </div>
        ) : (
          <>
            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Open P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, positive: totalPnl >= 0, icon: TrendingUp },
                { label: 'Open Positions', value: openTrades.length.toString(), icon: Activity },
                { label: 'Closed Trades', value: closedTrades.length.toString(), icon: BarChart3 },
                { label: 'Connected Brokers', value: connectedBrokers.toString(), icon: Wifi },
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
                  <p className={`font-display text-2xl font-bold ${stat.positive !== undefined ? (stat.positive ? 'text-accent' : 'text-destructive') : ''}`}>{stat.value}</p>
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
              <p className="text-sm text-muted-foreground mb-4">Connect your trading account to enable live execution. All API keys are encrypted.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {supportedBrokers.map((broker) => {
                  const connected = brokerConnections.find(b => b.broker === broker.id);
                  return (
                    <motion.button key={broker.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleConnectBroker(broker.id)}
                      className={`p-4 rounded-xl border transition-colors text-left ${
                        connected?.is_connected
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-primary/30 bg-muted/20'
                      }`}>
                      <p className="font-bold text-sm mb-1">{broker.name}</p>
                      <p className="text-xs text-muted-foreground">{broker.markets}</p>
                      {connected?.is_connected && <p className="text-xs text-accent mt-1">Connected</p>}
                    </motion.button>
                  );
                })}
              </div>
              {connectedBrokers === 0 && (
                <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-yellow-400">No Broker Connected:</strong> Go to{' '}
                    <Link to="/settings" className="text-primary underline">Settings → Broker Connection</Link> to enter your API credentials.
                  </p>
                </div>
              )}
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
                openTrades.length === 0 ? (
                  <div className="p-8 text-center">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No open positions</p>
                    <p className="text-xs text-muted-foreground">Your active bot trades will appear here when a strategy opens a position.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Symbol</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Side</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Broker</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">Qty</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">Entry</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">P&L</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {openTrades.map((trade) => (
                          <tr key={trade.id} className="border-t border-border hover:bg-muted/20">
                            <td className="p-4 font-medium">{trade.symbol}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                trade.side === 'buy' ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'
                              }`}>{trade.side.toUpperCase()}</span>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">{trade.broker}</td>
                            <td className="p-4 text-right">{trade.quantity}</td>
                            <td className="p-4 text-right">${Number(trade.entry_price).toLocaleString()}</td>
                            <td className={`p-4 text-right font-medium ${(Number(trade.profit_loss) || 0) >= 0 ? 'text-accent' : 'text-destructive'}`}>
                              {(Number(trade.profit_loss) || 0) >= 0 ? '+' : ''}${(Number(trade.profit_loss) || 0).toFixed(2)}
                            </td>
                            <td className="p-4 text-sm text-muted-foreground truncate max-w-[200px]">{trade.entry_reason || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {activeTab === 'orders' && (
                <div className="p-8 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Pending orders will appear here</p>
                  <p className="text-xs text-muted-foreground">When your bots place limit orders, they'll show up in this tab.</p>
                </div>
              )}

              {activeTab === 'history' && (
                closedTrades.length === 0 ? (
                  <div className="p-8 text-center">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No trade history yet</p>
                    <p className="text-xs text-muted-foreground">Completed bot trades will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Symbol</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Side</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">Qty</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">Entry</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">Exit</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {closedTrades.map((trade) => (
                          <tr key={trade.id} className="border-t border-border hover:bg-muted/20">
                            <td className="p-4">{getStatusIcon(trade.status)}</td>
                            <td className="p-4 font-medium">{trade.symbol}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                trade.side === 'buy' ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'
                              }`}>{trade.side.toUpperCase()}</span>
                            </td>
                            <td className="p-4 text-right">{trade.quantity}</td>
                            <td className="p-4 text-right">${Number(trade.entry_price).toLocaleString()}</td>
                            <td className="p-4 text-right">{trade.exit_price ? `$${Number(trade.exit_price).toLocaleString()}` : '-'}</td>
                            <td className={`p-4 text-right font-medium ${(Number(trade.profit_loss) || 0) >= 0 ? 'text-accent' : 'text-destructive'}`}>
                              {(Number(trade.profit_loss) || 0) >= 0 ? '+' : ''}${(Number(trade.profit_loss) || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-6 p-4 bg-muted/30 rounded-xl border border-border">
              <p className="text-xs text-muted-foreground text-center">
                ⚠️ <strong>Note:</strong> Connect your broker API keys in Settings to enable live trading.
                Trading involves substantial risk. Past performance is not indicative of future results.
              </p>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

export default LiveTrading;
