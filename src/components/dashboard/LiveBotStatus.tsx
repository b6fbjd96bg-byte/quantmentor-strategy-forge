import { motion } from "framer-motion";
import { Bot, Wifi, WifiOff, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BotStatus {
  name: string;
  status: "running" | "paused" | "error";
  lastSignal: string;
  todayPnl: number;
}

interface LiveBotStatusProps {
  bots: BotStatus[];
}

const LiveBotStatus = ({ bots }: LiveBotStatusProps) => {
  const activeBots = bots.filter(b => b.status === "running").length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            Live Bot Status
            <Badge className="bg-accent/20 text-accent text-xs ml-auto">{activeBots} Active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bots.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">No bots configured</p>
          ) : (
            <div className="space-y-2">
              {bots.map((bot, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-background rounded-lg">
                  <div className="flex items-center gap-2">
                    {bot.status === "running"
                      ? <Wifi className="h-3.5 w-3.5 text-accent" />
                      : <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />}
                    <span className="text-sm font-medium text-foreground">{bot.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />{bot.lastSignal}
                    </span>
                    <span className={`text-sm font-bold ${bot.todayPnl >= 0 ? "text-accent" : "text-destructive"}`}>
                      {bot.todayPnl >= 0 ? "+" : ""}${bot.todayPnl.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LiveBotStatus;
