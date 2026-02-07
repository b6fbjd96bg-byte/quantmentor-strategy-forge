import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Bot, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Settings,
  LogOut,
  LineChart,
  PieChart,
  Calendar,
  Download,
  Target,
  Activity,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const Analytics = () => {
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | '1Y'>('1M');

  const performanceData = [
    { date: 'Jan', profit: 2400, loss: -800, net: 1600 },
    { date: 'Feb', profit: 3200, loss: -1200, net: 2000 },
    { date: 'Mar', profit: 2800, loss: -600, net: 2200 },
    { date: 'Apr', profit: 4100, loss: -900, net: 3200 },
    { date: 'May', profit: 3600, loss: -1100, net: 2500 },
    { date: 'Jun', profit: 4800, loss: -700, net: 4100 },
  ];

  const portfolioAllocation = [
    { name: 'Crypto', value: 35, color: 'hsl(var(--primary))' },
    { name: 'Stocks', value: 30, color: 'hsl(var(--accent))' },
    { name: 'Forex', value: 20, color: 'hsl(217, 91%, 60%)' },
    { name: 'ETFs', value: 15, color: 'hsl(280, 65%, 60%)' },
  ];

  const strategyPerformance = [
    { name: 'Momentum Alpha', trades: 245, winRate: 68.5, pnl: 4250, return: 12.4 },
    { name: 'Mean Reversion', trades: 189, winRate: 72.3, pnl: 2890, return: 8.7 },
    { name: 'Breakout Hunter', trades: 156, winRate: 58.2, pnl: 5120, return: 18.9 },
    { name: 'Scalper Elite', trades: 892, winRate: 76.8, pnl: 1680, return: 5.2 },
  ];

  const weeklyData = [
    { day: 'Mon', wins: 12, losses: 5 },
    { day: 'Tue', wins: 15, losses: 8 },
    { day: 'Wed', wins: 18, losses: 6 },
    { day: 'Thu', wins: 14, losses: 9 },
    { day: 'Fri', wins: 20, losses: 4 },
  ];

  const stats = {
    totalPnl: 15640,
    winRate: 68.4,
    totalTrades: 1482,
    avgWin: 156.80,
    avgLoss: -89.20,
    profitFactor: 1.76,
    sharpeRatio: 1.84,
    maxDrawdown: -8.2,
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
            { icon: Bot, label: 'AI Strategies', href: '/ai-strategies' },
            { icon: LineChart, label: 'Live Trading', href: '/live-trading' },
            { icon: PieChart, label: 'Analytics', active: true, href: '/analytics' },
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
              <PieChart className="w-8 h-8 text-primary" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Deep insights into your trading performance and portfolio.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
              {(['1W', '1M', '3M', '1Y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    timeframe === tf
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total P&L', value: `+$${stats.totalPnl.toLocaleString()}`, icon: DollarSign, positive: true },
            { label: 'Win Rate', value: `${stats.winRate}%`, icon: Target },
            { label: 'Total Trades', value: stats.totalTrades.toLocaleString(), icon: Activity },
            { label: 'Profit Factor', value: stats.profitFactor.toFixed(2), icon: TrendingUp },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                {stat.positive && <ArrowUpRight className="w-5 h-5 text-accent" />}
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className={`font-display text-2xl font-bold ${stat.positive ? 'text-accent' : ''}`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-card rounded-2xl border border-border p-6"
          >
            <h3 className="font-display text-lg font-bold mb-6">Profit & Loss Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area type="monotone" dataKey="net" stroke="hsl(var(--accent))" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Portfolio Allocation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <h3 className="font-display text-lg font-bold mb-6">Portfolio Allocation</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={portfolioAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {portfolioAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {portfolioAllocation.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <h3 className="font-display text-lg font-bold mb-6">Weekly Win/Loss</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="wins" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="losses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <h3 className="font-display text-lg font-bold mb-6">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Avg. Win', value: `+$${stats.avgWin}`, positive: true },
                { label: 'Avg. Loss', value: `$${stats.avgLoss}`, positive: false },
                { label: 'Sharpe Ratio', value: stats.sharpeRatio.toFixed(2) },
                { label: 'Max Drawdown', value: `${stats.maxDrawdown}%`, positive: false },
              ].map((metric, index) => (
                <div key={index} className="p-4 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                  <p className={`font-display text-xl font-bold ${
                    metric.positive === true ? 'text-accent' : 
                    metric.positive === false ? 'text-destructive' : ''
                  }`}>
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Strategy Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h3 className="font-display text-lg font-bold">Strategy Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Strategy</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Trades</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Win Rate</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">P&L</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Return</th>
                </tr>
              </thead>
              <tbody>
                {strategyPerformance.map((strategy, index) => (
                  <tr key={index} className="border-t border-border hover:bg-muted/20">
                    <td className="p-4 font-medium">{strategy.name}</td>
                    <td className="p-4 text-right">{strategy.trades}</td>
                    <td className="p-4 text-right">
                      <span className={strategy.winRate >= 65 ? 'text-accent' : ''}>
                        {strategy.winRate}%
                      </span>
                    </td>
                    <td className="p-4 text-right text-accent">+${strategy.pnl.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <span className="flex items-center justify-end gap-1 text-accent">
                        <ArrowUpRight className="w-4 h-4" />
                        {strategy.return}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Analytics;
