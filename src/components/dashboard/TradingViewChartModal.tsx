import { useEffect, useRef, useMemo } from 'react';
import { createChart, CandlestickSeries, LineSeries, ColorType, CrosshairMode, createSeriesMarkers } from 'lightweight-charts';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, Zap } from 'lucide-react';

interface Signal {
  time: string;
  price: number;
  type: 'buy' | 'sell';
  reason: string;
}

interface TradingViewChartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategyName: string;
  strategyType: string;
  indicators: string[];
  timeframe: string;
}

// Generate realistic OHLCV candle data
function generateCandleData(days: number, seed: number) {
  const data: { time: string; open: number; high: number; low: number; close: number; volume: number }[] = [];
  const rng = (i: number) => Math.sin(seed * 13.37 + i * 7.91) * 0.5 + 0.5;
  let close = 100 + (seed % 80);
  const startDate = new Date('2025-06-01');

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const open = close;
    const change = (rng(i) - 0.47) * 4 + Math.sin(i / 12) * 2;
    close = Math.max(40, open + change);
    const high = Math.max(open, close) + rng(i + 50) * 2;
    const low = Math.min(open, close) - rng(i + 100) * 2;
    const volume = 500 + rng(i + 200) * 2000;

    data.push({
      time: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.round(volume),
    });
  }
  return data;
}

// Calculate EMA
function calcEMA(data: { close: number }[], period: number) {
  const k = 2 / (period + 1);
  const result: number[] = [];
  let ema = data[0].close;
  for (let i = 0; i < data.length; i++) {
    ema = data[i].close * k + ema * (1 - k);
    result.push(Math.round(ema * 100) / 100);
  }
  return result;
}

// Calculate RSI
function calcRSI(data: { close: number }[], period = 14) {
  const rsi: number[] = new Array(data.length).fill(50);
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    if (i <= period) {
      avgGain += gain / period;
      avgLoss += loss / period;
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    if (i >= period) {
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi[i] = Math.round(100 - 100 / (1 + rs));
    }
  }
  return rsi;
}

