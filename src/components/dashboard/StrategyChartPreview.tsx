import { useMemo } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceDot, ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface Signal {
  index: number;
  type: 'buy' | 'sell';
  price: number;
  reason: string;
}

interface StrategyChartPreviewProps {
  strategyType?: string;
  indicators?: string[];
  strategyName?: string;
  timeframe?: string;
  compact?: boolean;
}

// Generate realistic OHLC-like price data
function generatePriceData(points: number, seed: number) {
  const data: { name: string; price: number; ema20: number; ema50: number; rsi: number; volume: number; bb_upper: number; bb_lower: number }[] = [];
  let price = 100 + (seed % 50);
  let ema20 = price;
  let ema50 = price;
  const rng = (i: number) => Math.sin(seed * 13.37 + i * 7.91) * 0.5 + 0.5;

  for (let i = 0; i < points; i++) {
    const change = (rng(i) - 0.48) * 3 + Math.sin(i / 8) * 1.5;
    price = Math.max(50, price + change);
    ema20 = ema20 + (price - ema20) * (2 / 21);
    ema50 = ema50 + (price - ema50) * (2 / 51);
    const vol = 500 + rng(i + 100) * 1500 + (Math.abs(change) > 2 ? 1000 : 0);
    const bb_spread = 4 + rng(i + 200) * 3;

    data.push({
      name: `${i + 1}`,
      price: Math.round(price * 100) / 100,
      ema20: Math.round(ema20 * 100) / 100,
      ema50: Math.round(ema50 * 100) / 100,
      rsi: Math.round(30 + rng(i + 300) * 40 + Math.sin(i / 5) * 15),
      volume: Math.round(vol),
      bb_upper: Math.round((ema20 + bb_spread) * 100) / 100,
      bb_lower: Math.round((ema20 - bb_spread) * 100) / 100,
    });
  }
  return data;
}

// Generate buy/sell signals based on strategy type
function generateSignals(
  data: ReturnType<typeof generatePriceData>,
  strategyType: string
): Signal[] {
  const signals: Signal[] = [];

  for (let i = 5; i < data.length - 3; i++) {
    const d = data[i];
    const prev = data[i - 1];

    switch (strategyType) {
      case 'momentum': {
        if (prev.ema20 <= prev.ema50 && d.ema20 > d.ema50 && signals.filter(s => s.type === 'buy').length < 4) {
          signals.push({ index: i, type: 'buy', price: d.price, reason: 'EMA 20 crosses above EMA 50' });
        }
        if (prev.ema20 >= prev.ema50 && d.ema20 < d.ema50 && signals.filter(s => s.type === 'sell').length < 4) {
          signals.push({ index: i, type: 'sell', price: d.price, reason: 'EMA 20 crosses below EMA 50' });
        }
        break;
      }
      case 'mean-reversion': {
        if (d.price < d.bb_lower && d.rsi < 35 && signals.length < 6) {
          signals.push({ index: i, type: 'buy', price: d.price, reason: 'Price below Bollinger Band + RSI oversold' });
        }
        if (d.price > d.bb_upper && d.rsi > 65 && signals.length < 6) {
          signals.push({ index: i, type: 'sell', price: d.price, reason: 'Price above Bollinger Band + RSI overbought' });
        }
        break;
      }
      case 'breakout': {
        const recent = data.slice(Math.max(0, i - 10), i);
        const maxPrice = Math.max(...recent.map(r => r.price));
        if (d.price > maxPrice && d.volume > 1500 && signals.length < 6) {
          signals.push({ index: i, type: 'buy', price: d.price, reason: 'Breakout above resistance + volume surge' });
        }
        const minPrice = Math.min(...recent.map(r => r.price));
        if (d.price < minPrice && d.volume > 1500 && signals.length < 6) {
          signals.push({ index: i, type: 'sell', price: d.price, reason: 'Breakdown below support + volume surge' });
        }
        break;
      }
      case 'scalping': {
        if (d.rsi < 30 && d.volume > 1200 && signals.length < 8) {
          signals.push({ index: i, type: 'buy', price: d.price, reason: 'RSI oversold + volume spike' });
        }
        if (d.rsi > 70 && d.volume > 1200 && signals.length < 8) {
          signals.push({ index: i, type: 'sell', price: d.price, reason: 'RSI overbought + volume spike' });
        }
        break;
      }
      case 'swing':
      default: {
        if (d.price < d.ema50 && d.rsi < 40 && prev.rsi <= d.rsi && signals.length < 6) {
          signals.push({ index: i, type: 'buy', price: d.price, reason: 'Pullback to EMA 50 + RSI reversal' });
        }
        if (d.price > d.ema20 && d.rsi > 65 && prev.rsi >= d.rsi && signals.length < 6) {
          signals.push({ index: i, type: 'sell', price: d.price, reason: 'RSI divergence at resistance' });
        }
        break;
      }
    }
  }

  // Ensure at least some signals
  if (signals.length < 2) {
    const mid = Math.floor(data.length / 3);
    signals.push({ index: mid, type: 'buy', price: data[mid].price, reason: 'Entry signal triggered' });
    signals.push({ index: mid * 2, type: 'sell', price: data[mid * 2].price, reason: 'Exit signal triggered' });
  }

  return signals;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs space-y-1">
      <p className="font-bold text-foreground">Bar {d.name}</p>
      <p>Price: <span className="text-primary font-semibold">${d.price}</span></p>
      <p>EMA 20: <span className="text-yellow-400">{d.ema20}</span></p>
      <p>EMA 50: <span className="text-blue-400">{d.ema50}</span></p>
      <p>RSI: <span className={d.rsi > 70 ? 'text-destructive' : d.rsi < 30 ? 'text-accent' : 'text-muted-foreground'}>{d.rsi}</span></p>
    </div>
  );
};

