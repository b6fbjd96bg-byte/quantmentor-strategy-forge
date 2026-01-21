import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Bot, 
  TrendingUp, 
  Shield, 
  Clock, 
  Target,
  ChevronRight,
  Star,
  Play,
  Pause,
  BarChart3,
  Settings,
  LogOut,
  LineChart,
  PieChart,
  ArrowUpRight,
  Sparkles,
  Cpu,
  Brain
} from 'lucide-react';

interface AIStrategy {
  id: string;
  name: string;
  description: string;
  type: 'momentum' | 'mean-reversion' | 'breakout' | 'scalping' | 'swing';
  markets: string[];
  winRate: number;
  avgReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  subscribers: number;
  isActive: boolean;
  monthlyPerformance: number[];
}

const aiStrategies: AIStrategy[] = [
  {
    id: '1',
    name: 'Momentum Alpha',
    description: 'AI-powered momentum strategy that identifies strong trending assets and rides the wave with dynamic position sizing.',
    type: 'momentum',
    markets: ['Crypto', 'Stocks'],
    winRate: 68.5,
    avgReturn: 12.4,
    riskLevel: 'medium',
    subscribers: 2847,
    isActive: true,
    monthlyPerformance: [5.2, 3.8, -1.2, 8.4, 6.1, 4.3],
  },
  {
    id: '2',
    name: 'Mean Reversion Pro',
    description: 'Statistical arbitrage strategy that capitalizes on price deviations from historical averages.',
    type: 'mean-reversion',
    markets: ['Forex', 'Stocks'],
    winRate: 72.3,
    avgReturn: 8.7,
    riskLevel: 'low',
    subscribers: 1923,
    isActive: true,
    monthlyPerformance: [2.1, 4.2, 3.5, 2.8, 5.1, 3.9],
  },
  {
    id: '3',
    name: 'Breakout Hunter',
    description: 'Detects and trades breakouts from consolidation patterns with AI-enhanced entry timing.',
    type: 'breakout',
    markets: ['Crypto', 'Futures'],
    winRate: 58.2,
    avgReturn: 18.9,
    riskLevel: 'high',
    subscribers: 3421,
    isActive: false,
    monthlyPerformance: [12.4, -3.2, 15.8, 8.2, -2.1, 22.3],
  },
  {
    id: '4',
    name: 'Scalper Elite',
    description: 'High-frequency micro-profit strategy designed for volatile market conditions.',
    type: 'scalping',
    markets: ['Crypto', 'Forex'],
    winRate: 76.8,
    avgReturn: 5.2,
    riskLevel: 'medium',
    subscribers: 1567,
    isActive: true,
    monthlyPerformance: [1.8, 2.1, 1.5, 2.4, 1.9, 2.2],
  },
  {
    id: '5',
    name: 'Swing Master',
    description: 'Medium-term swing trading strategy capturing multi-day price movements with AI trend analysis.',
    type: 'swing',
    markets: ['Stocks', 'ETFs'],
    winRate: 64.1,
    avgReturn: 15.3,
    riskLevel: 'medium',
    subscribers: 2156,
    isActive: true,
    monthlyPerformance: [4.5, 6.2, 3.8, 7.1, 5.4, 4.9],
  },
  {
    id: '6',
    name: 'Crypto Night Owl',
    description: 'Specialized for overnight crypto market movements, leveraging 24/7 market dynamics.',
    type: 'momentum',
    markets: ['Crypto'],
    winRate: 61.4,
    avgReturn: 21.7,
    riskLevel: 'high',
    subscribers: 4102,
    isActive: true,
    monthlyPerformance: [8.3, -2.1, 14.2, 11.5, 6.8, 9.4],
  },
];

const AIStrategies = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [strategies, setStrategies] = useState(aiStrategies);

  const filters = ['all', 'momentum', 'mean-reversion', 'breakout', 'scalping', 'swing'];

  const filteredStrategies = activeFilter === 'all' 
    ? strategies 
    : strategies.filter(s => s.type === activeFilter);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-accent/20 text-accent';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const toggleStrategy = (id: string) => {
    setStrategies(prev => prev.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));
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
            { icon: Bot, label: 'AI Strategies', active: true, href: '/ai-strategies' },
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
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
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
              <Sparkles className="w-8 h-8 text-primary" />
              AI Trading Strategies
            </h1>
            <p className="text-muted-foreground">
              Pre-built AI strategies ready to deploy. No coding required.
            </p>
          </div>
          <Link to="/submit-strategy">
            <Button variant="hero" className="gap-2">
              <Brain className="w-5 h-5" />
              Create Custom Strategy
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Strategies', value: '6', icon: Bot, color: 'primary' },
            { label: 'Active Now', value: '5', icon: Play, color: 'accent' },
            { label: 'Avg. Win Rate', value: '66.9%', icon: Target, color: 'primary' },
            { label: 'Total Subscribers', value: '16K+', icon: Star, color: 'accent' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'} flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color === 'primary' ? 'text-primary' : 'text-accent'}`} />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="font-display text-2xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {filter === 'all' ? 'All Strategies' : filter.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Strategies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStrategies.map((strategy, index) => (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold">{strategy.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{strategy.type.replace('-', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleStrategy(strategy.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    strategy.isActive ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {strategy.isActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {strategy.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {strategy.markets.map((market) => (
                  <span key={market} className="px-2 py-1 rounded-md bg-muted/50 text-xs">
                    {market}
                  </span>
                ))}
                <span className={`px-2 py-1 rounded-md text-xs capitalize ${getRiskColor(strategy.riskLevel)}`}>
                  {strategy.riskLevel} risk
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                  <p className="font-bold text-accent">{strategy.winRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Return</p>
                  <p className="font-bold text-accent">+{strategy.avgReturn}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Subscribers</p>
                  <p className="font-bold">{strategy.subscribers.toLocaleString()}</p>
                </div>
              </div>

              {/* Mini Performance Chart */}
              <div className="flex items-end gap-1 h-12 mb-4">
                {strategy.monthlyPerformance.map((perf, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${perf >= 0 ? 'bg-accent' : 'bg-destructive'}`}
                    style={{ height: `${Math.abs(perf) * 3 + 10}%` }}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <BarChart3 className="w-4 h-4" />
                  View Details
                </Button>
                <Button variant="hero" size="sm" className="flex-1 gap-2">
                  <Play className="w-4 h-4" />
                  {strategy.isActive ? 'Running' : 'Activate'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AIStrategies;
