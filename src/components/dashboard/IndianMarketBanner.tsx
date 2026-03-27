import { motion } from "framer-motion";
import { Globe, Clock, IndianRupee, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface MarketSession {
  name: string;
  openTime: string;
  closeTime: string;
  timezone: string;
}

const indianMarkets: MarketSession[] = [
  { name: "NSE / BSE", openTime: "09:15", closeTime: "15:30", timezone: "Asia/Kolkata" },
  { name: "Delta Exchange", openTime: "00:00", closeTime: "23:59", timezone: "Asia/Kolkata" },
];

const isMarketOpen = (market: MarketSession): boolean => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: market.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const timeStr = formatter.format(now);
  const [h, m] = timeStr.split(":").map(Number);
  const currentMinutes = h * 60 + m;
  const [oh, om] = market.openTime.split(":").map(Number);
  const [ch, cm] = market.closeTime.split(":").map(Number);
  const openMin = oh * 60 + om;
  const closeMin = ch * 60 + cm;

  // Check weekday
  const dayFormatter = new Intl.DateTimeFormat("en-US", { timeZone: market.timezone, weekday: "short" });
  const day = dayFormatter.format(now);
  if (day === "Sat" || day === "Sun") return market.name === "Delta Exchange"; // Delta is 24/7

  return currentMinutes >= openMin && currentMinutes <= closeMin;
};

interface IndianMarketBannerProps {
  currency: "USD" | "INR";
  onCurrencyToggle: () => void;
}

const IndianMarketBanner = ({ currency, onCurrencyToggle }: IndianMarketBannerProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Indian Market Hours
            <Button
              variant="outline"
              size="sm"
              className="ml-auto border-border h-7 text-xs"
              onClick={onCurrencyToggle}
            >
              {currency === "USD" ? (
                <><DollarSign className="h-3 w-3 mr-1" />USD</>
              ) : (
                <><IndianRupee className="h-3 w-3 mr-1" />INR</>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {indianMarkets.map(market => {
              const open = isMarketOpen(market);
              return (
                <div key={market.name} className="flex items-center gap-2 bg-background rounded-lg px-3 py-2">
                  <div className={`w-2 h-2 rounded-full ${open ? "bg-accent animate-pulse" : "bg-muted-foreground"}`} />
                  <span className="text-sm text-foreground font-medium">{market.name}</span>
                  <Badge variant="outline" className={`text-xs ${open ? "border-accent/30 text-accent" : "border-border text-muted-foreground"}`}>
                    {open ? "OPEN" : "CLOSED"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {market.openTime} - {market.closeTime} IST
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default IndianMarketBanner;
