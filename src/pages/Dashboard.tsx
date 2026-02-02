import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  Activity,
  Clock,
  Target,
  ChevronRight,
  Bot,
  LineChart,
  PieChart,
  RefreshCw,
  Menu
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import BrokerConnection from '@/components/dashboard/BrokerConnection';
import LiveTradingPanel from '@/components/dashboard/LiveTradingPanel';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import QuickActions from '@/components/dashboard/QuickActions';
import MarketOverview from '@/components/dashboard/MarketOverview';
import TradingViewChat from '@/components/dashboard/TradingViewChat';
import AIStockAnalyzer from '@/components/dashboard/AIStockAnalyzer';
import StrategyBotCard from '@/components/dashboard/StrategyBotCard';
import BotTradesTable from '@/components/dashboard/BotTradesTable';
import BacktestChart from '@/components/dashboard/BacktestChart';

interface Strategy {
  id: string;
  name: string;
  strategy_type: string;
  markets: string[];
  status: string;
  created_at: string;
}

interface Profile {
  full_name: string | null;
  email: string | null;
}

interface StrategyBot {
  id: string;
  name: string;
  status: string;
  broker: string;
  ai_analysis: string | null;
  indicators: any[];
  entry_logic: string | null;
  exit_logic: string | null;
  created_at: string;
  backtest?: any;
}

