import { motion } from "framer-motion";
import { Repeat, DollarSign, Target, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface FlipTrackerProps {
  currentBalance: number;
}

const FLIP_LEVELS = [1000, 2000, 4000, 8000, 16000, 32000];

const FlipTracker = ({ currentBalance }: FlipTrackerProps) => {
  const currentCycleIndex = FLIP_LEVELS.findIndex(level => currentBalance < level);
  const cycleStart = currentCycleIndex > 0 ? FLIP_LEVELS[currentCycleIndex - 1] : FLIP_LEVELS[0];
  const cycleTarget = currentCycleIndex >= 0 ? FLIP_LEVELS[currentCycleIndex] : FLIP_LEVELS[FLIP_LEVELS.length - 1];
  const progress = Math.min(100, ((currentBalance - cycleStart) / (cycleTarget - cycleStart)) * 100);
  const currentCycle = Math.max(1, currentCycleIndex > 0 ? currentCycleIndex : 1);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Repeat className="h-4 w-4 text-primary" />
            Flip Strategy Tracker
            <Badge className="bg-primary/20 text-primary text-xs ml-auto">Cycle {currentCycle}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5 inline" />${cycleStart.toLocaleString()}
            </span>
            <span className="font-bold text-foreground">${currentBalance.toLocaleString()}</span>
            <span className="text-accent">
              <Target className="h-3.5 w-3.5 inline" />${cycleTarget.toLocaleString()}
            </span>
          </div>
          <Progress value={progress} className="h-3 [&>div]:bg-primary" />
          <div className="flex gap-1 overflow-x-auto pb-1">
            {FLIP_LEVELS.map((level, i) => (
              <div key={level} className={`flex items-center gap-1 px-2 py-1 rounded text-xs whitespace-nowrap ${
                currentBalance >= level
                  ? "bg-accent/20 text-accent"
                  : i === currentCycleIndex
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-muted text-muted-foreground"
              }`}>
                {currentBalance >= level && <CheckCircle className="h-3 w-3" />}
                ${level.toLocaleString()}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FlipTracker;
