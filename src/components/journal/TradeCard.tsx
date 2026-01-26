import { motion } from "framer-motion";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Eye, Edit2, Trash2, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Trade } from "@/pages/TradeJournal";

interface TradeCardProps {
  trade: Trade;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TradeCard = ({ trade, index, onView, onEdit, onDelete }: TradeCardProps) => {
  const isProfitable = (trade.profit_loss || 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 group">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">{trade.symbol}</span>
              <Badge variant={trade.trade_type === "long" ? "default" : "destructive"} className="text-xs">
                {trade.trade_type.toUpperCase()}
              </Badge>
            </div>
            <Badge variant={trade.status === "open" ? "outline" : "secondary"} className="text-xs">
              {trade.status}
            </Badge>
          </div>

          {/* Price Info */}
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <span className="text-muted-foreground">Entry:</span>
              <span className="ml-2 text-foreground font-medium">${trade.entry_price.toLocaleString()}</span>
            </div>
            {trade.exit_price && (
              <div>
                <span className="text-muted-foreground">Exit:</span>
                <span className="ml-2 text-foreground font-medium">${trade.exit_price.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* P&L */}
          {trade.status === "closed" && trade.profit_loss !== null && (
            <div className={`flex items-center gap-2 p-2 rounded-lg mb-3 ${
              isProfitable ? "bg-green-500/10" : "bg-red-500/10"
            }`}>
              {isProfitable ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`font-bold ${isProfitable ? "text-green-500" : "text-red-500"}`}>
                {isProfitable ? "+" : ""}{trade.profit_loss?.toFixed(2)}
              </span>
              {trade.profit_loss_percentage && (
                <span className={`text-sm ${isProfitable ? "text-green-400" : "text-red-400"}`}>
                  ({isProfitable ? "+" : ""}{trade.profit_loss_percentage?.toFixed(2)}%)
                </span>
              )}
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <span>{trade.market}</span>
            {trade.timeframe && (
              <>
                <span>•</span>
                <span>{trade.timeframe}</span>
              </>
            )}
            <span>•</span>
            <span>{format(new Date(trade.entry_date), "MMM d, yyyy")}</span>
          </div>

          {/* Rating */}
          {trade.rating && (
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  className={`h-3 w-3 ${star <= trade.rating! ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} 
                />
              ))}
            </div>
          )}

          {/* Tags */}
          {trade.tags && trade.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {trade.tags.slice(0, 3).map(tag => (
                <span key={tag} className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">
                  {tag}
                </span>
              ))}
              {trade.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">+{trade.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={onView} className="flex-1">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit} className="flex-1">
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TradeCard;
