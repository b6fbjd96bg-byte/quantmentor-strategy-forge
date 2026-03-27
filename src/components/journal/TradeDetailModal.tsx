import { useState } from "react";
import { format } from "date-fns";
import { 
  X, TrendingUp, TrendingDown, Calendar, Target, 
  Brain, Star, Tag, MessageSquare, Clock, Loader2,
  CheckCircle2, AlertTriangle, Sparkles, BarChart3
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { Trade } from "@/pages/TradeJournal";

interface AIAnalysis {
  verdict: string;
  confidence: number;
  summary: string;
  technicalFactors: { factor: string; value: string; impact: string; explanation: string }[];
  trendAnalysis?: string;
  volumeAnalysis?: string;
  candleStructure?: string;
  keyMistake?: string;
  improvementTip?: string;
  riskRewardRatio?: string;
  gradeOutOf10?: number;
}

interface TradeDetailModalProps {
  trade: Trade | null;
  onClose: () => void;
}

const TradeDetailModal = ({ trade, onClose }: TradeDetailModalProps) => {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!trade) return null;

  const isProfitable = (trade.profit_loss || 0) >= 0;

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-trade`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ trade }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Analysis failed');
      }

      const data = await resp.json();
      setAiAnalysis(data);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Failed to analyze trade');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={!!trade} onOpenChange={() => { onClose(); setAiAnalysis(null); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground">
            <span className="text-2xl font-bold">{trade.symbol}</span>
            <Badge variant={trade.trade_type === "long" ? "default" : "destructive"}>
              {trade.trade_type.toUpperCase()}
            </Badge>
            <Badge variant={trade.status === "open" ? "outline" : "secondary"}>
              {trade.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* P&L Summary */}
          {trade.status === "closed" && trade.profit_loss !== null && (
            <div className={`p-4 rounded-lg ${isProfitable ? "bg-accent/10" : "bg-destructive/10"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isProfitable ? (
                    <TrendingUp className="h-8 w-8 text-accent" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-destructive" />
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Profit/Loss</p>
                    <p className={`text-2xl font-bold ${isProfitable ? "text-accent" : "text-destructive"}`}>
                      {isProfitable ? "+" : ""}${trade.profit_loss?.toFixed(2)}
                    </p>
                  </div>
                </div>
                {trade.profit_loss_percentage && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Return</p>
                    <p className={`text-xl font-bold ${isProfitable ? "text-accent" : "text-destructive"}`}>
                      {isProfitable ? "+" : ""}{trade.profit_loss_percentage?.toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Analysis Button */}
          {trade.status === "closed" && !aiAnalysis && (
            <Button
              onClick={runAIAnalysis}
              disabled={isAnalyzing}
              className="w-full gap-2"
              variant="outline"
            >
              {isAnalyzing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> AI is analyzing this trade...</>
              ) : (
                <><Brain className="w-4 h-4 text-primary" /> Run AI Post-Trade Analysis</>
              )}
            </Button>
          )}

          {/* AI Analysis Results */}
          {aiAnalysis && (
            <div className="space-y-4 border border-primary/20 rounded-lg p-4 bg-primary/5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Post-Trade Analysis
                </h3>
                <div className="flex items-center gap-2">
                  <Badge className={`${aiAnalysis.verdict === 'WIN' ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'}`}>
                    {aiAnalysis.verdict}
                  </Badge>
                  {aiAnalysis.gradeOutOf10 && (
                    <Badge variant="outline">{aiAnalysis.gradeOutOf10}/10</Badge>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{aiAnalysis.summary}</p>

              {/* Technical Factors */}
              {aiAnalysis.technicalFactors?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Technical Factors</p>
                  {aiAnalysis.technicalFactors.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs bg-muted/30 rounded-lg p-2">
                      {f.impact === 'positive' ? (
                        <CheckCircle2 className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <span className="font-medium text-foreground">{f.factor}</span>
                        {f.value && <span className="text-muted-foreground ml-1">({f.value})</span>}
                        <p className="text-muted-foreground">{f.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Analysis Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {aiAnalysis.trendAnalysis && (
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Trend</p>
                    <p className="text-xs text-foreground">{aiAnalysis.trendAnalysis}</p>
                  </div>
                )}
                {aiAnalysis.volumeAnalysis && (
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Volume</p>
                    <p className="text-xs text-foreground">{aiAnalysis.volumeAnalysis}</p>
                  </div>
                )}
                {aiAnalysis.candleStructure && (
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Candle Structure</p>
                    <p className="text-xs text-foreground">{aiAnalysis.candleStructure}</p>
                  </div>
                )}
                {aiAnalysis.riskRewardRatio && (
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Risk:Reward</p>
                    <p className="text-xs text-foreground">{aiAnalysis.riskRewardRatio}</p>
                  </div>
                )}
              </div>

              {/* Key Insight */}
              {aiAnalysis.keyMistake && (
                <div className={`p-3 rounded-lg border ${isProfitable ? 'bg-accent/5 border-accent/20' : 'bg-destructive/5 border-destructive/20'}`}>
                  <p className="text-xs font-semibold text-foreground mb-1">
                    {isProfitable ? '💪 Key Strength' : '⚠️ Key Mistake'}
                  </p>
                  <p className="text-xs text-muted-foreground">{aiAnalysis.keyMistake}</p>
                </div>
              )}

              {aiAnalysis.improvementTip && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs font-semibold text-foreground mb-1">💡 Improvement Tip</p>
                  <p className="text-xs text-muted-foreground">{aiAnalysis.improvementTip}</p>
                </div>
              )}
            </div>
          )}

          {/* Trade Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Market</p>
              <p className="text-foreground font-medium">{trade.market}</p>
            </div>
            {trade.timeframe && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Timeframe</p>
                <p className="text-foreground font-medium">{trade.timeframe}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Entry Price</p>
              <p className="text-foreground font-medium">${trade.entry_price.toLocaleString()}</p>
            </div>
            {trade.exit_price && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Exit Price</p>
                <p className="text-foreground font-medium">${trade.exit_price.toLocaleString()}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Quantity</p>
              <p className="text-foreground font-medium">{trade.quantity}</p>
            </div>
            {trade.strategy_used && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Strategy</p>
                <p className="text-foreground font-medium">{trade.strategy_used}</p>
              </div>
            )}
          </div>

          <Separator className="bg-border" />

          {/* Dates */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Entry Date</p>
                <p className="text-sm text-foreground">{format(new Date(trade.entry_date), "PPP 'at' p")}</p>
              </div>
            </div>
            {trade.exit_date && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Exit Date</p>
                  <p className="text-sm text-foreground">{format(new Date(trade.exit_date), "PPP 'at' p")}</p>
                </div>
              </div>
            )}
          </div>

          {/* Rating */}
          {trade.rating && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    className={`h-4 w-4 ${star <= trade.rating! ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Emotions */}
          {trade.emotions && (
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Emotion:</span>
              <Badge variant="outline">{trade.emotions}</Badge>
            </div>
          )}

          {/* Tags */}
          {trade.tags && trade.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trade.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          <Separator className="bg-border" />

          {/* Notes */}
          {trade.entry_reason && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Entry Reason</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">{trade.entry_reason}</p>
            </div>
          )}

          {trade.exit_reason && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-foreground">Exit Reason</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">{trade.exit_reason}</p>
            </div>
          )}

          {trade.lessons_learned && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Lessons Learned</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">{trade.lessons_learned}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-muted-foreground text-right">
            <p>Created: {format(new Date(trade.created_at), "PPP 'at' p")}</p>
            <p>Updated: {format(new Date(trade.updated_at), "PPP 'at' p")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradeDetailModal;