interface BotTrade {
  id: string;
  symbol: string;
  side: string;
  trade_type: string;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  profit_loss: number;
  profit_loss_percentage: number;
  status: string;
  entry_time: string;
  exit_time: string | null;
  broker: string;
  entry_reason: string | null;
  exit_reason: string | null;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [bots, setBots] = useState<StrategyBot[]>([]);
  const [trades, setTrades] = useState<BotTrade[]>([]);
  const [selectedBacktest, setSelectedBacktest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchData = async (userId: string) => {
    setIsLoading(true);
    try {
      const [profileRes, strategiesRes, botsRes, tradesRes] = await Promise.all([
        supabase.from('profiles').select('full_name, email').eq('user_id', userId).maybeSingle(),
        supabase.from('strategies').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('strategy_bots').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('bot_trades').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (strategiesRes.data) setStrategies(strategiesRes.data);
      if (tradesRes.data) setTrades(tradesRes.data as BotTrade[]);

      // Fetch backtests for each bot
      if (botsRes.data) {
        const botsWithBacktests = await Promise.all(
          botsRes.data.map(async (bot: any) => {
            const { data: backtest } = await supabase
              .from('backtest_results')
              .select('*')
              .eq('bot_id', bot.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            return { ...bot, backtest };
          })
        );
        setBots(botsWithBacktests as StrategyBot[]);
        
        // Set the first bot's backtest as selected if available
        const firstBacktest = botsWithBacktests.find(b => b.backtest)?.backtest;
        if (firstBacktest) {
          setSelectedBacktest(firstBacktest);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const handleActivateBot = async (botId: string) => {
    const { error } = await supabase
      .from('strategy_bots')
      .update({ status: 'running' })
      .eq('id', botId);
    
    if (error) {
      toast.error('Failed to activate bot');
    } else {
      toast.success('Bot activated! Paper trading started.');
      setBots(prev => prev.map(b => b.id === botId ? { ...b, status: 'running' } : b));
    }
  };

  const handlePauseBot = async (botId: string) => {
    const { error } = await supabase
      .from('strategy_bots')
      .update({ status: 'paused' })
      .eq('id', botId);
    
    if (error) {
      toast.error('Failed to pause bot');
    } else {
      toast.success('Bot paused');
      setBots(prev => prev.map(b => b.id === botId ? { ...b, status: 'paused' } : b));
    }
  };

  // Calculate stats from real data
  const totalProfit = trades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
  const winningTrades = trades.filter(t => t.profit_loss > 0).length;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;
  const activeBots = bots.filter(b => b.status === 'running').length;

  const stats = {
    totalProfit,
    winRate,
    totalTrades: trades.length,
    activeBots,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-accent/20 text-accent';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'paused': return 'bg-muted text-muted-foreground';
      case 'processing': return 'bg-primary/20 text-primary';
      default: return 'bg-primary/20 text-primary';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <span className="text-lg text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: 0 }}
        animate={{ x: sidebarOpen ? 0 : -256 }}
        className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border p-6 flex flex-col z-50"
      >
        <Link to="/" className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">QuantMentor</span>
        </Link>

        <nav className="flex-1 space-y-2">
          {[
            { icon: BarChart3, label: 'Dashboard', active: true, href: '/dashboard' },
            { icon: Bot, label: 'AI Strategies', href: '/ai-strategies' },
            { icon: LineChart, label: 'Live Trading', href: '/live-trading' },
            { icon: PieChart, label: 'Analytics', href: '/analytics' },
            { icon: Settings, label: 'Settings', href: '/settings' },
          ].map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                item.active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="pt-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card border border-border"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} p-8`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">
              Welcome back, {profile?.full_name || 'Trader'}
            </h1>
            <p className="text-muted-foreground">
              Manage your AI trading bots and monitor performance.
            </p>
          </div>
          <Link to="/submit-strategy">
            <Button variant="hero" className="gap-2">
              <Plus className="w-5 h-5" />
              Create Bot
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Total P&L',
              value: `${stats.totalProfit >= 0 ? '+' : ''}$${stats.totalProfit.toFixed(2)}`,
              change: trades.length > 0 ? `${trades.length} trades` : 'No trades yet',
              changePositive: stats.totalProfit >= 0,
              icon: DollarSign,
              color: 'primary',
            },
            {
              label: 'Win Rate',
              value: `${stats.winRate.toFixed(1)}%`,
              change: `${winningTrades}/${trades.length} winning`,
              changePositive: stats.winRate >= 50,
              icon: Target,
              color: 'accent',
            },
            {
              label: 'Total Trades',
              value: stats.totalTrades.toString(),
              change: 'Across all bots',
              changePositive: true,
              icon: Activity,
              color: 'primary',
            },
            {
              label: 'Active Bots',
              value: stats.activeBots.toString(),
              change: `${bots.length} total bots`,
              changePositive: stats.activeBots > 0,
              icon: Bot,
              color: 'accent',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color === 'primary' ? 'text-primary' : 'text-accent'}`} />
                </div>
                <span className={`text-sm font-medium ${stat.changePositive ? 'text-accent' : 'text-destructive'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="font-display text-2xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Trading Bots Section */}
        {bots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Your Trading Bots
              </h2>
              <Link to="/submit-strategy" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                + Create New <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {bots.map((bot) => (
                <StrategyBotCard
                  key={bot.id}
                  bot={bot as any}
                  onActivate={handleActivateBot}
                  onPause={handlePauseBot}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Backtest Results */}
        {selectedBacktest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <BacktestChart result={selectedBacktest} />
          </motion.div>
        )}

        {/* Bot Trades */}
        {trades.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <BotTradesTable trades={trades} />
          </motion.div>
        )}

        {/* Main Grid - Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <BrokerConnection />
          <LiveTradingPanel />
        </div>

        {/* Main Grid - Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
          <MarketOverview />
        </div>

        {/* Main Grid - Row 2.5: AI Analyzer & Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AIStockAnalyzer />
          <TradingViewChat />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActions />
        </div>

        {/* Strategies List */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          className="bg-card rounded-2xl border border-border p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold">Your Strategies</h2>
            <Link to="/submit-strategy" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
              + Add New <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {strategies.length === 0 ? (
            <div className="text-center py-8">
              <motion.div 
                className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <Bot className="w-8 h-8 text-muted-foreground" />
              </motion.div>
              <p className="text-muted-foreground mb-4">No strategies yet</p>
              <Link to="/submit-strategy">
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Trading Bot
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {strategies.slice(0, 6).map((strategy, index) => (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{strategy.name}</p>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(strategy.status)}`}>
                      {strategy.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {strategy.strategy_type} • {strategy.markets.join(', ')}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl border border-primary/20 p-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-bold mb-2">
                Ready to automate more trades?
              </h3>
              <p className="text-muted-foreground">
                Create a new AI-powered trading bot or use our pre-built strategies.
              </p>
            </div>
            <div className="flex gap-4">
              <Link to="/submit-strategy">
                <Button variant="hero" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Create Bot
                </Button>
              </Link>
              <Link to="/ai-strategies">
                <Button variant="heroOutline" className="gap-2">
                  <Bot className="w-5 h-5" />
                  AI Strategies
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
