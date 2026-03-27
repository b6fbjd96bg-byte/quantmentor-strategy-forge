import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Blocks, Plus, Trash2, ArrowRight, ArrowDown, Zap, Eye,
  GripVertical, ChevronDown, CheckCircle, Settings, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

type LogicOperator = "AND" | "OR";

interface Condition {
  id: string;
  indicator: string;
  comparison: string;
  value: string;
  logicOp: LogicOperator;
}

const indicators = [
  { value: "rsi", label: "RSI (14)", group: "Momentum" },
  { value: "rsi_7", label: "RSI (7)", group: "Momentum" },
  { value: "macd_signal", label: "MACD Signal Line Cross", group: "Momentum" },
  { value: "macd_histogram", label: "MACD Histogram", group: "Momentum" },
  { value: "ema_9_21", label: "EMA 9/21 Cross", group: "Trend" },
  { value: "ema_20_50", label: "EMA 20/50 Cross", group: "Trend" },
  { value: "sma_50_200", label: "SMA 50/200 (Golden/Death Cross)", group: "Trend" },
  { value: "price_above_ema", label: "Price Above EMA", group: "Trend" },
  { value: "price_below_ema", label: "Price Below EMA", group: "Trend" },
  { value: "price_breaks_high", label: "Price Breaks Previous High", group: "Price Action" },
  { value: "price_breaks_low", label: "Price Breaks Previous Low", group: "Price Action" },
  { value: "candle_bullish_engulfing", label: "Bullish Engulfing Candle", group: "Price Action" },
  { value: "candle_bearish_engulfing", label: "Bearish Engulfing Candle", group: "Price Action" },
  { value: "volume_spike", label: "Volume Spike (>2x average)", group: "Volume" },
  { value: "volume_above_avg", label: "Volume Above Average", group: "Volume" },
  { value: "bb_upper_touch", label: "Price Touches Upper Bollinger Band", group: "Volatility" },
  { value: "bb_lower_touch", label: "Price Touches Lower Bollinger Band", group: "Volatility" },
  { value: "atr_above", label: "ATR Above Value", group: "Volatility" },
  { value: "supertrend_buy", label: "Supertrend Buy Signal", group: "Trend" },
  { value: "supertrend_sell", label: "Supertrend Sell Signal", group: "Trend" },
];

const comparisons: Record<string, { value: string; label: string }[]> = {
  rsi: [{ value: "above", label: "Above" }, { value: "below", label: "Below" }, { value: "crosses_above", label: "Crosses Above" }, { value: "crosses_below", label: "Crosses Below" }],
  rsi_7: [{ value: "above", label: "Above" }, { value: "below", label: "Below" }, { value: "crosses_above", label: "Crosses Above" }, { value: "crosses_below", label: "Crosses Below" }],
  macd_histogram: [{ value: "above", label: "Above" }, { value: "below", label: "Below" }],
  atr_above: [{ value: "above", label: "Above" }],
  default: [{ value: "triggers", label: "Triggers" }],
};

const needsValue = (indicator: string) => ["rsi", "rsi_7", "macd_histogram", "atr_above", "price_above_ema", "price_below_ema"].includes(indicator);

const emptyCondition = (): Condition => ({
  id: crypto.randomUUID(),
  indicator: "",
  comparison: "",
  value: "",
  logicOp: "AND",
});

const conditionToEnglish = (c: Condition): string => {
  const ind = indicators.find(i => i.value === c.indicator);
  if (!ind) return "";
  const comp = c.comparison || "triggers";
  const val = c.value ? ` ${c.value}` : "";
  return `${ind.label} ${comp.replace("_", " ")}${val}`;
};

