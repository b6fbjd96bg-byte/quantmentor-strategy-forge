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

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
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
      const [profileRes, strategiesRes] = await Promise.all([
        supabase.from('profiles').select('full_name, email').eq('user_id', userId).maybeSingle(),
        supabase.from('strategies').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (strategiesRes.data) setStrategies(strategiesRes.data);
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

  const mockStats = {
    totalProfit: 12847.32,
    profitChange: 8.4,
    winRate: 73.2,
    totalTrades: 1284,
    activeBots: 3,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-accent/20 text-accent';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'paused': return 'bg-muted text-muted-foreground';
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
            { icon: Bot, label: 'AI Strategies', href: '/coming-soon' },
            { icon: LineChart, label: 'Live Trading', href: '/coming-soon' },
            { icon: PieChart, label: 'Analytics', href: '/coming-soon' },
            { icon: Settings, label: 'Settings', href: '/coming-soon' },
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
              Here's what's happening with your trading bots today.
            </p>
          </div>
          <Link to="/submit-strategy">
            <Button variant="hero" className="gap-2">
              <Plus className="w-5 h-5" />
              New Strategy
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Total Profit',
              value: `$${mockStats.totalProfit.toLocaleString()}`,
              change: `+${mockStats.profitChange}%`,
              changePositive: true,
              icon: DollarSign,
              color: 'primary',
            },
            {
              label: 'Win Rate',
              value: `${mockStats.winRate}%`,
              change: '+2.1%',
              changePositive: true,
              icon: Target,
              color: 'accent',
            },
            {
              label: 'Total Trades',
              value: mockStats.totalTrades.toLocaleString(),
              change: '+128 this week',
              changePositive: true,
              icon: Activity,
              color: 'primary',
            },
            {
              label: 'Active Bots',
              value: mockStats.activeBots.toString(),
              change: 'All running',
              changePositive: true,
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

        {/* Main Grid - Row 3: Strategies */}
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
                  Submit Your First Strategy
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
                Submit a new strategy or use our pre-built AI strategies to start trading.
              </p>
            </div>
            <div className="flex gap-4">
              <Link to="/submit-strategy">
                <Button variant="hero" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Custom Strategy
                </Button>
              </Link>
              <Link to="/coming-soon">
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