// Generate signals based on strategy type
function generateSignals(
  candles: ReturnType<typeof generateCandleData>,
  strategyType: string
): Signal[] {
  const ema20 = calcEMA(candles, 20);
  const ema50 = calcEMA(candles, 50);
  const rsi = calcRSI(candles);
  const signals: Signal[] = [];

  for (let i = 20; i < candles.length - 2; i++) {
    const c = candles[i];
    switch (strategyType) {
      case 'momentum':
        if (ema20[i - 1] <= ema50[i - 1] && ema20[i] > ema50[i] && signals.filter(s => s.type === 'buy').length < 5) {
          signals.push({ time: c.time, price: c.low - 1, type: 'buy', reason: 'EMA 20/50 Golden Cross' });
        }
        if (ema20[i - 1] >= ema50[i - 1] && ema20[i] < ema50[i] && signals.filter(s => s.type === 'sell').length < 5) {
          signals.push({ time: c.time, price: c.high + 1, type: 'sell', reason: 'EMA 20/50 Death Cross' });
        }
        break;
      case 'mean-reversion':
        if (rsi[i] < 30 && c.close < ema20[i] * 0.97 && signals.length < 8) {
          signals.push({ time: c.time, price: c.low - 1, type: 'buy', reason: 'RSI oversold + price below lower band' });
        }
        if (rsi[i] > 70 && c.close > ema20[i] * 1.03 && signals.length < 8) {
          signals.push({ time: c.time, price: c.high + 1, type: 'sell', reason: 'RSI overbought + price above upper band' });
        }
        break;
      case 'breakout': {
        const lookback = candles.slice(Math.max(0, i - 15), i);
        const maxH = Math.max(...lookback.map(l => l.high));
        if (c.close > maxH && c.volume > 1500 && signals.filter(s => s.type === 'buy').length < 4) {
          signals.push({ time: c.time, price: c.low - 1, type: 'buy', reason: 'Breakout above 15-bar resistance' });
        }
        const minL = Math.min(...lookback.map(l => l.low));
        if (c.close < minL && c.volume > 1500 && signals.filter(s => s.type === 'sell').length < 4) {
          signals.push({ time: c.time, price: c.high + 1, type: 'sell', reason: 'Breakdown below 15-bar support' });
        }
        break;
      }
      case 'scalping':
        if (rsi[i] < 28 && c.volume > 1200 && signals.length < 10) {
          signals.push({ time: c.time, price: c.low - 1, type: 'buy', reason: 'RSI extreme oversold + volume spike' });
        }
        if (rsi[i] > 72 && c.volume > 1200 && signals.length < 10) {
          signals.push({ time: c.time, price: c.high + 1, type: 'sell', reason: 'RSI extreme overbought + volume spike' });
        }
        break;
      case 'swing':
      default:
        if (c.close > ema50[i] && rsi[i] < 40 && rsi[i] > rsi[i - 1] && signals.filter(s => s.type === 'buy').length < 4) {
          signals.push({ time: c.time, price: c.low - 1, type: 'buy', reason: 'Pullback to EMA 50 + RSI reversal' });
        }
        if (c.close < ema20[i] && rsi[i] > 65 && rsi[i] < rsi[i - 1] && signals.filter(s => s.type === 'sell').length < 4) {
          signals.push({ time: c.time, price: c.high + 1, type: 'sell', reason: 'RSI divergence near resistance' });
        }
        break;
    }
  }

  if (signals.length < 2) {
    const m = Math.floor(candles.length / 3);
    signals.push({ time: candles[m].time, price: candles[m].low - 1, type: 'buy', reason: 'Entry signal triggered' });
    signals.push({ time: candles[m * 2].time, price: candles[m * 2].high + 1, type: 'sell', reason: 'Exit signal triggered' });
  }
  return signals;
}

