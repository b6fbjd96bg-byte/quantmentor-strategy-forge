import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Zap, Bot, TrendingUp, Shield, Clock, Target, ChevronRight, Star,
  Play, Pause, BarChart3, Settings, LogOut, LineChart, PieChart,
  ArrowUpRight, Sparkles, Cpu, Brain, BookOpen, Info, Layers,
  Crosshair, Gauge, Repeat, Zap as ZapIcon
} from 'lucide-react';
import StrategyChartPreview from '@/components/dashboard/StrategyChartPreview';

interface AIStrategy {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  howItWorks: string;
  bestFor: string;
  type: 'momentum' | 'mean-reversion' | 'breakout' | 'scalping' | 'swing';
  markets: string[];
  winRate: number;
  avgReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  subscribers: number;
  isActive: boolean;
  monthlyPerformance: number[];
  indicators: string[];
  timeframe: string;
  tradeFrequency: string;
}

const aiStrategies: AIStrategy[] = [
  {
    id: '1',
    name: 'Momentum Alpha',
    description: 'AI-powered momentum strategy that identifies strong trending assets and rides the wave.',
    longDescription: 'Uses a combination of RSI momentum, volume-weighted trend detection, and machine learning pattern recognition to identify strong directional moves before they happen. The algorithm dynamically adjusts position sizing based on trend strength and market volatility.',
    howItWorks: 'Scans for assets with increasing volume + price momentum, enters on pullbacks to moving averages, trails stop-loss using ATR.',
    bestFor: 'Traders who want to capture large directional moves in trending markets with moderate holding periods.',
    type: 'momentum',
    markets: ['Crypto', 'Stocks'],
    winRate: 68.5,
    avgReturn: 12.4,
    riskLevel: 'medium',
    subscribers: 2847,
    isActive: true,
    monthlyPerformance: [5.2, 3.8, -1.2, 8.4, 6.1, 4.3],
    indicators: ['RSI', 'EMA 20/50', 'Volume Profile', 'ATR'],
    timeframe: '4H - Daily',
    tradeFrequency: '3-5 trades/week',
  },
  {
    id: '2',
    name: 'Mean Reversion Pro',
    description: 'Statistical arbitrage strategy that capitalizes on price deviations from historical averages.',
    longDescription: 'Employs Bollinger Band extremes, Z-score calculations, and historical mean analysis to identify when assets are significantly over- or under-valued relative to their statistical norm. Executes counter-trend entries with tight risk management.',
    howItWorks: 'Identifies 2+ standard deviation price moves, waits for reversal confirmation candlestick, enters with predefined risk:reward.',
    bestFor: 'Conservative traders who prefer high-probability setups in ranging or mean-reverting markets.',
    type: 'mean-reversion',
    markets: ['Forex', 'Stocks'],
    winRate: 72.3,
    avgReturn: 8.7,
    riskLevel: 'low',
    subscribers: 1923,
    isActive: true,
    monthlyPerformance: [2.1, 4.2, 3.5, 2.8, 5.1, 3.9],
    indicators: ['Bollinger Bands', 'RSI', 'Stochastic', 'VWAP'],
    timeframe: '1H - 4H',
    tradeFrequency: '5-8 trades/week',
  },
  {
    id: '3',
    name: 'Breakout Hunter',
    description: 'Detects and trades breakouts from consolidation patterns with AI-enhanced entry timing.',
    longDescription: 'Monitors chart patterns like triangles, rectangles, and wedges in real-time. Uses volume surge detection and order flow analysis to confirm genuine breakouts vs fakeouts. AI model trained on 100K+ historical breakout events.',
    howItWorks: 'Detects consolidation patterns, waits for volume-confirmed breakout, enters on first retest of broken level.',
    bestFor: 'Aggressive traders who want to capture explosive moves from tight ranges with high reward potential.',
    type: 'breakout',
    markets: ['Crypto', 'Futures'],
    winRate: 58.2,
    avgReturn: 18.9,
    riskLevel: 'high',
    subscribers: 3421,
    isActive: false,
    monthlyPerformance: [12.4, -3.2, 15.8, 8.2, -2.1, 22.3],
    indicators: ['Volume', 'ATR', 'Fibonacci', 'Order Flow'],
    timeframe: '15M - 1H',
    tradeFrequency: '2-4 trades/week',
  },
  {
    id: '4',
    name: 'Scalper Elite',
    description: 'High-frequency micro-profit strategy designed for volatile market conditions.',
    longDescription: 'Executes rapid-fire trades capturing small price inefficiencies across multiple timeframes. Uses tick-level data analysis, spread monitoring, and micro-structure patterns to identify scalping opportunities with sub-minute precision.',
    howItWorks: 'Monitors bid-ask spread + micro price action, enters on order book imbalances, exits within minutes.',
    bestFor: 'Active traders comfortable with high trade frequency who want consistent small gains in volatile markets.',
    type: 'scalping',
    markets: ['Crypto', 'Forex'],
    winRate: 76.8,
    avgReturn: 5.2,
    riskLevel: 'medium',
    subscribers: 1567,
    isActive: true,
    monthlyPerformance: [1.8, 2.1, 1.5, 2.4, 1.9, 2.2],
    indicators: ['Order Book', 'VWAP', 'EMA 9', 'Tick Volume'],
    timeframe: '1M - 5M',
    tradeFrequency: '15-30 trades/day',
  },
  {
    id: '5',
    name: 'Swing Master',
    description: 'Medium-term swing trading strategy capturing multi-day price movements.',
    longDescription: 'Combines weekly trend analysis with daily entry signals. Uses multiple timeframe confluence, sector rotation analysis, and earnings calendar integration for stocks. AI optimizes entry timing for maximum risk-adjusted returns.',
    howItWorks: 'Identifies weekly trend, finds daily pullback to support, enters with multi-day hold period targeting swing highs/lows.',
    bestFor: 'Part-time traders who want solid returns without constant screen monitoring. Set-and-forget approach.',
    type: 'swing',
    markets: ['Stocks', 'ETFs'],
    winRate: 64.1,
    avgReturn: 15.3,
    riskLevel: 'medium',
    subscribers: 2156,
    isActive: true,
    monthlyPerformance: [4.5, 6.2, 3.8, 7.1, 5.4, 4.9],
    indicators: ['MACD', 'EMA 50/200', 'RSI', 'Fibonacci'],
    timeframe: 'Daily - Weekly',
    tradeFrequency: '1-3 trades/week',
  },
  {
    id: '6',
    name: 'Crypto Night Owl',
    description: 'Specialized for overnight crypto market movements, leveraging 24/7 dynamics.',
    longDescription: 'Focuses on crypto market inefficiencies during low-volume Asian and European sessions. Uses funding rate analysis, whale wallet tracking, and cross-exchange arbitrage signals to capture overnight moves while you sleep.',
    howItWorks: 'Analyzes funding rates + whale activity, enters positions during low-liquidity hours, captures overnight volatility.',
    bestFor: 'Crypto-focused traders who want to profit from 24/7 market dynamics without staying up all night.',
    type: 'momentum',
    markets: ['Crypto'],
    winRate: 61.4,
    avgReturn: 21.7,
    riskLevel: 'high',
    subscribers: 4102,
    isActive: true,
    monthlyPerformance: [8.3, -2.1, 14.2, 11.5, 6.8, 9.4],
    indicators: ['Funding Rate', 'OI', 'Volume Delta', 'Liquidation Map'],
    timeframe: '1H - 4H',
    tradeFrequency: '1-2 trades/day',
  },
];