const StrategyChartPreview = ({
  strategyType = 'momentum',
  indicators = [],
  strategyName = 'Strategy',
  timeframe = '4H',
  compact = false
}: StrategyChartPreviewProps) => {
  const seed = useMemo(() => strategyName.split('').reduce((a, c) => a + c.charCodeAt(0), 0), [strategyName]);
  const points = compact ? 40 : 60;
  const data = useMemo(() => generatePriceData(points, seed), [points, seed]);
  const signals = useMemo(() => generateSignals(data, strategyType), [data, strategyType]);

  const buySignals = signals.filter(s => s.type === 'buy');
  const sellSignals = signals.filter(s => s.type === 'sell');
  const minPrice = Math.min(...data.map(d => d.price)) - 5;
  const maxPrice = Math.max(...data.map(d => d.price)) + 5;

  // Calculate simulated P&L
  const trades: { entry: number; exit: number; pnl: number }[] = [];
  for (let i = 0; i < Math.min(buySignals.length, sellSignals.length); i++) {
    const buy = buySignals[i];
    const sell = sellSignals.find(s => s.index > buy.index);
    if (sell) {
      trades.push({ entry: buy.price, exit: sell.price, pnl: sell.price - buy.price });
    }
  }
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const winCount = trades.filter(t => t.pnl > 0).length;

  return (
    <div className={`bg-card/50 rounded-xl border border-border overflow-hidden ${compact ? '' : 'p-1'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${compact ? 'px-3 pt-3 pb-1' : 'px-4 pt-4 pb-2'}`}>
        <div>
          <h4 className={`font-bold text-foreground flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            <TrendingUp className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-primary`} />
            Strategy Preview — {strategyName}
          </h4>
          <p className={`text-muted-foreground ${compact ? 'text-[10px]' : 'text-xs'}`}>
            Simulated {timeframe} chart • {signals.length} signals generated
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

      {/* Chart */}
      <div className={compact ? 'h-[180px]' : 'h-[280px]'}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis domain={[minPrice, maxPrice]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />

            {/* Bollinger Bands area */}
            <Area dataKey="bb_upper" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.03} />
            <Area dataKey="bb_lower" stroke="none" fill="none" />

            {/* Price line */}
            <Area dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#priceGradient)" />

            {/* Moving averages */}
            <Line dataKey="ema20" stroke="hsl(45, 100%, 55%)" strokeWidth={1} dot={false} strokeDasharray="4 2" />
            <Line dataKey="ema50" stroke="hsl(210, 100%, 60%)" strokeWidth={1} dot={false} strokeDasharray="4 2" />

            {/* Buy signals */}
            {buySignals.map((sig, i) => (
              <ReferenceDot
                key={`buy-${i}`}
                x={data[sig.index].name}
                y={sig.price}
                r={6}
                fill="hsl(var(--accent))"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
              />
            ))}

            {/* Sell signals */}
            {sellSignals.map((sig, i) => (
              <ReferenceDot
                key={`sell-${i}`}
                x={data[sig.index].name}
                y={sig.price}
                r={6}
                fill="hsl(var(--destructive))"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Signal Log + P&L */}
      {!compact && (
        <div className="px-4 pb-4 pt-2 space-y-3">
          {/* P&L Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/30 rounded-lg p-2 text-center">
              <p className="text-[10px] text-muted-foreground">Sim. P&L</p>
              <p className={`font-bold text-sm ${totalPnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
                {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2 text-center">
              <p className="text-[10px] text-muted-foreground">Win Rate</p>
              <p className="font-bold text-sm text-foreground">
                {trades.length > 0 ? ((winCount / trades.length) * 100).toFixed(0) : 0}%
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2 text-center">
              <p className="text-[10px] text-muted-foreground">Trades</p>
              <p className="font-bold text-sm text-foreground">{trades.length}</p>
            </div>
          </div>

          {/* Signal List */}
          <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
            {signals.map((sig, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {sig.type === 'buy' ? (
                  <TrendingUp className="w-3 h-3 text-accent flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-destructive flex-shrink-0" />
                )}
                <span className={`font-semibold uppercase w-8 ${sig.type === 'buy' ? 'text-accent' : 'text-destructive'}`}>
                  {sig.type}
                </span>
                <span className="text-muted-foreground">@ ${sig.price.toFixed(2)}</span>
                <span className="text-muted-foreground/60 ml-auto truncate max-w-[200px]">{sig.reason}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground pt-1 border-t border-border/50">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary" /> Price
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-0.5 bg-yellow-400 rounded" /> EMA 20
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-0.5 bg-blue-400 rounded" /> EMA 50
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent" /> Buy
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-destructive" /> Sell
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyChartPreview;