const NoCodeStrategyBuilder = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [strategyName, setStrategyName] = useState("");
  const [entryConditions, setEntryConditions] = useState<Condition[]>([emptyCondition()]);
  const [exitConditions, setExitConditions] = useState<Condition[]>([emptyCondition()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/auth");
    };
    check();
  }, []);

  const addCondition = (type: "entry" | "exit") => {
    const setter = type === "entry" ? setEntryConditions : setExitConditions;
    setter(prev => [...prev, emptyCondition()]);
  };

  const removeCondition = (type: "entry" | "exit", id: string) => {
    const setter = type === "entry" ? setEntryConditions : setExitConditions;
    setter(prev => prev.filter(c => c.id !== id));
  };

  const updateCondition = (type: "entry" | "exit", id: string, field: keyof Condition, value: string) => {
    const setter = type === "entry" ? setEntryConditions : setExitConditions;
    setter(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const buildEnglishPreview = (conditions: Condition[]): string => {
    return conditions
      .filter(c => c.indicator)
      .map((c, i) => {
        const text = conditionToEnglish(c);
        if (i === 0) return text;
        return `${c.logicOp} ${text}`;
      })
      .join(" ");
  };

  const handleSave = async () => {
    if (!strategyName.trim()) {
      toast({ title: "Enter a strategy name", variant: "destructive" });
      return;
    }
    if (entryConditions.every(c => !c.indicator)) {
      toast({ title: "Add at least one entry condition", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }

    const entryRules = buildEnglishPreview(entryConditions);
    const exitRules = buildEnglishPreview(exitConditions);

    const { error } = await supabase.from("strategies").insert({
      user_id: session.user.id,
      name: strategyName,
      description: `No-code strategy: Entry when ${entryRules}. Exit when ${exitRules || "manual"}.`,
      strategy_type: "custom",
      markets: ["stocks"],
      entry_rules: entryRules,
      exit_rules: exitRules || "Manual exit",
      status: "active",
    });

    if (error) {
      toast({ title: "Error saving strategy", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Strategy created!", description: "Your no-code strategy has been saved." });
      navigate("/ai-strategies");
    }
    setSaving(false);
  };

  const renderConditionRow = (condition: Condition, index: number, type: "entry" | "exit", conditions: Condition[]) => {
    const compOptions = comparisons[condition.indicator] || comparisons.default;

    return (
      <motion.div
        key={condition.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-background rounded-lg border border-border"
      >
        {index > 0 && (
          <Select value={condition.logicOp} onValueChange={v => updateCondition(type, condition.id, "logicOp", v)}>
            <SelectTrigger className="w-20 bg-muted border-border text-xs font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">AND</SelectItem>
              <SelectItem value="OR">OR</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select value={condition.indicator} onValueChange={v => updateCondition(type, condition.id, "indicator", v)}>
          <SelectTrigger className="flex-1 min-w-[180px] bg-card border-border text-sm">
            <SelectValue placeholder="Select indicator..." />
          </SelectTrigger>
          <SelectContent>
            {["Momentum", "Trend", "Price Action", "Volume", "Volatility"].map(group => (
              <div key={group}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{group}</div>
                {indicators.filter(i => i.group === group).map(ind => (
                  <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>

        {condition.indicator && (
          <Select value={condition.comparison} onValueChange={v => updateCondition(type, condition.id, "comparison", v)}>
            <SelectTrigger className="w-[140px] bg-card border-border text-sm">
              <SelectValue placeholder="Condition..." />
            </SelectTrigger>
            <SelectContent>
              {compOptions.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {needsValue(condition.indicator) && (
          <Input
            type="number"
            placeholder="Value"
            value={condition.value}
            onChange={e => updateCondition(type, condition.id, "value", e.target.value)}
            className="w-20 bg-card border-border text-sm"
          />
        )}

        {conditions.length > 1 && (
          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 flex-shrink-0"
            onClick={() => removeCondition(type, condition.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </motion.div>
    );
  };

  const entryPreview = buildEnglishPreview(entryConditions);
  const exitPreview = buildEnglishPreview(exitConditions);

  return (
    <div className="min-h-screen bg-background flex w-full">
      <DashboardSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <div className="p-4 md:p-6 lg:p-8 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <Blocks className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                No-Code Strategy Builder
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                Build trading strategies visually — no coding required
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Strategy"}
            </Button>
          </div>

          {/* Strategy Name */}
          <Card className="bg-card border-border mb-6">
            <CardContent className="p-4">
              <Label className="text-foreground mb-2 block">Strategy Name</Label>
              <Input
                placeholder="e.g. RSI Momentum Breakout"
                value={strategyName}
                onChange={e => setStrategyName(e.target.value)}
                className="bg-background border-border text-lg"
              />
            </CardContent>
          </Card>

          {/* Entry Conditions */}
          <Card className="bg-card border-border mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-accent" />
                Entry Conditions
                <Badge className="bg-accent/20 text-accent text-xs ml-2">BUY when...</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence>
                {entryConditions.map((c, i) => renderConditionRow(c, i, "entry", entryConditions))}
              </AnimatePresence>
              <Button variant="outline" size="sm" className="border-dashed border-border" onClick={() => addCondition("entry")}>
                <Plus className="h-4 w-4 mr-1" />Add Condition
              </Button>
            </CardContent>
          </Card>

          {/* Exit Conditions */}
          <Card className="bg-card border-border mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                <ArrowRight className="h-5 w-5 text-destructive" />
                Exit Conditions
                <Badge className="bg-destructive/20 text-destructive text-xs ml-2">SELL when...</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence>
                {exitConditions.map((c, i) => renderConditionRow(c, i, "exit", exitConditions))}
              </AnimatePresence>
              <Button variant="outline" size="sm" className="border-dashed border-border" onClick={() => addCondition("exit")}>
                <Plus className="h-4 w-4 mr-1" />Add Condition
              </Button>
            </CardContent>
          </Card>

          {/* Live English Preview */}
          <Card className="bg-card border-primary/30 border-2 mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5 text-primary" />
                Strategy Preview (Plain English)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-background rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-xs font-semibold text-accent uppercase tracking-wide">Entry Rule</span>
                  <p className="text-foreground mt-1">
                    {entryPreview ? `Buy when ${entryPreview}` : <span className="text-muted-foreground italic">Add entry conditions above...</span>}
                  </p>
                </div>
                <div className="border-t border-border pt-3">
                  <span className="text-xs font-semibold text-destructive uppercase tracking-wide">Exit Rule</span>
                  <p className="text-foreground mt-1">
                    {exitPreview ? `Sell when ${exitPreview}` : <span className="text-muted-foreground italic">Add exit conditions above...</span>}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default NoCodeStrategyBuilder;
