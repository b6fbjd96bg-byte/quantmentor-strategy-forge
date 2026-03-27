import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Medal, Crown, TrendingUp, Share2, Download,
  Calendar, BarChart3, Target, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

interface LeaderboardEntry {
  rank: number;
  trader_name: string;
  strategy_name: string;
  return_pct: number;
  win_rate: number;
  total_trades: number;
  is_verified: boolean;
}

// Demo leaderboard data
const generateLeaderboard = (period: string): LeaderboardEntry[] => {
  const traders = [
    { name: "AlphaTrader_X", strategy: "RSI Momentum Surge", base_return: 24.5, wr: 72, trades: 156 },
    { name: "QuantWolf", strategy: "EMA Breakout Pro", base_return: 19.8, wr: 68, trades: 203 },
    { name: "NiftySniper", strategy: "VWAP Mean Reversion", base_return: 17.2, wr: 65, trades: 89 },
    { name: "DeltaHunter", strategy: "Bollinger Squeeze", base_return: 15.1, wr: 71, trades: 134 },
    { name: "SwingKing_IN", strategy: "MACD Divergence", base_return: 13.7, wr: 63, trades: 67 },
    { name: "ScalpMaster99", strategy: "Order Flow Scalper", base_return: 12.3, wr: 78, trades: 412 },
    { name: "TrendRider", strategy: "Supertrend Follow", base_return: 11.8, wr: 59, trades: 98 },
    { name: "CryptoBot_AI", strategy: "Volume Profile Play", base_return: 10.5, wr: 62, trades: 245 },
    { name: "OptionsGuru", strategy: "Iron Condor Auto", base_return: 9.2, wr: 74, trades: 56 },
    { name: "MomentumPro", strategy: "Fibonacci Retracement", base_return: 8.1, wr: 61, trades: 178 },
  ];

  const multiplier = period === "week" ? 0.25 : period === "month" ? 1 : 3;
  return traders.map((t, i) => ({
    rank: i + 1,
    trader_name: t.name,
    strategy_name: t.strategy,
    return_pct: +(t.base_return * multiplier).toFixed(1),
    win_rate: t.wr,
    total_trades: Math.round(t.trades * multiplier),
    is_verified: i < 3,
  }));
};

const Leaderboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [period, setPeriod] = useState("month");
  const [shareModalEntry, setShareModalEntry] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/auth");
    };
    check();
  }, []);

  const leaderboard = generateLeaderboard(period);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/5 border-yellow-500/20";
    if (rank === 2) return "bg-gray-400/5 border-gray-400/20";
    if (rank === 3) return "bg-amber-600/5 border-amber-600/20";
    return "bg-card border-border";
  };

  const handleShareRank = (entry: LeaderboardEntry) => {
    setShareModalEntry(entry);
    toast({ title: "Rank card generated!", description: "You can now download and share your rank." });
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <DashboardSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <Trophy className="h-7 w-7 md:h-8 md:w-8 text-yellow-400" />
                Leaderboard
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                Top traders and strategies ranked by performance
              </p>
            </div>
          </div>

          {/* Period Tabs */}
          <Tabs value={period} onValueChange={setPeriod} className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="week" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                This Week
              </TabsTrigger>
              <TabsTrigger value="month" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                This Month
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                All Time
              </TabsTrigger>
            </TabsList>

            {["week", "month", "all"].map(p => (
              <TabsContent key={p} value={p} className="space-y-3">
                {/* Top 3 Podium */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {leaderboard.slice(0, 3).map((entry, i) => (
                    <motion.div
                      key={entry.rank}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className={`${getRankBg(entry.rank)} border transition-all hover:border-primary/40`}>
                        <CardContent className="p-5 text-center">
                          <div className="flex justify-center mb-3">{getRankIcon(entry.rank)}</div>
                          <h3 className="font-bold text-foreground mb-1">{entry.trader_name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{entry.strategy_name}</p>
                          <p className="text-2xl font-bold text-accent mb-2">+{entry.return_pct}%</p>
                          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                            <span>WR: {entry.win_rate}%</span>
                            <span>{entry.total_trades} trades</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 border-border"
                            onClick={() => handleShareRank(entry)}
                          >
                            <Share2 className="h-3.5 w-3.5 mr-1" />Share
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Full Table */}
                <Card className="bg-card border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 text-xs font-medium text-muted-foreground">#</th>
                          <th className="text-left p-3 text-xs font-medium text-muted-foreground">Trader</th>
                          <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Strategy</th>
                          <th className="text-right p-3 text-xs font-medium text-muted-foreground">Return</th>
                          <th className="text-right p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Win Rate</th>
                          <th className="text-right p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Trades</th>
                          <th className="text-right p-3 text-xs font-medium text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((entry, i) => (
                          <motion.tr
                            key={entry.rank}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i < 3 ? "bg-muted/10" : ""}`}
                          >
                            <td className="p-3">{getRankIcon(entry.rank)}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground text-sm">{entry.trader_name}</span>
                                {entry.is_verified && <Badge className="bg-primary/20 text-primary text-xs">Verified</Badge>}
                              </div>
                              <span className="text-xs text-muted-foreground md:hidden">{entry.strategy_name}</span>
                            </td>
                            <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">{entry.strategy_name}</td>
                            <td className="p-3 text-right">
                              <span className="font-bold text-accent text-sm">+{entry.return_pct}%</span>
                            </td>
                            <td className="p-3 text-right text-sm text-foreground hidden sm:table-cell">{entry.win_rate}%</td>
                            <td className="p-3 text-right text-sm text-muted-foreground hidden sm:table-cell">{entry.total_trades}</td>
                            <td className="p-3 text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleShareRank(entry)}>
                                <Share2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>

      {/* Share Card Modal */}
      {shareModalEntry && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShareModalEntry(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-card to-background border border-primary/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="flex justify-center mb-3">{getRankIcon(shareModalEntry.rank)}</div>
              <h3 className="text-xl font-bold text-foreground">{shareModalEntry.trader_name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{shareModalEntry.strategy_name}</p>
              <div className="bg-background rounded-xl p-4 mb-4">
                <p className="text-3xl font-bold text-accent">+{shareModalEntry.return_pct}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {period === "week" ? "This Week" : period === "month" ? "This Month" : "All Time"} Return
                </p>
              </div>
              <div className="flex justify-center gap-6 text-sm text-muted-foreground mb-4">
                <div><span className="font-bold text-foreground">{shareModalEntry.win_rate}%</span> Win Rate</div>
                <div><span className="font-bold text-foreground">{shareModalEntry.total_trades}</span> Trades</div>
              </div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-4">
                <span>Powered by</span>
                <span className="font-bold text-primary">QuantMentor</span>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={() => {
                  navigator.clipboard.writeText(
                    `🏆 Rank #${shareModalEntry.rank} on QuantMentor!\n📈 Return: +${shareModalEntry.return_pct}%\n🎯 Win Rate: ${shareModalEntry.win_rate}%\nhttps://quantmentor.org/leaderboard`
                  );
                  toast({ title: "Copied to clipboard!" });
                }}>
                  <Share2 className="h-4 w-4 mr-2" />Share
                </Button>
                <Button variant="outline" className="border-border" onClick={() => setShareModalEntry(null)}>
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
