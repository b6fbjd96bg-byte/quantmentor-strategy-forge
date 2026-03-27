import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceDot
} from 'recharts';
import {
  Bot, Send, CheckCircle2, RefreshCw, TrendingUp, TrendingDown,
  ArrowUpCircle, ArrowDownCircle, Loader2, ThumbsUp, ThumbsDown,
  MessageSquare, BarChart3, Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface Signal {
  bar: number;
  type: 'buy' | 'sell';
  price: number;
  reason: string;
  indicators?: Record<string, number>;
}

interface ChartDataPoint {
  bar: number;
  price: number;
  ema20: number;
  ema50: number;
  rsi: number;
  volume: number;
  macd?: number;
  macd_signal?: number;
  bb_upper?: number;
  bb_lower?: number;
}

interface AISummary {
  totalSignals: number;
  buySignals: number;
  sellSignals: number;
  estimatedWinRate: number;
  estimatedProfitFactor: number;
  maxDrawdown: number;
  suggestion: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  chartData?: ChartDataPoint[];
  signals?: Signal[];
  summary?: AISummary;
}

interface StrategyAgentChatProps {
  strategy: {
    name: string;
    strategyType?: string;
    entryRules: string;
    exitRules: string;
    indicators?: string;
    timeframe?: string;
    markets?: string[];
    riskPerTrade?: string;
    stopLossType?: string;
    takeProfitType?: string;
  };
  onApprove: () => void;
  onBack: () => void;
}

const ChartTooltipContent = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs space-y-1">
      <p className="font-bold text-foreground">Bar {d.bar}</p>
      <p>Price: <span className="text-primary font-semibold">${d.price?.toFixed(2)}</span></p>
      {d.ema20 && <p>EMA 20: <span className="text-yellow-400">{d.ema20?.toFixed(2)}</span></p>}
      {d.ema50 && <p>EMA 50: <span className="text-blue-400">{d.ema50?.toFixed(2)}</span></p>}
      {d.rsi !== undefined && (
        <p>RSI: <span className={d.rsi > 70 ? 'text-destructive' : d.rsi < 30 ? 'text-accent' : 'text-muted-foreground'}>{d.rsi}</span></p>
      )}
      {d.macd !== undefined && <p>MACD: <span className="text-purple-400">{d.macd?.toFixed(3)}</span></p>}
    </div>
  );
};

