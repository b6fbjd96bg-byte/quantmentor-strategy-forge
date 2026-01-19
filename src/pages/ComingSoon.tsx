import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowLeft, Bell, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

// Stock ticker data
const stockData = [
  { symbol: 'AAPL', price: 178.52, change: 2.34 },
  { symbol: 'GOOGL', price: 141.80, change: -0.89 },
  { symbol: 'MSFT', price: 378.91, change: 4.12 },
  { symbol: 'TSLA', price: 248.50, change: -3.21 },
  { symbol: 'AMZN', price: 178.25, change: 1.56 },
  { symbol: 'NVDA', price: 875.28, change: 12.45 },
  { symbol: 'META', price: 505.95, change: 3.78 },
  { symbol: 'BTC', price: 67850.00, change: 1250.00 },
];

// Animated candlestick chart
const CandlestickChart = () => {
  const [candles, setCandles] = useState<{ open: number; close: number; high: number; low: number }[]>([]);

  useEffect(() => {
    const generateCandles = () => {
      const newCandles = [];
      let lastClose = 50;
      for (let i = 0; i < 20; i++) {
        const volatility = Math.random() * 15;
        const direction = Math.random() > 0.5 ? 1 : -1;
        const open = lastClose;
        const close = open + direction * volatility;
        const high = Math.max(open, close) + Math.random() * 5;
        const low = Math.min(open, close) - Math.random() * 5;
        newCandles.push({ open, close, high, low });
        lastClose = close;
      }
      setCandles(newCandles);
    };

    generateCandles();
    const interval = setInterval(generateCandles, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex items-end justify-center gap-2 p-8 opacity-20">
      {candles.map((candle, i) => {
        const isGreen = candle.close > candle.open;
        const bodyHeight = Math.abs(candle.close - candle.open);
        const wickHeight = candle.high - candle.low;
        
        return (
          <motion.div
            key={i}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="flex flex-col items-center"
            style={{ height: '200px' }}
          >
            {/* Wick */}
            <div
              className={`w-0.5 ${isGreen ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ height: `${wickHeight * 2}px` }}
            />
            {/* Body */}
            <motion.div
              className={`w-3 rounded-sm ${isGreen ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ height: `${Math.max(bodyHeight * 2, 4)}px` }}
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

// Floating particles
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, -100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

// Scrolling ticker
const StockTicker = () => {
  return (
    <div className="absolute top-0 left-0 right-0 overflow-hidden bg-card/50 backdrop-blur-sm border-b border-border/50 py-3">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {[...stockData, ...stockData].map((stock, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-foreground">{stock.symbol}</span>
            <span className="text-muted-foreground">${stock.price.toLocaleString()}</span>
            <span className={stock.change > 0 ? 'text-green-500' : 'text-red-500'}>
              {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// Animated line chart
const LineChart = () => {
  const [path, setPath] = useState('');

  useEffect(() => {
    const generatePath = () => {
      let d = 'M 0 100';
      let y = 100;
      for (let x = 0; x <= 400; x += 20) {
        y += (Math.random() - 0.5) * 30;
        y = Math.max(20, Math.min(180, y));
        d += ` L ${x} ${y}`;
      }
      setPath(d);
    };

    generatePath();
    const interval = setInterval(generatePath, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg
      className="absolute bottom-0 left-0 right-0 w-full h-48 opacity-10"
      viewBox="0 0 400 200"
      preserveAspectRatio="none"
    >
      <motion.path
        d={path}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
      <motion.path
        d={path + ' L 400 200 L 0 200 Z'}
        fill="url(#gradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1 }}
      />
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const ComingSoon = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  
  // Extract page name from URL
  const pageName = location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'page';
  const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("You'll be notified when this feature launches!");
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated backgrounds */}
      <StockTicker />
      <CandlestickChart />
      <LineChart />
      <FloatingParticles />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-8"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <TrendingUp className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">
              QuantMentor
            </span>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            {formattedPageName}
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6"
          >
            Coming{' '}
            <span className="text-transparent bg-clip-text bg-gradient-primary">
              Soon
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto"
          >
            We're working hard to bring you an amazing{' '}
            <span className="text-foreground font-medium">{formattedPageName}</span>{' '}
            experience. Stay tuned for updates!
          </motion.p>

          {/* Email signup */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onSubmit={handleNotify}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-card/50 border-border/50 backdrop-blur-sm"
            />
            <Button type="submit" className="bg-gradient-primary shadow-glow">
              <Bell className="w-4 h-4 mr-2" />
              Notify Me
            </Button>
          </motion.form>

          {/* Back button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </motion.div>
        </motion.div>

        {/* Animated stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-20 left-0 right-0 flex justify-center gap-8 md:gap-16"
        >
          {[
            { label: 'Days Left', value: '14' },
            { label: 'Waitlist', value: '2,847' },
            { label: 'Progress', value: '78%' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9 + i * 0.1, type: 'spring' }}
              className="text-center"
            >
              <motion.div
                className="text-2xl md:text-3xl font-bold text-foreground"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;
