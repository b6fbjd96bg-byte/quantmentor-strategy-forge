import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Plus, TrendingUp, TrendingDown, Calendar, Target,
  Brain, Star, Filter, Search, ArrowUpDown, BarChart3, PieChart,
  X, Edit2, Trash2, Eye, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import TradeForm from "@/components/journal/TradeForm";
import TradeCard from "@/components/journal/TradeCard";
import JournalAnalytics from "@/components/journal/JournalAnalytics";
import TradeDetailModal from "@/components/journal/TradeDetailModal";

export interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  trade_type: "long" | "short";
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  entry_date: string;
  exit_date: string | null;
  status: "open" | "closed";
  profit_loss: number | null;
  profit_loss_percentage: number | null;
  strategy_used: string | null;
  market: string;
  timeframe: string | null;
  entry_reason: string | null;
  exit_reason: string | null;
  lessons_learned: string | null;
  emotions: string | null;
  rating: number | null;
  tags: string[] | null;
  screenshots: string[] | null;
  created_at: string;
  updated_at: string;
}

const TradeJournal = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [marketFilter, setMarketFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("entry_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const tradesPerPage = 9;

  useEffect(() => {
    checkAuthAndFetchTrades();
  }, []);

  const checkAuthAndFetchTrades = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    fetchTrades();
  };

  const fetchTrades = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("trade_journal")
      .select("*")
      .order("entry_date", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching trades",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTrades(data as Trade[]);
    }
    setLoading(false);
  };

  const handleDeleteTrade = async (tradeId: string) => {
    const { error } = await supabase
      .from("trade_journal")
      .delete()
      .eq("id", tradeId);

    if (error) {
      toast({
        title: "Error deleting trade",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Trade deleted",
        description: "The trade has been removed from your journal.",
      });
      fetchTrades();
    }
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingTrade(null);
    fetchTrades();
  };

  // Filtering and sorting
  const filteredTrades = trades.filter((trade) => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.strategy_used?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.entry_reason?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || trade.status === statusFilter;
    const matchesMarket = marketFilter === "all" || trade.market === marketFilter;
    return matchesSearch && matchesStatus && matchesMarket;
  }).sort((a, b) => {
    let aVal: any, bVal: any;
    switch (sortBy) {
      case "entry_date":
        aVal = new Date(a.entry_date).getTime();
        bVal = new Date(b.entry_date).getTime();
        break;
      case "profit_loss":
        aVal = a.profit_loss || 0;
        bVal = b.profit_loss || 0;
        break;
      case "symbol":
        aVal = a.symbol;
        bVal = b.symbol;
        break;
      default:
        aVal = a.entry_date;
        bVal = b.entry_date;
    }
    if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTrades.length / tradesPerPage);
  const paginatedTrades = filteredTrades.slice(
    (currentPage - 1) * tradesPerPage,
    currentPage * tradesPerPage
  );

  // Get unique markets for filter
  const uniqueMarkets = [...new Set(trades.map(t => t.market))];

  return (
    <div className="min-h-screen bg-background flex w-full">
      <DashboardSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                Trade Journal
              </h1>
              <p className="text-muted-foreground mt-1">
                Log, analyze, and learn from your trading decisions
              </p>
            </div>
            <Button 
              onClick={() => { setEditingTrade(null); setIsFormOpen(true); }}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Log New Trade
            </Button>
          </div>

          <Tabs defaultValue="trades" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="trades" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BookOpen className="h-4 w-4 mr-2" />
                All Trades
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trades" className="space-y-6">
              {/* Filters */}
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by symbol, strategy, or notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-background border-border"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-[150px] bg-background border-border">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={marketFilter} onValueChange={setMarketFilter}>
                      <SelectTrigger className="w-full md:w-[150px] bg-background border-border">
                        <SelectValue placeholder="Market" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Markets</SelectItem>
                        {uniqueMarkets.map(market => (
                          <SelectItem key={market} value={market}>{market}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full md:w-[150px] bg-background border-border">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry_date">Date</SelectItem>
                        <SelectItem value="profit_loss">P&L</SelectItem>
                        <SelectItem value="symbol">Symbol</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="border-border"
                    >
                      <ArrowUpDown className={`h-4 w-4 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trades Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Card key={i} className="bg-card border-border animate-pulse">
                      <CardContent className="p-6 h-48" />
                    </Card>
                  ))}
                </div>
              ) : paginatedTrades.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {trades.length === 0 ? "No trades logged yet" : "No trades match your filters"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {trades.length === 0 
                        ? "Start documenting your trading journey by logging your first trade."
                        : "Try adjusting your search or filter criteria."}
                    </p>
                    {trades.length === 0 && (
                      <Button onClick={() => setIsFormOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Log Your First Trade
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {paginatedTrades.map((trade, index) => (
                        <TradeCard
                          key={trade.id}
                          trade={trade}
                          index={index}
                          onView={() => setSelectedTrade(trade)}
                          onEdit={() => handleEditTrade(trade)}
                          onDelete={() => handleDeleteTrade(trade.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="border-border"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground px-4">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="border-border"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="analytics">
              <JournalAnalytics trades={trades} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Trade Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingTrade ? "Edit Trade" : "Log New Trade"}
            </DialogTitle>
          </DialogHeader>
          <TradeForm 
            trade={editingTrade} 
            onSuccess={handleFormSuccess}
            onCancel={() => { setIsFormOpen(false); setEditingTrade(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Trade Detail Modal */}
      <TradeDetailModal 
        trade={selectedTrade}
        onClose={() => setSelectedTrade(null)}
      />
    </div>
  );
};

export default TradeJournal;
