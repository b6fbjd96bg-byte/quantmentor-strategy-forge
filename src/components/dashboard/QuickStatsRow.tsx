import { motion } from "framer-motion";
import { TrendingUp, Target, BarChart3, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QuickStatsRowProps {
  totalProfitMonth: number;
  winRateMonth: number;
  activeStrategies: number;
  tradesToday: number;
}

const QuickStatsRow = ({ totalProfitMonth, winRateMonth, activeStrategies, tradesToday }: QuickStatsRowProps) => {
  const stats = [
    {
      icon: TrendingUp,
      label: "Profit This Month",
      value: `${totalProfitMonth >= 0 ? "+" : ""}$${Math.abs(totalProfitMonth).toLocaleString()}`,
      color: totalProfitMonth >= 0 ? "text-accent" : "text-destructive",
      iconColor: totalProfitMonth >= 0 ? "text-accent" : "text-destructive",
    },
    {
      icon: Target,
      label: "Win Rate (Month)",
      value: `${winRateMonth.toFixed(1)}%`,
      color: winRateMonth >= 50 ? "text-accent" : "text-destructive",
      iconColor: "text-primary",
    },
    {
      icon: BarChart3,
      label: "Active Strategies",
      value: activeStrategies.toString(),
      color: "text-foreground",
      iconColor: "text-primary",
    },
    {
      icon: Activity,
      label: "Trades Today",
      value: tradesToday.toString(),
      color: "text-foreground",
      iconColor: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickStatsRow;
