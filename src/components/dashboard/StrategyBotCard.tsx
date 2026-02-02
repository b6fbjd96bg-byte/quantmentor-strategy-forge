import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BacktestResult {
  symbol: string;
  timeframe: string;
  total_trades: number;
  winning_trades: number;
  win_rate: number;
  profit_loss: number;
  profit_loss_percentage: number;
  max_drawdown: number;
  sharpe_ratio: number;
  trade_log: any[];
  equity_curve: number[];
}

interface StrategyBot {
  id: string;
  name: string;
  status: 'generating' | 'ready' | 'running' | 'paused' | 'error';
  broker: string;
  ai_analysis: string | null;
  indicators: any[];
  entry_logic: string | null;
  exit_logic: string | null;
  created_at: string;
  backtest?: BacktestResult;
}

interface StrategyBotCardProps {
  bot: StrategyBot;
  onActivate: (botId: string) => void;
  onPause: (botId: string) => void;
}

const StrategyBotCard = ({ bot, onActivate, onPause }: StrategyBotCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'generating':
        return { 
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          icon: Loader2,
          label: 'Generating',
          animate: true
        };
      case 'ready':
        return { 
          color: 'bg-primary/20 text-primary border-primary/30',
          icon: CheckCircle2,
          label: 'Ready',
          animate: false
        };
      case 'running':
        return { 
          color: 'bg-accent/20 text-accent border-accent/30',
          icon: Play,
          label: 'Running',
          animate: false
        };
      case 'paused':
        return { 
          color: 'bg-muted text-muted-foreground border-border',
          icon: Pause,
          label: 'Paused',
          animate: false
        };
      case 'error':
        return { 
          color: 'bg-destructive/20 text-destructive border-destructive/30',
          icon: AlertTriangle,
          label: 'Error',
          animate: false
        };
      default:
        return { 
          color: 'bg-muted text-muted-foreground border-border',
          icon: Clock,
          label: status,
          animate: false
        };
    }
  };

  const statusConfig = getStatusConfig(bot.status);
  const StatusIcon = statusConfig.icon;
  const backtest = bot.backtest;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{bot.name}</h3>
              <p className="text-xs text-muted-foreground">
                {bot.broker === 'paper' ? 'Paper Trading' : bot.broker}
              </p>
            </div>
          </div>
          <Badge className={`${statusConfig.color} border`}>
            <StatusIcon className={`w-3 h-3 mr-1 ${statusConfig.animate ? 'animate-spin' : ''}`} />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Quick Stats */}
        {backtest && bot.status !== 'generating' && (
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Win Rate</p>
              <p className={`font-bold ${backtest.win_rate >= 50 ? 'text-accent' : 'text-destructive'}`}>
                {backtest.win_rate.toFixed(1)}%
              </p>
            </div>
            <div className="p-2 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">P&L</p>
              <p className={`font-bold ${backtest.profit_loss >= 0 ? 'text-accent' : 'text-destructive'}`}>
                {backtest.profit_loss >= 0 ? '+' : ''}${backtest.profit_loss.toFixed(0)}
              </p>
            </div>
            <div className="p-2 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Trades</p>
              <p className="font-bold text-foreground">{backtest.total_trades}</p>
            </div>
            <div className="p-2 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Drawdown</p>
              <p className="font-bold text-destructive">-{backtest.max_drawdown.toFixed(1)}%</p>
            </div>
          </div>
        )}

        {bot.status === 'generating' && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg mt-2">
            <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
            <span className="text-sm text-yellow-400">AI is analyzing your strategy and generating bot logic...</span>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      <div className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-between"
        >
          <span>View Details</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-4"
          >
            {/* AI Analysis */}
            {bot.ai_analysis && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  AI Analysis
                </h4>
                <p className="text-sm text-muted-foreground">{bot.ai_analysis}</p>
              </div>
            )}

            {/* Indicators */}
            {bot.indicators && bot.indicators.length > 0 && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Technical Indicators</h4>
                <div className="flex flex-wrap gap-2">
                  {bot.indicators.map((ind: any, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {ind.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Entry/Exit Logic */}
            {(bot.entry_logic || bot.exit_logic) && (
              <div className="grid grid-cols-2 gap-3">
                {bot.entry_logic && (
                  <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                    <h4 className="text-xs font-medium text-accent mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Entry Logic
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-3">{bot.entry_logic}</p>
                  </div>
                )}
                {bot.exit_logic && (
                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <h4 className="text-xs font-medium text-destructive mb-1 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" /> Exit Logic
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-3">{bot.exit_logic}</p>
                  </div>
                )}
              </div>
            )}

            {/* Mini Equity Curve */}
            {backtest?.equity_curve && backtest.equity_curve.length > 0 && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Equity Curve (Backtest)</h4>
                <div className="flex items-end gap-1 h-16">
                  {backtest.equity_curve.map((value: number, idx: number) => {
                    const min = Math.min(...backtest.equity_curve);
                    const max = Math.max(...backtest.equity_curve);
                    const height = max === min ? 50 : ((value - min) / (max - min)) * 100;
                    const isUp = idx === 0 ? true : value >= backtest.equity_curve[idx - 1];
                    return (
                      <div
                        key={idx}
                        className={`flex-1 rounded-t transition-all ${isUp ? 'bg-accent' : 'bg-destructive'}`}
                        style={{ height: `${Math.max(height, 10)}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {bot.status === 'ready' && (
            <Button 
              variant="hero" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={() => onActivate(bot.id)}
            >
              <Play className="w-4 h-4" />
              Start Trading
            </Button>
          )}
          {bot.status === 'running' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={() => onPause(bot.id)}
            >
              <Pause className="w-4 h-4" />
              Pause Bot
            </Button>
          )}
          {bot.status === 'paused' && (
            <Button 
              variant="hero" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={() => onActivate(bot.id)}
            >
              <Play className="w-4 h-4" />
              Resume
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default StrategyBotCard;
