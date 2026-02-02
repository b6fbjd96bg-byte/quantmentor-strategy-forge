import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock,
  ExternalLink
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface BotTrade {
  id: string;
  symbol: string;
  side: string;
  trade_type: string;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  profit_loss: number;
  profit_loss_percentage: number;
  status: string;
  entry_time: string;
  exit_time: string | null;
  broker: string;
  entry_reason: string | null;
  exit_reason: string | null;
}

interface BotTradesTableProps {
  trades: BotTrade[];
  isLoading?: boolean;
}

const BotTradesTable = ({ trades, isLoading }: BotTradesTableProps) => {
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="h-40 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card rounded-xl border border-border p-8 text-center"
      >
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">No Trades Yet</h3>
        <p className="text-sm text-muted-foreground">
          Start a trading bot to see live trades appear here.
        </p>
      </motion.div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border overflow-hidden"
    >
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Recent Bot Trades</h3>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">Symbol</TableHead>
              <TableHead className="text-muted-foreground">Side</TableHead>
              <TableHead className="text-muted-foreground">Entry</TableHead>
              <TableHead className="text-muted-foreground">Exit</TableHead>
              <TableHead className="text-muted-foreground">Qty</TableHead>
              <TableHead className="text-muted-foreground">P&L</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade) => (
              <TableRow key={trade.id} className="border-border hover:bg-muted/30">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{trade.symbol}</span>
                    <Badge variant="outline" className="text-xs">
                      {trade.broker}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={`${
                      trade.side === 'BUY' || trade.side === 'LONG'
                        ? 'bg-accent/20 text-accent border-accent/30' 
                        : 'bg-destructive/20 text-destructive border-destructive/30'
                    } border`}
                  >
                    {trade.side === 'BUY' || trade.side === 'LONG' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {trade.side}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  ${trade.entry_price.toLocaleString()}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {trade.exit_price ? `$${trade.exit_price.toLocaleString()}` : '-'}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {trade.quantity}
                </TableCell>
                <TableCell>
                  <span className={`font-bold ${
                    trade.profit_loss >= 0 ? 'text-accent' : 'text-destructive'
                  }`}>
                    {trade.profit_loss >= 0 ? '+' : ''}${trade.profit_loss.toFixed(2)}
                    <span className="text-xs ml-1 opacity-70">
                      ({trade.profit_loss_percentage >= 0 ? '+' : ''}{trade.profit_loss_percentage.toFixed(2)}%)
                    </span>
                  </span>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={`${
                      trade.status === 'open' 
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        : 'bg-muted text-muted-foreground border-border'
                    } border`}
                  >
                    {trade.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(trade.entry_time)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default BotTradesTable;
