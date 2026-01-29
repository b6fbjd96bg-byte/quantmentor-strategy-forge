import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter,
  Target,
  Activity,
  Percent
} from "lucide-react";
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar, 
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  ComposedChart, ReferenceLine
} from "recharts";
import Navbar from "@/components/Navbar";

// Extended mock data for analytics
const monthlyReturns = [
  { month: "Jan", return: 4.2, benchmark: 1.5 },
  { month: "Feb", return: -1.8, benchmark: -0.5 },
  { month: "Mar", return: 3.5, benchmark: 2.1 },
  { month: "Apr", return: 2.1, benchmark: 1.8 },
  { month: "May", return: -2.4, benchmark: -1.2 },
  { month: "Jun", return: 5.8, benchmark: 2.3 },
  { month: "Jul", return: 3.2, benchmark: 1.9 },
  { month: "Aug", return: 1.5, benchmark: 0.8 },
  { month: "Sep", return: 2.8, benchmark: 1.2 },
  { month: "Oct", return: 4.1, benchmark: 2.5 },
  { month: "Nov", return: 2.9, benchmark: 1.7 },
  { month: "Dec", return: 3.6, benchmark: 1.4 }
];

const drawdownHistory = [
  { date: "2023-01", drawdown: -2.1, recovery: 5 },
  { date: "2023-03", drawdown: -3.8, recovery: 12 },
  { date: "2023-05", drawdown: -4.1, recovery: 18 },
  { date: "2023-08", drawdown: -3.2, recovery: 10 },
  { date: "2023-11", drawdown: -1.5, recovery: 4 },
  { date: "2024-01", drawdown: -2.8, recovery: 8 }
];

const rollingMetrics = [
  { period: "30D", sharpe: 2.1, sortino: 2.8, calmar: 3.2 },
  { period: "60D", sharpe: 1.9, sortino: 2.5, calmar: 2.8 },
  { period: "90D", sharpe: 1.8, sortino: 2.3, calmar: 2.5 },
  { period: "180D", sharpe: 1.7, sortino: 2.1, calmar: 2.2 },
  { period: "1Y", sharpe: 1.6, sortino: 2.0, calmar: 1.9 }
];

const winLossData = [
  { name: "Winning Days", value: 156, percentage: 65 },
  { name: "Losing Days", value: 84, percentage: 35 }
];

const performanceByMarket = [
  { market: "Crypto", return: 28.5, trades: 1250, winRate: 58 },
  { market: "Forex", return: 12.3, trades: 890, winRate: 52 },
  { market: "Stocks", return: 18.7, trades: 650, winRate: 61 },
  { market: "Commodities", return: 8.9, trades: 320, winRate: 48 }
];

const correlationMatrix = [
  { strategy: "Momentum Alpha", momentum: 1.0, meanRev: 0.12, trend: 0.45, vol: -0.23, statArb: 0.08 },
  { strategy: "Mean Reversion", momentum: 0.12, meanRev: 1.0, trend: -0.18, vol: 0.35, statArb: 0.42 },
  { strategy: "Trend Following", momentum: 0.45, meanRev: -0.18, trend: 1.0, vol: 0.15, statArb: -0.08 },
  { strategy: "Volatility Capture", momentum: -0.23, meanRev: 0.35, trend: 0.15, vol: 1.0, statArb: 0.28 },
  { strategy: "Statistical Arb", momentum: 0.08, meanRev: 0.42, trend: -0.08, vol: 0.28, statArb: 1.0 }
];

