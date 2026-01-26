import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Trade } from "@/pages/TradeJournal";

const tradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(20),
  trade_type: z.enum(["long", "short"]),
  entry_price: z.number().positive("Entry price must be positive"),
  exit_price: z.number().positive().optional().nullable(),
  quantity: z.number().positive("Quantity must be positive"),
  entry_date: z.date(),
  exit_date: z.date().optional().nullable(),
  status: z.enum(["open", "closed"]),
  strategy_used: z.string().max(100).optional().nullable(),
  market: z.string().min(1, "Market is required"),
  timeframe: z.string().optional().nullable(),
  entry_reason: z.string().max(1000).optional().nullable(),
  exit_reason: z.string().max(1000).optional().nullable(),
  lessons_learned: z.string().max(2000).optional().nullable(),
  emotions: z.string().max(500).optional().nullable(),
  rating: z.number().min(1).max(5).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
});

type TradeFormData = z.infer<typeof tradeSchema>;

interface TradeFormProps {
  trade?: Trade | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const markets = ["Stocks", "Forex", "Crypto", "Futures", "Options", "Commodities"];
const timeframes = ["1m", "5m", "15m", "30m", "1H", "4H", "1D", "1W"];
const emotions = ["Confident", "Anxious", "Greedy", "Fearful", "Calm", "FOMO", "Disciplined", "Impatient"];

const TradeForm = ({ trade, onSuccess, onCancel }: TradeFormProps) => {
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(trade?.tags || []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      symbol: trade?.symbol || "",
      trade_type: trade?.trade_type || "long",
      entry_price: trade?.entry_price || undefined,
      exit_price: trade?.exit_price || undefined,
      quantity: trade?.quantity || undefined,
      entry_date: trade?.entry_date ? new Date(trade.entry_date) : new Date(),
      exit_date: trade?.exit_date ? new Date(trade.exit_date) : undefined,
      status: trade?.status || "open",
      strategy_used: trade?.strategy_used || "",
      market: trade?.market || "Stocks",
      timeframe: trade?.timeframe || "",
      entry_reason: trade?.entry_reason || "",
      exit_reason: trade?.exit_reason || "",
      lessons_learned: trade?.lessons_learned || "",
      emotions: trade?.emotions || "",
      rating: trade?.rating || undefined,
      tags: trade?.tags || [],
    },
  });

  const status = watch("status");
  const entryDate = watch("entry_date");
  const exitDate = watch("exit_date");

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue("tags", newTags);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    setTags(newTags);
    setValue("tags", newTags);
  };

  const calculatePnL = (entryPrice: number, exitPrice: number, quantity: number, tradeType: string) => {
    const pnl = tradeType === "long" 
      ? (exitPrice - entryPrice) * quantity
      : (entryPrice - exitPrice) * quantity;
    const pnlPercentage = tradeType === "long"
      ? ((exitPrice - entryPrice) / entryPrice) * 100
      : ((entryPrice - exitPrice) / entryPrice) * 100;
    return { pnl, pnlPercentage };
  };

  const onSubmit = async (data: TradeFormData) => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please log in", variant: "destructive" });
      setLoading(false);
      return;
    }

    let profit_loss = null;
    let profit_loss_percentage = null;

    if (data.status === "closed" && data.exit_price && data.entry_price && data.quantity) {
      const result = calculatePnL(data.entry_price, data.exit_price, data.quantity, data.trade_type);
      profit_loss = result.pnl;
      profit_loss_percentage = result.pnlPercentage;
    }

    const tradeData = {
      user_id: user.id,
      symbol: data.symbol.toUpperCase(),
      trade_type: data.trade_type,
      entry_price: data.entry_price,
      exit_price: data.exit_price || null,
      quantity: data.quantity,
      entry_date: data.entry_date.toISOString(),
      exit_date: data.exit_date?.toISOString() || null,
      status: data.status,
      profit_loss,
      profit_loss_percentage,
      strategy_used: data.strategy_used || null,
      market: data.market,
      timeframe: data.timeframe || null,
      entry_reason: data.entry_reason || null,
      exit_reason: data.exit_reason || null,
      lessons_learned: data.lessons_learned || null,
      emotions: data.emotions || null,
      rating: data.rating || null,
      tags: tags.length > 0 ? tags : null,
    };

    let error;
    if (trade) {
      const result = await supabase
        .from("trade_journal")
        .update(tradeData)
        .eq("id", trade.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("trade_journal")
        .insert([tradeData]);
      error = result.error;
    }

    if (error) {
      toast({
        title: trade ? "Error updating trade" : "Error logging trade",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: trade ? "Trade updated" : "Trade logged",
        description: trade ? "Your trade has been updated." : "Your trade has been added to the journal.",
      });
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="symbol">Symbol *</Label>
          <Input
            id="symbol"
            placeholder="e.g., AAPL, BTC/USD"
            {...register("symbol")}
            className="bg-background border-border uppercase"
          />
          {errors.symbol && <p className="text-xs text-destructive">{errors.symbol.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Trade Type *</Label>
          <Select
            defaultValue={trade?.trade_type || "long"}
            onValueChange={(value) => setValue("trade_type", value as "long" | "short")}
          >
            <SelectTrigger className="bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="short">Short</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Market *</Label>
          <Select
            defaultValue={trade?.market || "Stocks"}
            onValueChange={(value) => setValue("market", value)}
          >
            <SelectTrigger className="bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {markets.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Timeframe</Label>
          <Select
            defaultValue={trade?.timeframe || ""}
            onValueChange={(value) => setValue("timeframe", value)}
          >
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price Info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="entry_price">Entry Price *</Label>
          <Input
            id="entry_price"
            type="number"
            step="any"
            placeholder="0.00"
            {...register("entry_price", { valueAsNumber: true })}
            className="bg-background border-border"
          />
          {errors.entry_price && <p className="text-xs text-destructive">{errors.entry_price.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="exit_price">Exit Price</Label>
          <Input
            id="exit_price"
            type="number"
            step="any"
            placeholder="0.00"
            {...register("exit_price", { valueAsNumber: true })}
            className="bg-background border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            step="any"
            placeholder="0"
            {...register("quantity", { valueAsNumber: true })}
            className="bg-background border-border"
          />
          {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Entry Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-background border-border", !entryDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {entryDate ? format(entryDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={entryDate}
                onSelect={(date) => date && setValue("entry_date", date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Exit Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-background border-border", !exitDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {exitDate ? format(exitDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={exitDate || undefined}
                onSelect={(date) => setValue("exit_date", date || null)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Status *</Label>
          <Select
            defaultValue={trade?.status || "open"}
            onValueChange={(value) => setValue("status", value as "open" | "closed")}
          >
            <SelectTrigger className="bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Strategy & Notes */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="strategy_used">Strategy Used</Label>
          <Input
            id="strategy_used"
            placeholder="e.g., Momentum Breakout, Mean Reversion"
            {...register("strategy_used")}
            className="bg-background border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="entry_reason">Entry Reason</Label>
          <Textarea
            id="entry_reason"
            placeholder="Why did you enter this trade?"
            {...register("entry_reason")}
            className="bg-background border-border min-h-[80px]"
          />
        </div>

        {status === "closed" && (
          <div className="space-y-2">
            <Label htmlFor="exit_reason">Exit Reason</Label>
            <Textarea
              id="exit_reason"
              placeholder="Why did you exit this trade?"
              {...register("exit_reason")}
              className="bg-background border-border min-h-[80px]"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="lessons_learned">Lessons Learned</Label>
          <Textarea
            id="lessons_learned"
            placeholder="What did you learn from this trade?"
            {...register("lessons_learned")}
            className="bg-background border-border min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Emotions</Label>
            <Select
              defaultValue={trade?.emotions || ""}
              onValueChange={(value) => setValue("emotions", value)}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="How did you feel?" />
              </SelectTrigger>
              <SelectContent>
                {emotions.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trade Rating (1-5)</Label>
            <Select
              defaultValue={trade?.rating?.toString() || ""}
              onValueChange={(value) => setValue("rating", parseInt(value))}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Rate this trade" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(r => (
                  <SelectItem key={r} value={r.toString()}>
                    {"⭐".repeat(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              className="bg-background border-border"
            />
            <Button type="button" variant="outline" onClick={handleAddTag}>Add</Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(tag => (
                <span 
                  key={tag} 
                  className="bg-primary/20 text-primary px-2 py-1 rounded text-sm flex items-center gap-1"
                >
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-destructive">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {trade ? "Update Trade" : "Log Trade"}
        </Button>
      </div>
    </form>
  );
};

export default TradeForm;