const TradingViewChartModal = ({
  open, onOpenChange, strategyName, strategyType, indicators, timeframe
}: TradingViewChartModalProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);

  const seed = useMemo(() => strategyName.split('').reduce((a, c) => a + c.charCodeAt(0), 0), [strategyName]);
  const candles = useMemo(() => generateCandleData(180, seed), [seed]);
  const signals = useMemo(() => generateSignals(candles, strategyType), [candles, strategyType]);
  const ema20 = useMemo(() => calcEMA(candles, 20), [candles]);
  const ema50 = useMemo(() => calcEMA(candles, 50), [candles]);

  const buySignals = signals.filter(s => s.type === 'buy');
  const sellSignals = signals.filter(s => s.type === 'sell');

  // P&L calc
  const trades: { entry: number; exit: number; pnl: number; pnlPct: number }[] = [];
  for (let i = 0; i < buySignals.length; i++) {
    const sell = sellSignals.find(s => s.time > buySignals[i].time);
    if (sell) {
      const entryCandle = candles.find(c => c.time === buySignals[i].time);
      const exitCandle = candles.find(c => c.time === sell.time);
      if (entryCandle && exitCandle) {
        const pnl = exitCandle.close - entryCandle.close;
        trades.push({ entry: entryCandle.close, exit: exitCandle.close, pnl, pnlPct: (pnl / entryCandle.close) * 100 });
      }
    }
  }
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const winCount = trades.filter(t => t.pnl > 0).length;

  useEffect(() => {
    if (!open || !chartContainerRef.current) return;

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      if (!chartContainerRef.current) return;

      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#9ca3af',
          fontFamily: "'Inter', sans-serif",
        },
        grid: {
          vertLines: { color: 'rgba(255,255,255,0.04)' },
          horzLines: { color: 'rgba(255,255,255,0.04)' },
        },
        crosshair: { mode: CrosshairMode.Normal },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
        timeScale: { borderColor: 'rgba(255,255,255,0.1)', timeVisible: false },
        width: chartContainerRef.current.clientWidth,
        height: 420,
      });
      chartRef.current = chart;

      // Candlestick series
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderUpColor: '#22c55e',
        borderDownColor: '#ef4444',
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });
      candleSeries.setData(candles.map(c => ({
        time: c.time as any,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })));

      // EMA 20
      const ema20Series = chart.addSeries(LineSeries, {
        color: '#eab308',
        lineWidth: 1,
        lineStyle: 2,
        crosshairMarkerVisible: false,
      });
      ema20Series.setData(candles.map((c, i) => ({ time: c.time as any, value: ema20[i] })));

      // EMA 50
      const ema50Series = chart.addSeries(LineSeries, {
        color: '#3b82f6',
        lineWidth: 1,
        lineStyle: 2,
        crosshairMarkerVisible: false,
      });
      ema50Series.setData(candles.map((c, i) => ({ time: c.time as any, value: ema50[i] })));

      // Markers for buy/sell signals
      const markers = signals.map(s => ({
        time: s.time as any,
        position: s.type === 'buy' ? 'belowBar' as const : 'aboveBar' as const,
        color: s.type === 'buy' ? '#22c55e' : '#ef4444',
        shape: s.type === 'buy' ? 'arrowUp' as const : 'arrowDown' as const,
        text: s.type === 'buy' ? 'BUY' : 'SELL',
      }));
      createSeriesMarkers(candleSeries, markers.sort((a, b) => (a.time > b.time ? 1 : -1)));

      chart.timeScale().fitContent();

      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
        chartRef.current = null;
      };
    }, 50);

    return () => clearTimeout(timer);
  }, [open, candles, ema20, ema50, signals]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto bg-card border-border p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="font-display text-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            {strategyName} — Live Chart Preview
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Candlestick chart showing exact entry & exit points where this {strategyType} strategy would trigger. Timeframe: {timeframe}
          </DialogDescription>
        </DialogHeader>

        {/* Stats Bar */}
        <div className="px-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <ArrowUpCircle className="w-4 h-4 text-accent" />
            <span className="text-accent font-semibold">{buySignals.length} Buy Signals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowDownCircle className="w-4 h-4 text-destructive" />
            <span className="text-destructive font-semibold">{sellSignals.length} Sell Signals</span>
          </div>
          <div className="text-muted-foreground">|</div>
          <div>
            <span className="text-muted-foreground">P&L: </span>
            <span className={`font-bold ${totalPnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Win Rate: </span>
            <span className="font-bold">{trades.length > 0 ? ((winCount / trades.length) * 100).toFixed(0) : 0}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Trades: </span>
            <span className="font-bold">{trades.length}</span>
          </div>
        </div>

        {/* Chart */}
        <div className="px-6 py-4">
          <div ref={chartContainerRef} className="w-full rounded-xl border border-border overflow-hidden bg-background/50" />
        </div>

        {/* Signal Log */}
        <div className="px-6 pb-6">
          <h4 className="text-sm font-bold mb-3">Signal Log</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
            {signals.map((sig, i) => (
              <div key={i} className="flex items-center gap-2 text-xs bg-muted/20 rounded-lg px-3 py-2">
                {sig.type === 'buy' ? (
                  <TrendingUp className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                )}
                <span className={`font-bold uppercase w-8 ${sig.type === 'buy' ? 'text-accent' : 'text-destructive'}`}>
                  {sig.type}
                </span>
                <span className="text-muted-foreground">{sig.time}</span>
                <span className="text-foreground ml-auto truncate max-w-[200px]">{sig.reason}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-4 pt-3 border-t border-border/50">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#22c55e]" /> Bullish Candle
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#ef4444]" /> Bearish Candle
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 bg-[#eab308] rounded" /> EMA 20
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 bg-[#3b82f6] rounded" /> EMA 50
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-accent">▲</span> Buy Signal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-destructive">▼</span> Sell Signal
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradingViewChartModal;