const CapitalAllocationAnalytics = () => {
  const [timeframe, setTimeframe] = useState("1Y");

  const stats = [
    { label: "Total Return", value: "+41.2%", change: "+12.3% vs benchmark", positive: true },
    { label: "Annual Volatility", value: "14.2%", change: "Below target", positive: true },
    { label: "Max Drawdown", value: "-4.1%", change: "Best: -1.5%", positive: true },
    { label: "Sharpe Ratio", value: "1.82", change: "Above 1.5 target", positive: true },
    { label: "Sortino Ratio", value: "2.35", change: "Strong downside protection", positive: true },
    { label: "Win Rate", value: "65%", change: "156 of 240 days", positive: true }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-1">Performance Analytics</h1>
                <p className="text-muted-foreground">Deep dive into your portfolio performance metrics</p>
              </div>
              <div className="flex gap-3">
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1M">1 Month</SelectItem>
                    <SelectItem value="3M">3 Months</SelectItem>
                    <SelectItem value="6M">6 Months</SelectItem>
                    <SelectItem value="1Y">1 Year</SelectItem>
                    <SelectItem value="ALL">All Time</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-4">
                      <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                      <div className="text-xl font-bold">{stat.value}</div>
                      <div className={`text-xs mt-1 ${stat.positive ? "text-emerald-500" : "text-amber-500"}`}>
                        {stat.change}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Tabs defaultValue="returns" className="space-y-6">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="returns">Returns Analysis</TabsTrigger>
                <TabsTrigger value="drawdowns">Drawdowns</TabsTrigger>
                <TabsTrigger value="risk">Risk Metrics</TabsTrigger>
                <TabsTrigger value="correlation">Correlation</TabsTrigger>
              </TabsList>

              <TabsContent value="returns" className="space-y-6">
                {/* Monthly Returns Chart */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Returns</CardTitle>
                    <CardDescription>Portfolio vs benchmark performance by month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={monthlyReturns}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(value) => `${value}%`} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                            formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                          />
                          <ReferenceLine y={0} stroke="hsl(var(--border))" />
                          <Bar dataKey="return" name="Portfolio" radius={[4, 4, 0, 0]}>
                            {monthlyReturns.map((entry, index) => (
                              <motion.rect
                                key={index}
                                fill={entry.return >= 0 ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                                initial={{ opacity: 0, scaleY: 0 }}
                                animate={{ opacity: 0.8, scaleY: 1 }}
                                transition={{ delay: index * 0.05 }}
                              />
                            ))}
                          </Bar>
                          <Line type="monotone" dataKey="benchmark" name="Benchmark" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance by Market */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Performance by Market</CardTitle>
                    <CardDescription>Returns breakdown across different markets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                      {performanceByMarket.map((market, index) => (
                        <motion.div
                          key={market.market}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="text-lg font-semibold mb-2">{market.market}</div>
                          <div className={`text-2xl font-bold mb-3 ${market.return >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {market.return >= 0 ? "+" : ""}{market.return}%
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex justify-between">
                              <span>Trades</span>
                              <span>{market.trades.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Win Rate</span>
                              <span>{market.winRate}%</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="drawdowns" className="space-y-6">
                {/* Drawdown History */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Drawdown History</CardTitle>
                    <CardDescription>Historical drawdowns and recovery periods</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
                            <th className="pb-3 font-medium">Period</th>
                            <th className="pb-3 font-medium text-right">Drawdown</th>
                            <th className="pb-3 font-medium text-right">Recovery (Days)</th>
                            <th className="pb-3 font-medium text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {drawdownHistory.map((dd, index) => (
                            <motion.tr 
                              key={dd.date}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="border-b border-border/30"
                            >
                              <td className="py-4 font-medium">{dd.date}</td>
                              <td className="py-4 text-right text-red-500 font-semibold">{dd.drawdown}%</td>
                              <td className="py-4 text-right">{dd.recovery} days</td>
                              <td className="py-4 text-right">
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                                  Recovered
                                </Badge>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Win/Loss Distribution */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Win/Loss Distribution</CardTitle>
                      <CardDescription>Daily performance breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {winLossData.map((data, index) => (
                          <div key={data.name} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{data.name}</span>
                              <span className="font-medium">{data.value} days ({data.percentage}%)</span>
                            </div>
                            <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                              <motion.div 
                                className={`absolute h-full rounded-full ${index === 0 ? "bg-emerald-500" : "bg-red-500"}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${data.percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: index * 0.2 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Consecutive Streaks</CardTitle>
                      <CardDescription>Best and worst performance streaks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            <span className="font-medium">Best Winning Streak</span>
                          </div>
                          <div className="text-2xl font-bold text-emerald-500">12 Days</div>
                          <div className="text-sm text-muted-foreground">+8.4% cumulative return</div>
                        </div>
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="h-5 w-5 text-red-500" />
                            <span className="font-medium">Longest Losing Streak</span>
                          </div>
                          <div className="text-2xl font-bold text-red-500">4 Days</div>
                          <div className="text-sm text-muted-foreground">-2.1% cumulative loss</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="risk" className="space-y-6">
                {/* Rolling Risk Metrics */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Rolling Risk Metrics</CardTitle>
                    <CardDescription>Key risk-adjusted performance ratios over different periods</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
                            <th className="pb-3 font-medium">Period</th>
                            <th className="pb-3 font-medium text-center">Sharpe Ratio</th>
                            <th className="pb-3 font-medium text-center">Sortino Ratio</th>
                            <th className="pb-3 font-medium text-center">Calmar Ratio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rollingMetrics.map((metric, index) => (
                            <motion.tr 
                              key={metric.period}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="border-b border-border/30"
                            >
                              <td className="py-4 font-medium">{metric.period}</td>
                              <td className="py-4 text-center">
                                <Badge variant={metric.sharpe >= 1.5 ? "default" : "secondary"} className={metric.sharpe >= 1.5 ? "bg-primary/20 text-primary border-0" : ""}>
                                  {metric.sharpe.toFixed(2)}
                                </Badge>
                              </td>
                              <td className="py-4 text-center">
                                <Badge variant={metric.sortino >= 2.0 ? "default" : "secondary"} className={metric.sortino >= 2.0 ? "bg-emerald-500/20 text-emerald-500 border-0" : ""}>
                                  {metric.sortino.toFixed(2)}
                                </Badge>
                              </td>
                              <td className="py-4 text-center">
                                <Badge variant={metric.calmar >= 2.0 ? "default" : "secondary"} className={metric.calmar >= 2.0 ? "bg-cyan-500/20 text-cyan-500 border-0" : ""}>
                                  {metric.calmar.toFixed(2)}
                                </Badge>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Metric Explanations */}
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { name: "Sharpe Ratio", value: 1.82, description: "Measures risk-adjusted return. Higher is better. Above 1.0 is good, above 2.0 is excellent.", target: "> 1.5" },
                    { name: "Sortino Ratio", value: 2.35, description: "Like Sharpe but only penalizes downside volatility. Higher is better for downside protection.", target: "> 2.0" },
                    { name: "Calmar Ratio", value: 2.18, description: "Return divided by max drawdown. Measures recovery efficiency. Higher indicates faster recovery.", target: "> 2.0" }
                  ].map((metric, index) => (
                    <motion.div
                      key={metric.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full bg-card/50 border-border/50">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">{metric.name}</h3>
                            <Badge variant="outline" className="bg-primary/5 border-primary/30">
                              Target: {metric.target}
                            </Badge>
                          </div>
                          <div className="text-3xl font-bold text-primary mb-3">{metric.value}</div>
                          <p className="text-sm text-muted-foreground">{metric.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="correlation" className="space-y-6">
                {/* Correlation Matrix */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Strategy Correlation Matrix</CardTitle>
                    <CardDescription>Low correlation between strategies ensures better diversification</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-muted-foreground">
                            <th className="pb-3 font-medium"></th>
                            <th className="pb-3 font-medium text-center">Momentum</th>
                            <th className="pb-3 font-medium text-center">Mean Rev</th>
                            <th className="pb-3 font-medium text-center">Trend</th>
                            <th className="pb-3 font-medium text-center">Volatility</th>
                            <th className="pb-3 font-medium text-center">Stat Arb</th>
                          </tr>
                        </thead>
                        <tbody>
                          {correlationMatrix.map((row) => (
                            <tr key={row.strategy} className="border-b border-border/30">
                              <td className="py-3 font-medium">{row.strategy}</td>
                              {[row.momentum, row.meanRev, row.trend, row.vol, row.statArb].map((val, i) => (
                                <td key={i} className="py-3 text-center">
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                    val === 1 ? "bg-primary/20 text-primary" :
                                    Math.abs(val) < 0.2 ? "bg-emerald-500/20 text-emerald-500" :
                                    Math.abs(val) < 0.4 ? "bg-amber-500/20 text-amber-500" :
                                    "bg-red-500/20 text-red-500"
                                  }`}>
                                    {val.toFixed(2)}
                                  </span>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded bg-emerald-500/20" />
                        <span>Low (&lt;0.2)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded bg-amber-500/20" />
                        <span>Medium (0.2-0.4)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded bg-red-500/20" />
                        <span>High (&gt;0.4)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Diversification Score</CardTitle>
                    <CardDescription>Overall portfolio diversification assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <div className="relative h-32 w-32">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                          <motion.circle 
                            cx="50" cy="50" r="40" fill="none" 
                            stroke="hsl(var(--primary))" strokeWidth="8" 
                            strokeLinecap="round"
                            strokeDasharray={`${82 * 2.51} ${100 * 2.51}`}
                            initial={{ strokeDashoffset: 251 }}
                            animate={{ strokeDashoffset: 0 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold">82</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2">Excellent Diversification</h4>
                        <p className="text-muted-foreground text-sm mb-4">
                          Your portfolio has low overall correlation between strategies, which helps 
                          reduce risk and smooth out returns over time.
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Average Correlation</span>
                            <div className="font-semibold text-emerald-500">0.18</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Max Correlation</span>
                            <div className="font-semibold text-amber-500">0.45</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapitalAllocationAnalytics;
