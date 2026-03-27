import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Shield, TrendingUp, TrendingDown, Wallet, BarChart3,
  CheckCircle2, Clock, Zap
} from 'lucide-react';

interface PaperTradingToggleProps {
  strategyName: string;
  isPaper: boolean;
  onToggle: (isPaper: boolean) => void;
}

const PaperTradingToggle = ({ strategyName, isPaper, onToggle }: PaperTradingToggleProps) => {
  // Simulated paper trading data
  const paperStats = {
    balance: 10000,
    pnl7d: 342.50,
    pnl7dPct: 3.42,
    pnl30d: 1250.80,
    pnl30dPct: 12.51,
    winRate: 68,
    totalTrades: 47,
    wins: 32,
    losses: 15,
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-4 space-y-4">
        {/* Toggle Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isPaper ? 'bg-accent/20' : 'bg-primary/20'
            }`}>
              {isPaper ? <Shield className="w-5 h-5 text-accent" /> : <Zap className="w-5 h-5 text-primary" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Trading Mode</p>
              <p className="text-xs text-muted-foreground">{strategyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium ${!isPaper ? 'text-primary' : 'text-muted-foreground'}`}>
              LIVE
            </span>
            <Switch
              checked={isPaper}
              onCheckedChange={onToggle}
            />
            <span className={`text-xs font-medium ${isPaper ? 'text-accent' : 'text-muted-foreground'}`}>
              PAPER
            </span>
          </div>
        </div>

        {/* Mode Badge */}
        <div className="flex items-center gap-2">
          {isPaper ? (
            <Badge className="bg-accent/20 text-accent border-accent/30 hover:bg-accent/30">
              <Shield className="w-3 h-3 mr-1" /> PAPER MODE
            </Badge>
          ) : (
            <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
              <Zap className="w-3 h-3 mr-1" /> LIVE MODE
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {isPaper ? 'No real money at risk' : 'Connected to exchange'}
          </span>
        </div>

        {isPaper && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {/* Simulated Balance */}
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Simulated Balance</span>
                </div>
                <span className="text-lg font-bold text-foreground">
                  ${paperStats.balance.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 7D and 30D Results */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">7-Day P&L</span>
                </div>
                <p className={`font-bold text-sm ${paperStats.pnl7d >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  {paperStats.pnl7d >= 0 ? '+' : ''}${paperStats.pnl7d.toFixed(2)}
                </p>
                <p className={`text-[10px] ${paperStats.pnl7dPct >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  ({paperStats.pnl7dPct >= 0 ? '+' : ''}{paperStats.pnl7dPct.toFixed(2)}%)
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1">
                  <BarChart3 className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">30-Day P&L</span>
                </div>
                <p className={`font-bold text-sm ${paperStats.pnl30d >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  {paperStats.pnl30d >= 0 ? '+' : ''}${paperStats.pnl30d.toFixed(2)}
                </p>
                <p className={`text-[10px] ${paperStats.pnl30dPct >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  ({paperStats.pnl30dPct >= 0 ? '+' : ''}{paperStats.pnl30dPct.toFixed(2)}%)
                </p>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Paper Trade Trust Score</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Win Rate: <span className="text-accent font-bold">{paperStats.winRate}%</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {paperStats.wins}W / {paperStats.losses}L
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {paperStats.totalTrades} trades
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaperTradingToggle;
