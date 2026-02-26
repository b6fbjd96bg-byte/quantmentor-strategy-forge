import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp, TrendingDown, BarChart3, ArrowUpRight, ArrowDownRight,
  Calendar, Download, Target, Activity, Percent, RefreshCw, DollarSign
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, 
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import Navbar from "@/components/Navbar";

const CapitalAllocationAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [allocation, setAllocation] = useState<any>(null);
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
          <span className="ml-3 text-muted-foreground">Loading analytics...</span>
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
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">No Data Yet</h2>
            <p className="text-muted-foreground">Allocate capital first to see performance analytics.</p>
          </div>
        </div>
      </div>
    );
  }

  const dailyReturns = history.map(h => ({
    date: new Date(h.snapshot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    return: Number(h.daily_pnl_percentage),
    drawdown: Number(h.drawdown),
    value: Number(h.total_value),
  }));

  const totalPnL = Number(allocation.current_value) - Number(allocation.capital_amount);
  const maxDrawdown = history.length > 0 ? Math.min(...history.map(h => Number(h.drawdown))) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-3xl font-bold mb-1">Performance Analytics</h1>
                <p className="text-muted-foreground">Detailed analysis of your capital allocation performance.</p>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Return', value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`, icon: DollarSign, positive: totalPnL >= 0 },
                { label: 'Max Drawdown', value: `${maxDrawdown.toFixed(1)}%`, icon: TrendingDown },
                { label: 'Data Points', value: history.length.toString(), icon: Activity },
                { label: 'Current Value', value: `$${Number(allocation.current_value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: Target },
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
                      <p className="font-display text-xl font-bold">{stat.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {dailyReturns.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader><CardTitle>Portfolio Value</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyReturns}>
                          <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Daily Returns</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyReturns}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                          <Bar dataKey="return" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="mb-6">
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No historical data available yet. Analytics will appear as your allocation generates performance data.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapitalAllocationAnalytics;
