import { useState, useEffect } from 'react';
import TradingViewChartModal from '@/components/dashboard/TradingViewChartModal';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Zap, Bot, TrendingUp, Shield, Clock, Target, ChevronRight, Star,
  Play, Pause, BarChart3, Settings, LogOut, LineChart, PieChart,
  ArrowUpRight, Sparkles, Cpu, Brain, BookOpen, Info, Layers,
  Crosshair, Gauge, Repeat, Zap as ZapIcon, RefreshCw, Plus
} from 'lucide-react';
import StrategyChartPreview from '@/components/dashboard/StrategyChartPreview';

interface UserStrategy {
  id: string;
  name: string;
  description: string | null;
  strategy_type: string;
  markets: string[];
  status: string;
  timeframe: string | null;
  entry_rules: string | null;
  exit_rules: string | null;
  created_at: string;
}

interface StrategyBot {
  id: string;
  name: string;
  status: string;
  ai_analysis: string | null;
  indicators: any;
  entry_logic: string | null;
  exit_logic: string | null;
  strategy_id: string | null;
}

interface BacktestResult {
  bot_id: string | null;
  win_rate: number | null;
  profit_loss_percentage: number | null;
  total_trades: number | null;
  max_drawdown: number | null;
}

const AIStrategies = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [strategies, setStrategies] = useState<UserStrategy[]>([]);
  const [bots, setBots] = useState<StrategyBot[]>([]);
  const [backtests, setBacktests] = useState<BacktestResult[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [chartPreviewStrategy, setChartPreviewStrategy] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const filters = ['all', 'momentum', 'mean-reversion', 'breakout', 'scalping', 'swing'];

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/auth'); return; }
      const userId = session.user.id;

      const [stratRes, botRes, btRes] = await Promise.all([
        supabase.from('strategies').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('strategy_bots').select('*').eq('user_id', userId),
        supabase.from('backtest_results').select('bot_id, win_rate, profit_loss_percentage, total_trades, max_drawdown').eq('user_id', userId),
      ]);

      setStrategies((stratRes.data as UserStrategy[]) || []);
      setBots((botRes.data as StrategyBot[]) || []);
      setBacktests((btRes.data as BacktestResult[]) || []);
      setIsLoading(false);
    };
    load();
  }, [navigate]);

  const filteredStrategies = activeFilter === 'all'
    ? strategies
    : strategies.filter(s => s.strategy_type === activeFilter);

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

  const getBotsForStrategy = (strategyId: string) => bots.filter(b => b.strategy_id === strategyId);
  const getBacktestForBot = (botId: string) => backtests.find(b => b.bot_id === botId);

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
              <Sparkles className="w-8 h-8 text-primary" />
              AI Trading Strategies
            </h1>
            <p className="text-muted-foreground">Your strategies and their AI-powered bots with backtest data.</p>
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
            { label: 'Total Strategies', value: strategies.length.toString(), icon: Bot, color: 'primary' },
            { label: 'Active Bots', value: bots.filter(b => b.status === 'running').length.toString(), icon: Play, color: 'accent' },
            { label: 'Total Bots', value: bots.length.toString(), icon: Target, color: 'primary' },
            { label: 'Backtests', value: backtests.length.toString(), icon: BarChart3, color: 'accent' },
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

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading strategies...</span>
          </div>
        ) : filteredStrategies.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">
              {activeFilter === 'all' ? 'No strategies yet' : `No ${activeFilter} strategies`}
            </p>
            <p className="text-sm text-muted-foreground mb-4">Create your first AI-powered trading strategy to get started.</p>
            <Link to="/submit-strategy">
              <Button variant="outline" className="gap-2"><Plus className="w-4 h-4" />Create Strategy</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredStrategies.map((strategy, index) => {
              const stratBots = getBotsForStrategy(strategy.id);
              const firstBot = stratBots[0];
              const backtest = firstBot ? getBacktestForBot(firstBot.id) : null;

              return (
                <motion.div key={strategy.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-card rounded-2xl border border-border hover:border-primary/30 transition-colors overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          {getTypeIcon(strategy.strategy_type)}
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-bold">{strategy.name}</h3>
                          <p className="text-xs text-muted-foreground capitalize">
                            {strategy.strategy_type.replace('-', ' ')} • {strategy.timeframe || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                        strategy.status === 'active' ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
                      }`}>{strategy.status}</span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{strategy.description || 'No description'}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {strategy.markets.map((m) => (
                        <span key={m} className="px-2 py-1 rounded-md bg-muted/50 text-xs">{m}</span>
                      ))}
                    </div>

                    {/* Backtest Stats */}
                    {backtest && (
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Win Rate</p>
                          <p className="font-bold text-accent">{(backtest.win_rate || 0).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Return</p>
                          <p className={`font-bold ${(backtest.profit_loss_percentage || 0) >= 0 ? 'text-accent' : 'text-destructive'}`}>
                            {(backtest.profit_loss_percentage || 0) >= 0 ? '+' : ''}{(backtest.profit_loss_percentage || 0).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Trades</p>
                          <p className="font-bold">{backtest.total_trades || 0}</p>
                        </div>
                      </div>
                    )}

                    {/* Bot Status */}
                    {stratBots.length > 0 && (
                      <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Bot Status</p>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${firstBot.status === 'running' ? 'bg-accent' : firstBot.status === 'ready' ? 'bg-primary' : 'bg-muted-foreground'}`} />
                          <span className="text-sm font-medium capitalize">{firstBot.status}</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" className="flex-1 gap-2"
                        onClick={() => setExpandedId(expandedId === strategy.id ? null : strategy.id)}>
                        <Info className="w-4 h-4" />
                        {expandedId === strategy.id ? 'Hide Details' : 'View Details'}
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 gap-2"
                        onClick={() => setChartPreviewStrategy({
                          name: strategy.name,
                          type: strategy.strategy_type,
                          indicators: firstBot?.indicators ? (Array.isArray(firstBot.indicators) ? firstBot.indicators.map((i: any) => i.name || i) : []) : [],
                          timeframe: strategy.timeframe || '4H',
                        })}>
                        <LineChart className="w-4 h-4" />
                        Chart Preview
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === strategy.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      className="border-t border-border bg-muted/20 p-6 space-y-4">
                      
                      {strategy.entry_rules && (
                        <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                          <h4 className="text-xs font-medium text-accent mb-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Entry Rules
                          </h4>
                          <p className="text-xs text-muted-foreground">{strategy.entry_rules}</p>
                        </div>
                      )}

                      {strategy.exit_rules && (
                        <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                          <h4 className="text-xs font-medium text-destructive mb-1 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Exit Rules
                          </h4>
                          <p className="text-xs text-muted-foreground">{strategy.exit_rules}</p>
                        </div>
                      )}

                      {firstBot?.ai_analysis && (
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Brain className="w-4 h-4 text-primary" />
                            AI Analysis
                          </h4>
                          <p className="text-sm text-muted-foreground">{firstBot.ai_analysis}</p>
                        </div>
                      )}

                      {firstBot?.indicators && Array.isArray(firstBot.indicators) && firstBot.indicators.length > 0 && (
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Indicators</h4>
                          <div className="flex flex-wrap gap-2">
                            {firstBot.indicators.map((ind: any, idx: number) => (
                              <span key={idx} className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                                {ind.name || ind}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <StrategyChartPreview
                        strategyType={strategy.strategy_type as any}
                        strategyName={strategy.name}
                        indicators={firstBot?.indicators ? (Array.isArray(firstBot.indicators) ? firstBot.indicators.map((i: any) => i.name || i) : []) : []}
                        timeframe={strategy.timeframe || '4H'}
                      />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Chart Preview Modal */}
      {chartPreviewStrategy && (
        <TradingViewChartModal
          open={!!chartPreviewStrategy}
          onOpenChange={(open) => { if (!open) setChartPreviewStrategy(null); }}
          strategyName={chartPreviewStrategy.name}
          strategyType={chartPreviewStrategy.type}
          indicators={chartPreviewStrategy.indicators}
          timeframe={chartPreviewStrategy.timeframe}
        />
      )}
    </div>
  );
};

export default AIStrategies;
