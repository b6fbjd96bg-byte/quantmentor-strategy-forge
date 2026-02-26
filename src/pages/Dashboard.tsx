import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Zap, TrendingUp, TrendingDown, DollarSign, BarChart3, Settings, LogOut,
  Plus, Activity, Clock, Target, ChevronRight, Bot, LineChart, PieChart,
  RefreshCw, Menu, BookOpen, Sparkles, ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import OnboardingTour from '@/components/onboarding/OnboardingTour';

interface Strategy {
  id: string;
  name: string;
  strategy_type: string;
  markets: string[];
  status: string;
  created_at: string;
  description: string | null;
}

interface Profile {
  full_name: string | null;
  email: string | null;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [totalTrades, setTotalTrades] = useState(0);
  const [totalPnl, setTotalPnl] = useState(0);
  const [activeBots, setActiveBots] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate('/auth');
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { navigate('/auth'); }
      else { setUser(session.user); fetchData(session.user.id); }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchData = async (userId: string) => {
    setIsLoading(true);
    try {
      const [profileRes, strategiesRes, tradesRes, botsRes, journalRes] = await Promise.all([
        supabase.from('profiles').select('full_name, email').eq('user_id', userId).maybeSingle(),
        supabase.from('strategies').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('bot_trades').select('profit_loss').eq('user_id', userId),
        supabase.from('strategy_bots').select('id, status').eq('user_id', userId).eq('status', 'running'),
        supabase.from('trade_journal').select('profit_loss').eq('user_id', userId).eq('status', 'closed'),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (strategiesRes.data) setStrategies(strategiesRes.data);
      
      // Calculate total trades and P&L from both bot_trades and trade_journal
      const botTradeCount = tradesRes.data?.length || 0;
      const journalTradeCount = journalRes.data?.length || 0;
      setTotalTrades(botTradeCount + journalTradeCount);
      
      const botPnl = tradesRes.data?.reduce((sum, t) => sum + (Number(t.profit_loss) || 0), 0) || 0;
      const journalPnl = journalRes.data?.reduce((sum, t) => sum + (Number(t.profit_loss) || 0), 0) || 0;
      setTotalPnl(botPnl + journalPnl);
      
      setActiveBots(botsRes.data?.length || 0);
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

  const navItems = [
    { icon: BarChart3, label: 'Dashboard', active: true, href: '/dashboard' },
    { icon: TrendingUp, label: 'Chart Analysis', href: '/chart-analysis' },
    { icon: Bot, label: 'AI Strategies', href: '/ai-strategies' },
    { icon: LineChart, label: 'Live Trading', href: '/live-trading' },
    { icon: BookOpen, label: 'Trade Journal', href: '/trade-journal' },
    { icon: PieChart, label: 'Analytics', href: '/analytics' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const quickModules = [
    {
      icon: TrendingUp, title: 'AI Chart Analysis', desc: 'Upload TradingView screenshots for AI-powered pattern recognition & trade setups',
      href: '/chart-analysis', color: 'from-primary/20 to-cyan-500/20', iconColor: 'text-primary'
    },
    {
      icon: Bot, title: 'AI Strategies', desc: 'Browse pre-built AI trading strategies with backtested performance data',
      href: '/ai-strategies', color: 'from-accent/20 to-green-500/20', iconColor: 'text-accent'
    },
    {
      icon: LineChart, title: 'Live Trading', desc: 'Monitor real-time positions, execute trades via connected broker APIs',
      href: '/live-trading', color: 'from-yellow-500/20 to-orange-500/20', iconColor: 'text-yellow-400'
    },
    {
      icon: BookOpen, title: 'Trade Journal', desc: 'Log & review trades with emotions, strategy tags, and lessons learned',
      href: '/trade-journal', color: 'from-purple-500/20 to-pink-500/20', iconColor: 'text-purple-400'
    },
    {
      icon: PieChart, title: 'Analytics', desc: 'Deep dive into your trading performance with charts and win-rate analysis',
      href: '/analytics', color: 'from-blue-500/20 to-indigo-500/20', iconColor: 'text-blue-400'
    },
    {
      icon: DollarSign, title: 'Capital Allocation', desc: 'Allocate capital across qualified strategies with automated risk controls',
      href: '/capital-allocation', color: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-400'
    },
  ];

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
          {navItems.map((item, i) => (
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
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card border border-border">
        <Menu className="w-5 h-5" />
      </button>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} p-8`}>
        {/* Welcome Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">
              Welcome back, {profile?.full_name || 'Trader'} 👋
            </h1>
            <p className="text-muted-foreground">
              Your command center for AI-powered trading. Navigate to any module below.
            </p>
          </div>
          <Link to="/submit-strategy">
            <Button variant="hero" className="gap-2">
              <Plus className="w-5 h-5" />
              Create Strategy
            </Button>
          </Link>
        </div>

        {/* Quick Stats - Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Strategies', value: strategies.length.toString(), sub: 'Created', icon: Bot, color: 'primary' },
            { label: 'Active Bots', value: activeBots.toString(), sub: 'Running', icon: Activity, color: 'accent' },
            { label: 'Total Trades', value: totalTrades.toString(), sub: 'Executed', icon: Target, color: 'primary' },
            { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, sub: totalPnl >= 0 ? 'Profit' : 'Loss', icon: DollarSign, color: totalPnl >= 0 ? 'accent' : 'primary' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color === 'primary' ? 'text-primary' : 'text-accent'}`} />
                </div>
                <span className="text-xs text-muted-foreground">{stat.sub}</span>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="font-display text-2xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Module Cards */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Trading Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickModules.map((mod, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                whileHover={{ y: -4, scale: 1.01 }}
              >
                <Link to={mod.href} className="block bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-all group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-4`}>
                    <mod.icon className={`w-6 h-6 ${mod.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{mod.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{mod.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Your Strategies */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold">Your Strategies</h2>
            <Link to="/submit-strategy" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
              + Create New <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {strategies.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">No strategies yet</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first AI-powered trading bot to get started</p>
              <Link to="/submit-strategy">
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Trading Bot
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {strategies.slice(0, 6).map((strategy, index) => (
                <motion.div key={strategy.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{strategy.name}</p>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      strategy.status === 'active' ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
                    }`}>{strategy.status}</span>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl border border-primary/20 p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-bold mb-2">Ready to analyze your next trade?</h3>
              <p className="text-muted-foreground">Upload a chart screenshot and get AI-powered analysis in seconds.</p>
            </div>
            <div className="flex gap-4">
              <Link to="/chart-analysis">
                <Button variant="hero" className="gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Chart Analysis
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