const AIStrategies = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [strategies, setStrategies] = useState(aiStrategies);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'momentum': return <Zap className="w-5 h-5" />;
      case 'mean-reversion': return <Repeat className="w-5 h-5" />;
      case 'breakout': return <TrendingUp className="w-5 h-5" />;
      case 'scalping': return <Crosshair className="w-5 h-5" />;
      case 'swing': return <Layers className="w-5 h-5" />;
      default: return <Cpu className="w-5 h-5" />;
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
            { icon: TrendingUp, label: 'Chart Analysis', href: '/chart-analysis' },
            { icon: Bot, label: 'AI Strategies', active: true, href: '/ai-strategies' },
            { icon: LineChart, label: 'Live Trading', href: '/live-trading' },
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
              <Sparkles className="w-8 h-8 text-primary" />
              AI Trading Strategies
            </h1>
            <p className="text-muted-foreground">
              Pre-built AI strategies with detailed performance data. Click any strategy to learn how it works.
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
            { label: 'Active Now', value: strategies.filter(s => s.isActive).length.toString(), icon: Play, color: 'accent' },
            { label: 'Avg. Win Rate', value: `${(strategies.reduce((s, st) => s + st.winRate, 0) / strategies.length).toFixed(1)}%`, icon: Target, color: 'primary' },
            { label: 'Total Subscribers', value: `${(strategies.reduce((s, st) => s + st.subscribers, 0) / 1000).toFixed(1)}K`, icon: Star, color: 'accent' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl border border-border p-6">
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
            <button key={filter} onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                activeFilter === filter ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}>
              {filter === 'all' ? 'All Strategies' : filter.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Strategies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStrategies.map((strategy, index) => (
            <motion.div key={strategy.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-card rounded-2xl border border-border hover:border-primary/30 transition-colors overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      {getTypeIcon(strategy.type)}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold">{strategy.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{strategy.type.replace('-', ' ')} • {strategy.timeframe}</p>
                    </div>
                  </div>
                  <button onClick={() => toggleStrategy(strategy.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      strategy.isActive ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
                    }`}>
                    {strategy.isActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{strategy.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {strategy.markets.map((m) => (
                    <span key={m} className="px-2 py-1 rounded-md bg-muted/50 text-xs">{m}</span>
                  ))}
                  <span className={`px-2 py-1 rounded-md text-xs capitalize ${getRiskColor(strategy.riskLevel)}`}>
                    {strategy.riskLevel} risk
                  </span>
                  <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">{strategy.tradeFrequency}</span>
                </div>

                {/* Stats */}
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

                {/* Mini Chart */}
                <div className="flex items-end gap-1 h-12 mb-4">
                  {strategy.monthlyPerformance.map((perf, i) => (
                    <div key={i} className={`flex-1 rounded-t ${perf >= 0 ? 'bg-accent' : 'bg-destructive'}`}
                      style={{ height: `${Math.abs(perf) * 3 + 10}%` }} />
                  ))}
                </div>

                {/* Expand Button */}
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="flex-1 gap-2"
                    onClick={() => setExpandedId(expandedId === strategy.id ? null : strategy.id)}>
                    <Info className="w-4 h-4" />
                    {expandedId === strategy.id ? 'Hide Details' : 'View Details'}
                  </Button>
                  <Button variant="hero" size="sm" className="flex-1 gap-2">
                    <Play className="w-4 h-4" />
                    {strategy.isActive ? 'Running' : 'Activate'}
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === strategy.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  className="border-t border-border bg-muted/20 p-6 space-y-4">
                  
                  {/* Strategy Chart Preview */}
                  <StrategyChartPreview
                    strategyType={strategy.type}
                    indicators={strategy.indicators}
                    strategyName={strategy.name}
                    timeframe={strategy.timeframe}
                  />

                  <div>
                    <h4 className="text-sm font-bold mb-1 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" /> How It Works
                    </h4>
                    <p className="text-sm text-muted-foreground">{strategy.howItWorks}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-1 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-primary" /> Deep Dive
                    </h4>
                    <p className="text-sm text-muted-foreground">{strategy.longDescription}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-1 flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" /> Best For
                    </h4>
                    <p className="text-sm text-muted-foreground">{strategy.bestFor}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-2">Indicators Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {strategy.indicators.map((ind, i) => (
                        <span key={i} className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">{ind}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AIStrategies;
