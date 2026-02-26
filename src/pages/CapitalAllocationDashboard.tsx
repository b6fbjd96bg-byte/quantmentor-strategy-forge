import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp, TrendingDown, Shield, Zap, PieChart, BarChart3,
  ArrowUpRight, ArrowDownRight, RefreshCw, AlertTriangle, DollarSign,
  Activity, ChevronRight
} from "lucide-react";
import { AreaChart, Area, PieChart as RePieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import Navbar from "@/components/Navbar";

const CapitalAllocationDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [allocation, setAllocation] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/auth'); return; }

      const { data: allocations } = await supabase
        .from('capital_allocations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (allocations && allocations.length > 0) {
        setAllocation(allocations[0]);

        const { data: histData } = await supabase
          .from('allocation_history')
          .select('*')
          .eq('allocation_id', allocations[0].id)
          .order('snapshot_date', { ascending: true });

        setHistory(histData || []);
      }
      setIsLoading(false);
    };
    load();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!allocation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 px-4 lg:px-8 pb-12">
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">No Capital Allocation Yet</h2>
            <p className="text-muted-foreground mb-6">Start by allocating capital to our AI-managed strategies.</p>
            <Link to="/capital-allocation/start">
              <Button variant="hero" className="gap-2">
                <Zap className="w-5 h-5" />
                Start Allocating
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalPnL = Number(allocation.current_value) - Number(allocation.capital_amount);
  const totalPnLPercent = (totalPnL / Number(allocation.capital_amount)) * 100;
  const performanceData = history.map(h => ({
    date: new Date(h.snapshot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: Number(h.total_value),
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display text-3xl font-bold mb-1">Capital Allocation Dashboard</h1>
                <p className="text-muted-foreground">Monitor your AI-managed portfolio performance.</p>
              </div>
              <div className="flex gap-3">
                <Link to="/capital-allocation/analytics">
                  <Button variant="outline" className="gap-2"><BarChart3 className="w-4 h-4" />Analytics</Button>
                </Link>
                <Link to="/capital-allocation/start">
                  <Button variant="hero" className="gap-2"><Zap className="w-4 h-4" />Add Capital</Button>
                </Link>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Portfolio Value', value: `$${Number(allocation.current_value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: DollarSign, positive: true },
                { label: 'Total P&L', value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)} (${totalPnLPercent.toFixed(1)}%)`, icon: TrendingUp, positive: totalPnL >= 0 },
                { label: 'Risk Profile', value: allocation.risk_profile.charAt(0).toUpperCase() + allocation.risk_profile.slice(1), icon: Shield },
                { label: 'Status', value: allocation.status.charAt(0).toUpperCase() + allocation.status.slice(1), icon: Activity },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <stat.icon className="w-6 h-6 text-primary" />
                        </div>
                        {stat.positive !== undefined && (stat.positive ? <ArrowUpRight className="w-5 h-5 text-accent" /> : <ArrowDownRight className="w-5 h-5 text-destructive" />)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className={`font-display text-xl font-bold ${stat.positive !== undefined ? (stat.positive ? 'text-accent' : 'text-destructive') : ''}`}>{stat.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Performance Chart */}
            {performanceData.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Allocation Details */}
            <Card>
              <CardHeader>
                <CardTitle>Allocation Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Initial Capital</p>
                    <p className="font-bold">${Number(allocation.capital_amount).toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Platform Fee</p>
                    <p className="font-bold">{(Number(allocation.platform_fee_rate) * 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Performance Fee</p>
                    <p className="font-bold">{(Number(allocation.performance_fee_rate) * 100).toFixed(0)}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Fees Paid</p>
                    <p className="font-bold">${Number(allocation.total_fees_paid).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapitalAllocationDashboard;
