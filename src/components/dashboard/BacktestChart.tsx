import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  DollarSign,
  BarChart3
} from 'lucide-react';

interface BacktestResult {
  symbol: string;
  timeframe: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  final_capital: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  profit_loss: number;
  profit_loss_percentage: number;
  max_drawdown: number;
  sharpe_ratio: number;
  trade_log: any[];
  equity_curve: number[];
}

interface BacktestChartProps {
  result: BacktestResult;
}

const BacktestChart = ({ result }: BacktestChartProps) => {
  // Transform equity curve for the chart
  const chartData = result.equity_curve.map((value, index) => ({
    point: index + 1,
    equity: value,
    label: `Day ${index + 1}`,
  }));

  const stats = [
    {
      label: 'Initial Capital',
      value: `$${result.initial_capital.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-muted-foreground',
    },
    {
      label: 'Final Capital',
      value: `$${result.final_capital.toLocaleString()}`,
      icon: DollarSign,
      color: result.final_capital >= result.initial_capital ? 'text-accent' : 'text-destructive',
    },
    {
      label: 'Total Return',
      value: `${result.profit_loss_percentage >= 0 ? '+' : ''}${result.profit_loss_percentage.toFixed(2)}%`,
      icon: result.profit_loss_percentage >= 0 ? TrendingUp : TrendingDown,
      color: result.profit_loss_percentage >= 0 ? 'text-accent' : 'text-destructive',
    },
    {
      label: 'Win Rate',
      value: `${result.win_rate.toFixed(1)}%`,
      icon: Target,
      color: result.win_rate >= 50 ? 'text-accent' : 'text-destructive',
    },
    {
      label: 'Max Drawdown',
      value: `-${result.max_drawdown.toFixed(2)}%`,
      icon: AlertTriangle,
      color: 'text-destructive',
    },
    {
      label: 'Sharpe Ratio',
      value: result.sharpe_ratio.toFixed(2),
      icon: BarChart3,
      color: result.sharpe_ratio >= 1 ? 'text-accent' : 'text-yellow-400',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border overflow-hidden"
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Backtest Results</h3>
            <p className="text-sm text-muted-foreground">
              {result.symbol} • {result.timeframe} • {result.start_date} to {result.end_date}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Trades</p>
            <p className="font-bold text-foreground">
              {result.total_trades} 
              <span className="text-accent ml-2">{result.winning_trades}W</span>
              <span className="text-destructive ml-1">{result.losing_trades}L</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-px bg-border">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-card p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Icon className={`w-3 h-3 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className={`font-bold text-sm ${stat.color}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Equity Curve Chart */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Equity Curve</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="label" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Equity']}
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                fill="url(#equityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Trades from Backtest */}
      {result.trade_log && result.trade_log.length > 0 && (
        <div className="p-4 border-t border-border">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Sample Trades</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {result.trade_log.slice(0, 5).map((trade: any, idx: number) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm"
              >
                <div className="flex items-center gap-3">
                  {trade.type === 'LONG' || trade.type === 'BUY' ? (
                    <TrendingUp className="w-4 h-4 text-accent" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  )}
                  <span className="text-muted-foreground">{trade.date}</span>
                  <span className="font-medium">{trade.type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground text-xs">
                    ${trade.entry?.toLocaleString()} → ${trade.exit?.toLocaleString()}
                  </span>
                  <span className={`font-bold ${trade.pnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl?.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BacktestChart;
