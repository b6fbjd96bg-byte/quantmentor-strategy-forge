import { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, Target, DollarSign, 
  BarChart3, PieChart, Activity, Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import type { Trade } from "@/pages/TradeJournal";

interface JournalAnalyticsProps {
  trades: Trade[];
}

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

const JournalAnalytics = ({ trades }: JournalAnalyticsProps) => {
  const analytics = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === "closed");
    const winningTrades = closedTrades.filter(t => (t.profit_loss || 0) > 0);
    const losingTrades = closedTrades.filter(t => (t.profit_loss || 0) < 0);
    
    const totalPnL = closedTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0) / winningTrades.length 
      : 0;
    const avgLoss = losingTrades.length > 0 
      ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0) / losingTrades.length)
      : 0;
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;
    const avgRating = trades.filter(t => t.rating).reduce((sum, t, _, arr) => sum + (t.rating! / arr.length), 0);

    // P&L over time (cumulative)
    const sortedTrades = [...closedTrades].sort((a, b) => 
      new Date(a.exit_date!).getTime() - new Date(b.exit_date!).getTime()
    );
    let cumulative = 0;
    const pnlOverTime = sortedTrades.map(t => {
      cumulative += t.profit_loss || 0;
      return {
        date: new Date(t.exit_date!).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        pnl: t.profit_loss || 0,
        cumulative,
      };
    });

    // By market
    const byMarket = trades.reduce((acc, t) => {
      acc[t.market] = (acc[t.market] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const marketData = Object.entries(byMarket).map(([name, value]) => ({ name, value }));

    // By trade type
    const longTrades = trades.filter(t => t.trade_type === "long").length;
    const shortTrades = trades.filter(t => t.trade_type === "short").length;
    const typeData = [
      { name: "Long", value: longTrades },
      { name: "Short", value: shortTrades },
    ];

    // Win/Loss distribution
    const winLossData = [
      { name: "Wins", value: winningTrades.length, fill: "#22c55e" },
      { name: "Losses", value: losingTrades.length, fill: "#ef4444" },
    ];

    // By emotion
    const byEmotion = trades.filter(t => t.emotions).reduce((acc, t) => {
      acc[t.emotions!] = (acc[t.emotions!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const emotionData = Object.entries(byEmotion).map(([name, value]) => ({ name, value }));

    // Performance by strategy
    const byStrategy = closedTrades.filter(t => t.strategy_used).reduce((acc, t) => {
      if (!acc[t.strategy_used!]) {
        acc[t.strategy_used!] = { wins: 0, losses: 0, pnl: 0 };
      }
      if ((t.profit_loss || 0) > 0) acc[t.strategy_used!].wins++;
      else acc[t.strategy_used!].losses++;
      acc[t.strategy_used!].pnl += t.profit_loss || 0;
      return acc;
    }, {} as Record<string, { wins: number; losses: number; pnl: number }>);
    const strategyData = Object.entries(byStrategy).map(([name, data]) => ({
      name: name.length > 15 ? name.slice(0, 15) + "..." : name,
      pnl: data.pnl,
      winRate: data.wins + data.losses > 0 ? (data.wins / (data.wins + data.losses)) * 100 : 0,
    }));

    return {
      totalTrades: trades.length,
      openTrades: trades.filter(t => t.status === "open").length,
      closedTrades: closedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      totalPnL,
      winRate,
      avgWin,
      avgLoss,
      profitFactor,
      avgRating,
      pnlOverTime,
      marketData,
      typeData,
      winLossData,
      emotionData,
      strategyData,
    };
  }, [trades]);

  if (trades.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No analytics available</h3>
          <p className="text-muted-foreground">Start logging trades to see your performance analytics.</p>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    { icon: Activity, label: "Total Trades", value: analytics.totalTrades, color: "text-blue-500" },
    { icon: Target, label: "Win Rate", value: `${analytics.winRate.toFixed(1)}%`, color: "text-green-500" },
    { icon: DollarSign, label: "Total P&L", value: `$${analytics.totalPnL.toFixed(2)}`, color: analytics.totalPnL >= 0 ? "text-green-500" : "text-red-500" },
    { icon: BarChart3, label: "Profit Factor", value: analytics.profitFactor === Infinity ? "∞" : analytics.profitFactor.toFixed(2), color: "text-purple-500" },
    { icon: TrendingUp, label: "Avg Win", value: `$${analytics.avgWin.toFixed(2)}`, color: "text-green-500" },
    { icon: TrendingDown, label: "Avg Loss", value: `$${analytics.avgLoss.toFixed(2)}`, color: "text-red-500" },
    { icon: Award, label: "Avg Rating", value: analytics.avgRating.toFixed(1), color: "text-yellow-500" },
    { icon: Activity, label: "Open Trades", value: analytics.openTrades, color: "text-cyan-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative P&L Chart */}
        {analytics.pnlOverTime.length > 0 && (
          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Cumulative P&L Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.pnlOverTime}>
                  <defs>
                    <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                    labelStyle={{ color: "#f9fafb" }}
                  />
                  <Area type="monotone" dataKey="cumulative" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPnl)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Win/Loss Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Win/Loss Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={analytics.winLossData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {analytics.winLossData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trades by Market */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Trades by Market
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={analytics.marketData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {analytics.marketData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance by Strategy */}
        {analytics.strategyData.length > 0 && (
          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Performance by Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.strategyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                    formatter={(value: number, name: string) => [
                      name === "pnl" ? `$${value.toFixed(2)}` : `${value.toFixed(1)}%`,
                      name === "pnl" ? "P&L" : "Win Rate"
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="pnl" name="P&L" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Emotions Distribution */}
        {analytics.emotionData.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Emotions Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.emotionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Trade Types */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Long vs Short
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={analytics.typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JournalAnalytics;
