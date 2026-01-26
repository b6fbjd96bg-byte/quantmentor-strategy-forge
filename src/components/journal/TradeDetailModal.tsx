import { format } from "date-fns";
import { 
  X, TrendingUp, TrendingDown, Calendar, Target, 
  Brain, Star, Tag, MessageSquare, Clock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Trade } from "@/pages/TradeJournal";

interface TradeDetailModalProps {
  trade: Trade | null;
  onClose: () => void;
}

const TradeDetailModal = ({ trade, onClose }: TradeDetailModalProps) => {
  if (!trade) return null;

  const isProfitable = (trade.profit_loss || 0) >= 0;

  return (
    <Dialog open={!!trade} onOpenChange={() => onClose()}>
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
            <div className={`p-4 rounded-lg ${isProfitable ? "bg-green-500/10" : "bg-red-500/10"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isProfitable ? (
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Profit/Loss</p>
                    <p className={`text-2xl font-bold ${isProfitable ? "text-green-500" : "text-red-500"}`}>
                      {isProfitable ? "+" : ""}${trade.profit_loss?.toFixed(2)}
                    </p>
                  </div>
                </div>
                {trade.profit_loss_percentage && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Return</p>
                    <p className={`text-xl font-bold ${isProfitable ? "text-green-500" : "text-red-500"}`}>
                      {isProfitable ? "+" : ""}{trade.profit_loss_percentage?.toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>
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
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-foreground">Entry Reason</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">{trade.entry_reason}</p>
            </div>
          )}

          {trade.exit_reason && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-foreground">Exit Reason</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">{trade.exit_reason}</p>
            </div>
          )}

          {trade.lessons_learned && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
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
