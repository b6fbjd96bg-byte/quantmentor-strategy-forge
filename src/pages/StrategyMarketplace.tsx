import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Store, Search, Filter, Star, Users, TrendingUp, TrendingDown,
  BadgeCheck, Copy, UserPlus, Upload, BarChart3, Target, Zap,
  ArrowUpDown, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

interface PublishedStrategy {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  strategy_type: string;
  markets: string[];
  timeframe: string | null;
  win_rate: number;
  profit_factor: number;
  max_drawdown: number;
  total_trades: number;
  paper_pnl: number;
  paper_win_rate: number;
  followers_count: number;
  is_verified: boolean;
  entry_rules: string | null;
  exit_rules: string | null;
  tags: string[];
  created_at: string;
}

const strategyTypes = [
  { value: "all", label: "All Types" },
  { value: "scalping", label: "Scalping" },
  { value: "swing", label: "Swing" },
  { value: "momentum", label: "Momentum" },
  { value: "breakout", label: "Breakout" },
  { value: "mean-reversion", label: "Mean Reversion" },
];

const StrategyMarketplace = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [strategies, setStrategies] = useState<PublishedStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("followers_count");
  const [selectedStrategy, setSelectedStrategy] = useState<PublishedStrategy | null>(null);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    setUserId(session.user.id);
    fetchStrategies();
    fetchFollowed(session.user.id);
  };

  const fetchStrategies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("published_strategies")
      .select("*")
      .eq("is_published", true)
      .order("followers_count", { ascending: false });

    if (!error && data) setStrategies(data as PublishedStrategy[]);
    setLoading(false);
  };

  const fetchFollowed = async (uid: string) => {
    const { data } = await supabase
      .from("strategy_followers")
      .select("strategy_id")
      .eq("user_id", uid);
    if (data) setFollowedIds(new Set(data.map(f => f.strategy_id)));
  };

  const handleFollow = async (strategyId: string) => {
    if (!userId) return;
    if (followedIds.has(strategyId)) {
      await supabase.from("strategy_followers").delete().eq("user_id", userId).eq("strategy_id", strategyId);
      setFollowedIds(prev => { const n = new Set(prev); n.delete(strategyId); return n; });
      toast({ title: "Unfollowed strategy" });
    } else {
      await supabase.from("strategy_followers").insert({ user_id: userId, strategy_id: strategyId });
      setFollowedIds(prev => new Set(prev).add(strategyId));
      toast({ title: "Following strategy!", description: "You'll receive updates on this strategy." });
    }
    fetchStrategies();
  };

  const handlePublish = () => {
    navigate("/submit-strategy");
  };

  const filtered = strategies
    .filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || s.strategy_type.toLowerCase() === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "followers_count") return b.followers_count - a.followers_count;
      if (sortBy === "win_rate") return b.win_rate - a.win_rate;
      if (sortBy === "profit_factor") return b.profit_factor - a.profit_factor;
      return 0;
    });

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      scalping: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      swing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      momentum: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      breakout: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      "mean-reversion": "bg-pink-500/20 text-pink-400 border-pink-500/30",
    };
    return colors[type.toLowerCase()] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <DashboardSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <div className="p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <Store className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                Strategy Marketplace
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                Browse, follow, and copy proven trading strategies
              </p>
            </div>
            <Button onClick={handlePublish} className="bg-primary hover:bg-primary/90">
              <Upload className="h-4 w-4 mr-2" />
              Publish Strategy
            </Button>
          </div>

          {/* Filters */}
          <Card className="bg-card border-border mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search strategies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {strategyTypes.map(t => (
                    <Button
                      key={t.value}
                      variant={typeFilter === t.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTypeFilter(t.value)}
                      className={typeFilter === t.value ? "bg-primary text-primary-foreground" : "border-border"}
                    >
                      {t.label}
                    </Button>
                  ))}
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-[160px] bg-background border-border">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="followers_count">Most Popular</SelectItem>
                    <SelectItem value="win_rate">Win Rate</SelectItem>
                    <SelectItem value="profit_factor">Profit Factor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <Card key={i} className="bg-card border-border animate-pulse"><CardContent className="p-6 h-64" /></Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No strategies found</h3>
                <p className="text-muted-foreground mb-4">Be the first to publish a strategy!</p>
                <Button onClick={handlePublish}><Upload className="h-4 w-4 mr-2" />Publish Strategy</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((strategy, i) => (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-card border-border hover:border-primary/40 transition-all group">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">{strategy.name}</h3>
                            {strategy.is_verified && (
                              <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getTypeColor(strategy.strategy_type)}>
                              {strategy.strategy_type}
                            </Badge>
                            {strategy.markets.slice(0, 2).map(m => (
                              <Badge key={m} variant="outline" className="text-xs border-border text-muted-foreground">
                                {m}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {strategy.description || "No description provided."}
                      </p>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-background rounded-lg p-2.5">
                          <p className="text-xs text-muted-foreground">Win Rate</p>
                          <p className={`text-sm font-bold ${strategy.win_rate >= 50 ? "text-accent" : "text-destructive"}`}>
                            {strategy.win_rate.toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-background rounded-lg p-2.5">
                          <p className="text-xs text-muted-foreground">Profit Factor</p>
                          <p className={`text-sm font-bold ${strategy.profit_factor >= 1 ? "text-accent" : "text-destructive"}`}>
                            {strategy.profit_factor.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-background rounded-lg p-2.5">
                          <p className="text-xs text-muted-foreground">Max DD</p>
                          <p className="text-sm font-bold text-destructive">
                            -{strategy.max_drawdown.toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-background rounded-lg p-2.5">
                          <p className="text-xs text-muted-foreground">Paper P&L</p>
                          <p className={`text-sm font-bold ${strategy.paper_pnl >= 0 ? "text-accent" : "text-destructive"}`}>
                            {strategy.paper_pnl >= 0 ? "+" : ""}{strategy.paper_pnl.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">{strategy.followers_count} followers</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{strategy.total_trades} trades</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-border"
                          onClick={() => setSelectedStrategy(strategy)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          className={`flex-1 ${followedIds.has(strategy.id) ? "bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30" : "bg-primary hover:bg-primary/90"}`}
                          onClick={() => handleFollow(strategy.id)}
                        >
                          <UserPlus className="h-3.5 w-3.5 mr-1" />
                          {followedIds.has(strategy.id) ? "Following" : "Follow"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border"
                          onClick={() => {
                            toast({ title: "Strategy copied!", description: "This strategy has been copied to your account." });
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Strategy Detail Modal */}
      <Dialog open={!!selectedStrategy} onOpenChange={() => setSelectedStrategy(null)}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              {selectedStrategy?.name}
              {selectedStrategy?.is_verified && <BadgeCheck className="h-5 w-5 text-primary" />}
            </DialogTitle>
          </DialogHeader>
          {selectedStrategy && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">{selectedStrategy.description}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-background rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                  <p className="text-lg font-bold text-accent">{selectedStrategy.win_rate.toFixed(1)}%</p>
                </div>
                <div className="bg-background rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Profit Factor</p>
                  <p className="text-lg font-bold text-primary">{selectedStrategy.profit_factor.toFixed(2)}</p>
                </div>
                <div className="bg-background rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Max DD</p>
                  <p className="text-lg font-bold text-destructive">-{selectedStrategy.max_drawdown.toFixed(1)}%</p>
                </div>
              </div>
              {selectedStrategy.entry_rules && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">Entry Rules</h4>
                  <p className="text-sm text-muted-foreground bg-background rounded-lg p-3">{selectedStrategy.entry_rules}</p>
                </div>
              )}
              {selectedStrategy.exit_rules && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">Exit Rules</h4>
                  <p className="text-sm text-muted-foreground bg-background rounded-lg p-3">{selectedStrategy.exit_rules}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={() => handleFollow(selectedStrategy.id)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {followedIds.has(selectedStrategy.id) ? "Unfollow" : "Follow"}
                </Button>
                <Button variant="outline" className="flex-1 border-border" onClick={() => {
                  toast({ title: "Strategy copied!" });
                  setSelectedStrategy(null);
                }}>
                  <Copy className="h-4 w-4 mr-2" />Copy Strategy
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StrategyMarketplace;
