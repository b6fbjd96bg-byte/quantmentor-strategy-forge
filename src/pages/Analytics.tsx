import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Zap, Bot, TrendingUp, TrendingDown, BarChart3, Settings, LogOut,
  LineChart, PieChart, Calendar, Download, Target, Activity,
  DollarSign, Percent, ArrowUpRight, ArrowDownRight, BookOpen, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, BarChart as RechartsBar, Bar,
} from 'recharts';

interface TradeData {
  profit_loss: number | null;
  entry_date: string;
  status: string;
  market: string;
  strategy_used: string | null;
  trade_type: string;
}

const Analytics = () => {
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | '1Y'>('1M');
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/auth'); return; }

      const { data } = await supabase
        .from('trade_journal')
        .select('profit_loss, entry_date, status, market, strategy_used, trade_type')
        .eq('user_id', session.user.id)
        .order('entry_date', { ascending: true });

      setTrades(data || []);
      setIsLoading(false);
    };
    loadData();
  }, [navigate]);

  const closedTrades = trades.filter(t => t.status === 'closed');
  const winningTrades = closedTrades.filter(t => (t.profit_loss || 0) > 0);
  const losingTrades = closedTrades.filter(t => (t.profit_loss || 0) < 0);

  const totalPnl = closedTrades.reduce((s, t) => s + (Number(t.profit_loss) || 0), 0);
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((s, t) => s + (Number(t.profit_loss) || 0), 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((s, t) => s + (Number(t.profit_loss) || 0), 0) / losingTrades.length : 0;
  const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;

  // Build cumulative P&L chart data
  const pnlOverTime = closedTrades.reduce<{ date: string; net: number }[]>((acc, t) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].net : 0;
    const dateStr = new Date(t.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    acc.push({ date: dateStr, net: prev + (Number(t.profit_loss) || 0) });
    return acc;
  }, []);

  // Market allocation from trades
  const marketCounts: Record<string, number> = {};
  trades.forEach(t => { marketCounts[t.market] = (marketCounts[t.market] || 0) + 1; });
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(217, 91%, 60%)', 'hsl(280, 65%, 60%)', 'hsl(40, 90%, 60%)'];
  const portfolioAllocation = Object.entries(marketCounts).map(([name, count], i) => ({
    name, value: count, color: COLORS[i % COLORS.length]
  }));

  // Strategy performance
  const strategyMap: Record<string, { trades: number; wins: number; pnl: number }> = {};
  closedTrades.forEach(t => {
    const key = t.strategy_used || 'Untagged';
    if (!strategyMap[key]) strategyMap[key] = { trades: 0, wins: 0, pnl: 0 };
    strategyMap[key].trades++;
    if ((t.profit_loss || 0) > 0) strategyMap[key].wins++;
    strategyMap[key].pnl += Number(t.profit_loss) || 0;
  });
  const strategyPerformance = Object.entries(strategyMap).map(([name, d]) => ({
    name, trades: d.trades, winRate: d.trades > 0 ? (d.wins / d.trades) * 100 : 0, pnl: d.pnl,
  }));

  // Day of week performance
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayMap: Record<string, { wins: number; losses: number }> = {};
  dayNames.forEach(d => { dayMap[d] = { wins: 0, losses: 0 }; });
  closedTrades.forEach(t => {
    const day = dayNames[new Date(t.entry_date).getDay()];
    if ((t.profit_loss || 0) > 0) dayMap[day].wins++;
    else dayMap[day].losses++;
  });
  const weeklyData = dayNames.filter(d => d !== 'Sun' && d !== 'Sat').map(day => ({ day, ...dayMap[day] }));

  const hasData = trades.length > 0;

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
            { icon: Bot, label: 'AI Strategies', href: '/ai-strategies' },
            { icon: LineChart, label: 'Live Trading', href: '/live-trading' },
            { icon: BookOpen, label: 'Trade Journal', href: '/trade-journal' },
            { icon: PieChart, label: 'Analytics', active: true, href: '/analytics' },
            { icon: Settings, label: 'Settings', href: '/settings' },
          ].map((item, index) => (
            <Link key={index} to={item.href}
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
              <PieChart className="w-8 h-8 text-primary" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">Deep insights into your trading performance and portfolio.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading analytics...</span>
          </div>
        ) : !hasData ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <PieChart className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">No trading data yet</p>
            <p className="text-sm text-muted-foreground mb-4">Start logging trades in your Trade Journal to see analytics here.</p>
            <Link to="/trade-journal">
              <Button variant="outline" className="gap-2"><BookOpen className="w-4 h-4" />Go to Trade Journal</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, icon: DollarSign, positive: totalPnl >= 0 },
                { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, icon: Target },
                { label: 'Total Trades', value: closedTrades.length.toString(), icon: Activity },
                { label: 'Profit Factor', value: profitFactor.toFixed(2), icon: TrendingUp },
              ].map((stat, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    {stat.positive !== undefined && (stat.positive ? <ArrowUpRight className="w-5 h-5 text-accent" /> : <ArrowDownRight className="w-5 h-5 text-destructive" />)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className={`font-display text-2xl font-bold ${stat.positive !== undefined ? (stat.positive ? 'text-accent' : 'text-destructive') : ''}`}>{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display text-lg font-bold mb-6">Cumulative P&L</h3>
                {pnlOverTime.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={pnlOverTime}>
                        <defs>
                          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="net" stroke="hsl(var(--accent))" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : <p className="text-muted-foreground text-center py-8">Close some trades to see P&L chart</p>}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display text-lg font-bold mb-6">Market Distribution</h3>
                {portfolioAllocation.length > 0 ? (
                  <>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie data={portfolioAllocation} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
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
                          <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : <p className="text-muted-foreground text-center py-8">No market data</p>}
              </motion.div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display text-lg font-bold mb-6">Weekly Win/Loss</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBar data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Bar dataKey="wins" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="losses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    </RechartsBar>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display text-lg font-bold mb-6">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Avg. Win', value: `+$${avgWin.toFixed(2)}`, positive: true },
                    { label: 'Avg. Loss', value: `$${avgLoss.toFixed(2)}`, positive: false },
                    { label: 'Win Rate', value: `${winRate.toFixed(1)}%` },
                    { label: 'Profit Factor', value: profitFactor.toFixed(2) },
                  ].map((metric, index) => (
                    <div key={index} className="p-4 rounded-xl bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                      <p className={`font-display text-xl font-bold ${
                        metric.positive === true ? 'text-accent' : metric.positive === false ? 'text-destructive' : ''
                      }`}>{metric.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Strategy Performance Table */}
            {strategyPerformance.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="bg-card rounded-2xl border border-border overflow-hidden">
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
                      </tr>
                    </thead>
                    <tbody>
                      {strategyPerformance.map((strategy, index) => (
                        <tr key={index} className="border-t border-border hover:bg-muted/20">
                          <td className="p-4 font-medium">{strategy.name}</td>
                          <td className="p-4 text-right">{strategy.trades}</td>
                          <td className="p-4 text-right">
                            <span className={strategy.winRate >= 50 ? 'text-accent' : 'text-destructive'}>
                              {strategy.winRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className={`p-4 text-right font-medium ${strategy.pnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
                            {strategy.pnl >= 0 ? '+' : ''}${strategy.pnl.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Analytics;
