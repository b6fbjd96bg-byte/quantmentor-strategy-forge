import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Zap, 
  BarChart3, 
  Settings, 
  LogOut,
  Bot,
  LineChart,
  PieChart,
  Menu,
  TrendingUp,
  Sparkles,
  BookOpen
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import TradingViewChartAI from '@/components/dashboard/TradingViewChartAI';
import { toast } from 'sonner';

const ChartAnalysis = () => {
  const [user, setUser] = useState<User | null>(null);
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
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

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
            { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
            { icon: TrendingUp, label: 'Chart Analysis', active: true, href: '/chart-analysis' },
            { icon: Bot, label: 'AI Strategies', href: '/ai-strategies' },
            { icon: LineChart, label: 'Live Trading', href: '/live-trading' },
            { icon: BookOpen, label: 'Trade Journal', href: '/trade-journal' },
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
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold flex items-center gap-2">
                AI Chart Analysis
                <Sparkles className="w-6 h-6 text-gold" />
              </h1>
              <p className="text-muted-foreground">
                Upload TradingView chart screenshots for AI-powered analysis and predictions
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 via-accent/10 to-gold/10 border border-primary/20 rounded-xl p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <Bot className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">How to use the AI Chart Analyzer</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• Open TradingView, navigate to any chart, and take a screenshot</li>
                <li>• Upload, paste (Ctrl+V), or drag & drop the screenshot here</li>
                <li>• The AI will analyze patterns, indicators, and price action from the image</li>
                <li>• Get specific entry points, stop-losses, and price targets</li>
                <li>• Ask follow-up questions or challenge the AI's predictions</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Chart AI Analyzer */}
        <TradingViewChartAI />

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-muted/30 rounded-xl border border-border"
        >
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ <strong>Disclaimer:</strong> AI predictions are for educational and demonstration purposes only. 
            This is not financial advice. Always do your own research and consult with a financial advisor 
            before making trading decisions. Past performance does not guarantee future results.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default ChartAnalysis;
