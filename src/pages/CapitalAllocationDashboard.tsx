import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Percent,
  Activity,
  Calendar,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { AreaChart, Area, PieChart as RePieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import Navbar from "@/components/Navbar";

// Mock data for demonstration
const performanceData = [
  { date: "Jan", value: 10000, benchmark: 10000 },
  { date: "Feb", value: 10420, benchmark: 10150 },
  { date: "Mar", value: 10890, benchmark: 10050 },
  { date: "Apr", value: 11250, benchmark: 10380 },
  { date: "May", value: 10980, benchmark: 10220 },
  { date: "Jun", value: 11680, benchmark: 10450 },
  { date: "Jul", value: 12150, benchmark: 10680 },
  { date: "Aug", value: 12580, benchmark: 10520 },
  { date: "Sep", value: 12890, benchmark: 10750 },
  { date: "Oct", value: 13250, benchmark: 10980 },
  { date: "Nov", value: 13680, benchmark: 11150 },
  { date: "Dec", value: 14120, benchmark: 11320 }
];

const strategyAllocations = [
  { name: "Momentum Alpha", allocation: 25, pnl: 2850, pnlPercent: 28.5, sharpe: 2.1, color: "#06b6d4" },
  { name: "Mean Reversion", allocation: 20, pnl: 1420, pnlPercent: 14.2, sharpe: 1.8, color: "#8b5cf6" },
  { name: "Trend Following", allocation: 18, pnl: 980, pnlPercent: 10.9, sharpe: 1.6, color: "#10b981" },
  { name: "Volatility Capture", allocation: 15, pnl: 650, pnlPercent: 8.7, sharpe: 1.4, color: "#f59e0b" },
  { name: "Statistical Arb", allocation: 12, pnl: 420, pnlPercent: 7.0, sharpe: 1.9, color: "#ec4899" },
  { name: "Smart Beta", allocation: 10, pnl: -200, pnlPercent: -4.0, sharpe: 0.8, color: "#6366f1" }
];

const drawdownData = [
  { date: "Jan", drawdown: 0 },
  { date: "Feb", drawdown: -1.2 },
  { date: "Mar", drawdown: -0.5 },
  { date: "Apr", drawdown: -2.8 },
  { date: "May", drawdown: -4.1 },
  { date: "Jun", drawdown: -1.5 },
  { date: "Jul", drawdown: -0.8 },
  { date: "Aug", drawdown: -3.2 },
  { date: "Sep", drawdown: -1.9 },
  { date: "Oct", drawdown: -0.4 },
  { date: "Nov", drawdown: -1.1 },
  { date: "Dec", drawdown: 0 }
];

const riskEvents = [
  { date: "2024-05-12", type: "Exposure Reduced", description: "Volatility spike detected. Exposure reduced by 15%.", icon: AlertTriangle },
  { date: "2024-08-03", type: "Strategy Paused", description: "Smart Beta breached max drawdown. Temporarily paused.", icon: Shield },
  { date: "2024-09-18", type: "Rebalance", description: "Weekly rebalance executed. Momentum Alpha increased.", icon: RefreshCw }
];

const CapitalAllocationDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentValue, setCurrentValue] = useState(14120);
  const [initialValue] = useState(10000);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentValue(prev => prev + (Math.random() - 0.48) * 20);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalPnL = currentValue - initialValue;
  const totalPnLPercent = ((currentValue - initialValue) / initialValue) * 100;
  const todayPnL = 145.80;
  const todayPnLPercent = 1.04;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-1">Capital Allocation Dashboard</h1>
                <p className="text-muted-foreground">Real-time performance tracking and analytics</p>
              </div>
              <div className="flex gap-3">
                <Link to="/capital-allocation/analytics">
                  <Button variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Full Analytics
                  </Button>
                </Link>
                <Link to="/capital-allocation/start">
                  <Button>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Add Capital
                  </Button>
                </Link>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Portfolio Value</span>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <motion.div 
                      className="text-2xl font-bold"
                      key={currentValue}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                    >
                      ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </motion.div>
                    <div className={`flex items-center gap-1 text-sm mt-1 ${totalPnL >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {totalPnL >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      <span>{totalPnL >= 0 ? "+" : ""}{totalPnLPercent.toFixed(2)}% all time</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Today's P&L</span>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-500">
                      +${todayPnL.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-sm mt-1 text-emerald-500">
                      <ArrowUpRight className="h-4 w-4" />
                      <span>+{todayPnLPercent}% today</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Max Drawdown</span>
                      <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-amber-500">-4.1%</div>
                    <div className="flex items-center gap-1 text-sm mt-1 text-muted-foreground">
                      <span>Within 15% limit</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-primary">1.82</div>
                    <div className="flex items-center gap-1 text-sm mt-1 text-muted-foreground">
                      <span>Risk-adjusted return</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="allocation">Allocation</TabsTrigger>
                <TabsTrigger value="risk">Risk Control</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Performance Chart */}
                  <Card className="lg:col-span-2 bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Portfolio Performance</CardTitle>
                      <CardDescription>Your portfolio vs benchmark (S&P 500)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={performanceData}>
                            <defs>
                              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth={2}
                              fill="url(#portfolioGradient)" 
                              name="Portfolio"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="benchmark" 
                              stroke="hsl(var(--muted-foreground))" 
                              strokeWidth={1}
                              strokeDasharray="5 5"
                              fill="transparent" 
                              name="Benchmark"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Allocation Pie */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Current Allocation</CardTitle>
                      <CardDescription>Capital distribution by strategy</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={strategyAllocations}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              dataKey="allocation"
                              stroke="none"
                            >
                              {strategyAllocations.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: number) => [`${value}%`, 'Allocation']}
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2 mt-4">
                        {strategyAllocations.slice(0, 4).map((strategy) => (
                          <div key={strategy.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: strategy.color }} />
                              <span className="truncate">{strategy.name}</span>
                            </div>
                            <span className="font-medium">{strategy.allocation}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Strategy Performance Table */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Strategy Performance</CardTitle>
                    <CardDescription>Individual strategy contribution to portfolio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
                            <th className="pb-3 font-medium">Strategy</th>
                            <th className="pb-3 font-medium text-right">Allocation</th>
                            <th className="pb-3 font-medium text-right">P&L</th>
                            <th className="pb-3 font-medium text-right">Return</th>
                            <th className="pb-3 font-medium text-right">Sharpe</th>
                          </tr>
                        </thead>
                        <tbody>
                          {strategyAllocations.map((strategy) => (
                            <tr key={strategy.name} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: strategy.color }} />
                                  <span className="font-medium">{strategy.name}</span>
                                </div>
                              </td>
                              <td className="py-4 text-right">
                                <Progress value={strategy.allocation} className="h-2 w-20 ml-auto" />
                                <span className="text-sm text-muted-foreground">{strategy.allocation}%</span>
                              </td>
                              <td className={`py-4 text-right font-medium ${strategy.pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                {strategy.pnl >= 0 ? "+" : ""}${strategy.pnl.toLocaleString()}
                              </td>
                              <td className={`py-4 text-right ${strategy.pnlPercent >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                {strategy.pnlPercent >= 0 ? "+" : ""}{strategy.pnlPercent}%
                              </td>
                              <td className="py-4 text-right">
                                <Badge variant={strategy.sharpe >= 1.5 ? "default" : "secondary"} className={strategy.sharpe >= 1.5 ? "bg-primary/20 text-primary border-0" : ""}>
                                  {strategy.sharpe.toFixed(1)}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="allocation" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Allocation Distribution */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Allocation Distribution</CardTitle>
                      <CardDescription>How your capital is distributed</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {strategyAllocations.map((strategy) => (
                          <div key={strategy.name} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: strategy.color }} />
                                <span>{strategy.name}</span>
                              </div>
                              <span className="font-medium">${((currentValue * strategy.allocation) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div 
                                className="absolute h-full rounded-full"
                                style={{ backgroundColor: strategy.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${strategy.allocation}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rebalancing Schedule */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Rebalancing Schedule</CardTitle>
                      <CardDescription>Upcoming allocation adjustments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="border-primary/30 bg-primary/5">
                              Next Rebalance
                            </Badge>
                            <span className="text-sm text-muted-foreground">In 2 days</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>Weekly rebalance scheduled</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-muted-foreground">Rebalancing History</h4>
                          {[
                            { date: "Jan 22, 2024", change: "Momentum Alpha +3%, Smart Beta -3%" },
                            { date: "Jan 15, 2024", change: "Trend Following +2%, Statistical Arb -2%" },
                            { date: "Jan 8, 2024", change: "Mean Reversion +1%, Volatility Capture -1%" }
                          ].map((event, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                              <RefreshCw className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <div className="text-sm font-medium">{event.date}</div>
                                <div className="text-xs text-muted-foreground">{event.change}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="risk" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Drawdown Chart */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Drawdown History</CardTitle>
                      <CardDescription>Peak-to-trough decline over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={drawdownData}>
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(value) => `${value}%`} />
                            <Tooltip 
                              formatter={(value: number) => [`${value}%`, 'Drawdown']}
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="drawdown" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} opacity={0.7} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risk Events */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Risk Control Events</CardTitle>
                      <CardDescription>Automated risk management actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {riskEvents.map((event, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className={`p-2 rounded-lg ${
                              event.type === "Exposure Reduced" ? "bg-amber-500/10 text-amber-500" :
                              event.type === "Strategy Paused" ? "bg-red-500/10 text-red-500" :
                              "bg-primary/10 text-primary"
                            }`}>
                              <event.icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{event.type}</span>
                                <span className="text-xs text-muted-foreground">{event.date}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Risk Limits */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Profile Limits</CardTitle>
                    <CardDescription>Current status against your risk profile limits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      {[
                        { label: "Max Drawdown", current: 4.1, limit: 15, unit: "%" },
                        { label: "Volatility", current: 12.5, limit: 20, unit: "%" },
                        { label: "Correlation", current: 0.35, limit: 0.6, unit: "" }
                      ].map((metric) => (
                        <div key={metric.label} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{metric.label}</span>
                            <span className="font-medium">
                              {metric.current}{metric.unit} / {metric.limit}{metric.unit}
                            </span>
                          </div>
                          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                            <motion.div 
                              className={`absolute h-full rounded-full ${
                                (metric.current / metric.limit) > 0.8 ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(metric.current / metric.limit) * 100}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground text-right">
                            {((metric.current / metric.limit) * 100).toFixed(0)}% of limit
                          </div>
                        </div>
                      ))}
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

export default CapitalAllocationDashboard;