const StrategyAgentChat = ({ strategy, onApprove, onBack }: StrategyAgentChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChart, setCurrentChart] = useState<ChartDataPoint[]>([]);
  const [currentSignals, setCurrentSignals] = useState<Signal[]>([]);
  const [currentSummary, setCurrentSummary] = useState<AISummary | null>(null);
  const [iteration, setIteration] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-analyze on mount
  useEffect(() => {
    analyzeStrategy();
  }, []);

  const analyzeStrategy = async (feedback?: string) => {
    setIsLoading(true);

    const history = messages
      .filter(m => m.role === 'user' || (m.role === 'assistant' && !m.chartData))
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/refine-strategy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ strategy, feedback, history }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'AI analysis failed');
      }

      const data = await resp.json();

      if (data.chartData?.length) {
        setCurrentChart(data.chartData);
        setCurrentSignals(data.signals || []);
        setCurrentSummary(data.summary || null);
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.analysis || data.summary?.suggestion || 'Strategy analyzed.',
        chartData: data.chartData,
        signals: data.signals,
        summary: data.summary,
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIteration(prev => prev + 1);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Failed to analyze strategy');
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error analyzing the strategy. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendFeedback = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    analyzeStrategy(input.trim());
    setInput('');
  };

  const buySignals = currentSignals.filter(s => s.type === 'buy');
  const sellSignals = currentSignals.filter(s => s.type === 'sell');
  const minPrice = currentChart.length ? Math.min(...currentChart.map(d => d.price)) - 3 : 0;
  const maxPrice = currentChart.length ? Math.max(...currentChart.map(d => d.price)) + 3 : 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">AI Strategy Agent</h2>
              <p className="text-xs text-muted-foreground">
                Analyzing: {strategy.name} • Iteration #{iteration}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onBack}>
              ← Back to Edit
            </Button>
            <Button
              variant="hero"
              size="sm"
              onClick={onApprove}
              disabled={!currentChart.length}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" /> Approve & Deploy
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chart Panel (3/5) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Chart */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  AI-Generated Strategy Chart
                </h3>
                <p className="text-xs text-muted-foreground">
                  {strategy.timeframe || '4H'} timeframe • {currentSignals.length} signals
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-1 text-xs">
                  <ArrowUpCircle className="w-3 h-3 text-accent" />
                  <span className="text-accent font-semibold">{buySignals.length} Buy</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <ArrowDownCircle className="w-3 h-3 text-destructive" />
                  <span className="text-destructive font-semibold">{sellSignals.length} Sell</span>
                </div>
              </div>
            </div>

            <div className="h-[350px]">
              {currentChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={currentChart} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                    <defs>
                      <linearGradient id="agentPriceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="bar" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[minPrice, maxPrice]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltipContent />} />

                    {currentChart[0]?.bb_upper && (
                      <>
                        <Area dataKey="bb_upper" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.03} />
                        <Area dataKey="bb_lower" stroke="none" fill="none" />
                      </>
                    )}

                    <Area dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#agentPriceGrad)" />
                    <Line dataKey="ema20" stroke="hsl(45, 100%, 55%)" strokeWidth={1} dot={false} strokeDasharray="4 2" />
                    <Line dataKey="ema50" stroke="hsl(210, 100%, 60%)" strokeWidth={1} dot={false} strokeDasharray="4 2" />

                    {buySignals.map((sig, i) => (
                      <ReferenceDot key={`buy-${i}`} x={sig.bar} y={sig.price} r={7}
                        fill="hsl(var(--accent))" stroke="hsl(var(--accent))" strokeWidth={2} />
                    ))}
                    {sellSignals.map((sig, i) => (
                      <ReferenceDot key={`sell-${i}`} x={sig.bar} y={sig.price} r={7}
                        fill="hsl(var(--destructive))" stroke="hsl(var(--destructive))" strokeWidth={2} />
                    ))}
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  {isLoading ? (
                    <div className="text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                      <p className="text-sm text-muted-foreground">AI is analyzing your strategy...</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Chart will appear after AI analysis</p>
                  )}
                </div>
              )}
            </div>

            {/* Signal Log */}
            {currentSignals.length > 0 && (
              <div className="px-4 pb-4 pt-2 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Signal Log</p>
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                  {currentSignals.map((sig, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {sig.type === 'buy' ? (
                        <TrendingUp className="w-3 h-3 text-accent flex-shrink-0" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-destructive flex-shrink-0" />
                      )}
                      <span className={`font-semibold uppercase w-8 ${sig.type === 'buy' ? 'text-accent' : 'text-destructive'}`}>
                        {sig.type}
                      </span>
                      <span className="text-muted-foreground">Bar {sig.bar} @ ${sig.price?.toFixed(2)}</span>
                      <span className="text-muted-foreground/60 ml-auto truncate max-w-[250px]">{sig.reason}</span>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Price</span>
                  <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-yellow-400 rounded" /> EMA 20</span>
                  <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-blue-400 rounded" /> EMA 50</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> Buy</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Sell</span>
                </div>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          {currentSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Win Rate', value: `${currentSummary.estimatedWinRate}%`, color: 'text-accent' },
                { label: 'Profit Factor', value: currentSummary.estimatedProfitFactor?.toFixed(1), color: 'text-primary' },
                { label: 'Max Drawdown', value: `${currentSummary.maxDrawdown}%`, color: 'text-destructive' },
                { label: 'Total Signals', value: currentSummary.totalSignals, color: 'text-foreground' },
              ].map((stat, i) => (
                <div key={i} className="bg-card rounded-lg border border-border p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  <p className={`font-bold text-lg ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Panel (2/5) */}
        <div className="lg:col-span-2 flex flex-col bg-card rounded-xl border border-border overflow-hidden h-[calc(100vh-120px)] lg:sticky lg:top-[72px]">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Refine Your Strategy</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Initial context */}
            <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1">
                <Zap className="w-3 h-3 text-primary" /> Strategy: {strategy.name}
              </p>
              <p>Entry: {strategy.entryRules?.slice(0, 80)}...</p>
              <p>Exit: {strategy.exitRules?.slice(0, 80)}...</p>
              <p>Indicators: {strategy.indicators || 'EMA, RSI'}</p>
            </div>

            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-foreground'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.summary?.suggestion && msg.role === 'assistant' && (
                    <p className="mt-2 text-xs text-muted-foreground italic border-t border-border/50 pt-2">
                      💡 {msg.summary.suggestion}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                AI is regenerating chart...
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Actions */}
          {currentChart.length > 0 && !isLoading && (
            <div className="px-4 py-2 border-t border-border/50">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    const msg = "Show more conservative entry signals with tighter stop losses";
                    setMessages(prev => [...prev, { role: 'user', content: msg }]);
                    analyzeStrategy(msg);
                  }}
                >
                  More Conservative
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    const msg = "Add more aggressive entries and increase the number of trades";
                    setMessages(prev => [...prev, { role: 'user', content: msg }]);
                    analyzeStrategy(msg);
                  }}
                >
                  More Aggressive
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    const msg = "Add volume confirmation to all signals";
                    setMessages(prev => [...prev, { role: 'user', content: msg }]);
                    analyzeStrategy(msg);
                  }}
                >
                  + Volume Filter
                </Button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendFeedback();
                  }
                }}
                placeholder="Tell the AI what to change... e.g. 'Move buy signals closer to support levels'"
                className="min-h-[60px] max-h-[100px] text-sm resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={sendFeedback}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[60px] w-12"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyAgentChat;
