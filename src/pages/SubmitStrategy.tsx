import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Target,
  Shield,
  BarChart3,
  Zap,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Bot
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StrategyChartPreview from '@/components/dashboard/StrategyChartPreview';

const steps = [
  { id: 1, title: 'Strategy Overview', icon: Target },
  { id: 2, title: 'Entry & Exit Rules', icon: Zap },
  { id: 3, title: 'Risk Management', icon: Shield },
  { id: 4, title: 'Review & Submit', icon: CheckCircle2 },
];

const marketOptions = [
  { label: 'Binance (Crypto)', value: 'binance' },
  { label: 'Delta Exchange (Crypto Derivatives)', value: 'delta' },
  { label: 'Bybit (Crypto)', value: 'bybit' },
  { label: 'Kucoin (Crypto)', value: 'kucoin' },
  { label: 'Zerodha (Indian Stocks)', value: 'zerodha' },
  { label: 'Upstox (Indian Stocks)', value: 'upstox' },
  { label: 'Interactive Brokers (US Stocks)', value: 'ibkr' },
  { label: 'Alpaca (US Stocks)', value: 'alpaca' },
  { label: 'OANDA (Forex)', value: 'oanda' },
  { label: 'Paper Trading (Demo)', value: 'paper' },
];

const timeframeOptions = [
  'Scalping (1-5 min)', 'Intraday (15-60 min)', 'Swing (4H-1D)', 
  'Positional (1D-1W)', 'Long-term (1W+)'
];

const SubmitStrategy = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [botResult, setBotResult] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    strategyName: '',
    description: '',
    markets: [] as string[],
    timeframe: '',
    entryRules: '',
    exitRules: '',
    indicators: '',
    maxRiskPerTrade: '1',
    maxDailyLoss: '3',
    positionSizing: '',
    stopLossType: '',
    takeProfitType: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
    });
  }, []);

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleMarket = (market: string) => {
    setFormData(prev => ({
      ...prev,
      markets: prev.markets.includes(market)
        ? prev.markets.filter(m => m !== market)
        : [...prev.markets, market]
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please log in to submit a strategy');
      navigate('/auth');
      return;
    }

    if (!formData.strategyName || !formData.entryRules || !formData.exitRules) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // First, save the strategy to the database
      const { data: strategy, error: strategyError } = await supabase
        .from('strategies')
        .insert({
          user_id: user.id,
          name: formData.strategyName,
          description: formData.description,
          strategy_type: 'custom',
          markets: formData.markets,
          timeframe: formData.timeframe,
          entry_rules: formData.entryRules,
          exit_rules: formData.exitRules,
          risk_per_trade: parseFloat(formData.maxRiskPerTrade) || 1,
          max_daily_loss: parseFloat(formData.maxDailyLoss) || 3,
          stop_loss_type: formData.stopLossType,
          take_profit_type: formData.takeProfitType,
          max_positions: 5,
          status: 'processing',
        })
        .select()
        .single();

      if (strategyError) {
        console.error('Strategy save error:', strategyError);
        throw new Error('Failed to save strategy');
      }

      toast.success('Strategy saved! AI is now generating your trading bot...');

      // Call the AI processor edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-strategy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            strategy: {
              strategyId: strategy.id,
              name: formData.strategyName,
              description: formData.description,
              markets: formData.markets,
              timeframe: formData.timeframe,
              entryRules: formData.entryRules,
              exitRules: formData.exitRules,
              indicators: formData.indicators,
              riskPerTrade: formData.maxRiskPerTrade,
              maxDailyLoss: formData.maxDailyLoss,
              stopLossType: formData.stopLossType,
              takeProfitType: formData.takeProfitType,
              positionSizing: formData.positionSizing,
            },
            userId: user.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process strategy');
      }

      const result = await response.json();
      setBotResult(result);

      // Update strategy status to active
      await supabase
        .from('strategies')
        .update({ status: 'active' })
        .eq('id', strategy.id);

      setIsSubmitted(true);
      toast.success('Trading bot created successfully!');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create trading bot');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-lg"
        >
          <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
            <Bot className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Trading Bot Created!
          </h1>
          <p className="text-muted-foreground mb-6">
            Your AI-powered trading bot has been generated based on your strategy. 
            View it on your dashboard to start paper trading or connect a broker.
          </p>

          {botResult && (
            <div className="space-y-4 mb-6">
              <StrategyChartPreview
                strategyType={formData.timeframe?.includes('Scalp') ? 'scalping' : formData.timeframe?.includes('Swing') ? 'swing' : 'momentum'}
                indicators={formData.indicators?.split(',').map(s => s.trim()).filter(Boolean) || ['RSI', 'EMA']}
                strategyName={formData.strategyName || 'Custom Strategy'}
                timeframe={formData.timeframe || '4H'}
              />
              <div className="bg-card rounded-xl border border-border p-4 text-left">
                <h3 className="font-semibold text-foreground mb-3">Backtest Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Win Rate:</span>
                    <p className="font-bold text-accent">{botResult.backtestSummary?.winRate?.toFixed(1)}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">P&L:</span>
                    <p className={`font-bold ${botResult.backtestSummary?.profitLoss >= 0 ? 'text-accent' : 'text-destructive'}`}>
                      ${botResult.backtestSummary?.profitLoss?.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Trades:</span>
                    <p className="font-bold text-foreground">{botResult.backtestSummary?.totalTrades}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Drawdown:</span>
                    <p className="font-bold text-destructive">-{botResult.backtestSummary?.maxDrawdown?.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link to="/dashboard" className="block">
              <Button variant="hero" size="lg" className="w-full gap-2">
                <Bot className="w-5 h-5" />
                View My Bot
              </Button>
            </Link>
            <Link to="/" className="block">
              <Button variant="outline" size="lg" className="w-full">
                Return to Homepage
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                QuantMentor
              </span>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Create Your <span className="text-gradient-primary">Trading Bot</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Describe your trading strategy and our AI will transform it into an automated trading bot with backtesting.
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-border">
                <motion.div
                  className="h-full bg-gradient-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center">
                    <motion.div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-accent border-accent'
                          : isActive
                          ? 'bg-primary border-primary shadow-glow'
                          : 'bg-card border-border'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-accent-foreground" />
                      ) : (
                        <Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                      )}
                    </motion.div>
                    <span className={`mt-2 text-xs font-medium hidden sm:block ${
                      isActive ? 'text-primary' : isCompleted ? 'text-accent' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Card */}
          <motion.div
            className="bg-card border border-border rounded-2xl p-6 lg:p-10 shadow-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {/* Step 1: Strategy Overview */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                      <Target className="w-6 h-6 text-primary" />
                      Strategy Overview
                    </h2>
                    <p className="text-muted-foreground">
                      Tell us about your trading strategy at a high level.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="strategyName">Strategy Name *</Label>
                      <Input
                        id="strategyName"
                        placeholder="e.g., Moving Average Crossover, RSI Reversal Strategy"
                        value={formData.strategyName}
                        onChange={(e) => updateFormData('strategyName', e.target.value)}
                        className="mt-2 bg-secondary border-border"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Strategy Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your strategy in plain English. What's the core idea? What market conditions does it work best in?"
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        className="mt-2 bg-secondary border-border min-h-[120px]"
                      />
                    </div>

                    <div>
                      <Label>Target Brokers/Exchanges *</Label>
                      <p className="text-sm text-muted-foreground mb-3">Select where you want to trade</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {marketOptions.map((market) => (
                          <button
                            key={market.value}
                            type="button"
                            onClick={() => toggleMarket(market.value)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium border transition-all ${
                              formData.markets.includes(market.value)
                                ? 'bg-primary/20 border-primary text-primary'
                                : 'bg-secondary border-border text-foreground hover:border-primary/50'
                            }`}
                          >
                            {market.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Trading Timeframe *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {timeframeOptions.map((tf) => (
                          <button
                            key={tf}
                            type="button"
                            onClick={() => updateFormData('timeframe', tf)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium border transition-all ${
                              formData.timeframe === tf
                                ? 'bg-primary/20 border-primary text-primary'
                                : 'bg-secondary border-border text-foreground hover:border-primary/50'
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Entry & Exit Rules */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                      <Zap className="w-6 h-6 text-primary" />
                      Entry & Exit Rules
                    </h2>
                    <p className="text-muted-foreground">
                      Define when your strategy should enter and exit positions.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="entryRules">Entry Rules *</Label>
                      <Textarea
                        id="entryRules"
                        placeholder="Example: Buy when 20-day SMA crosses above 50-day SMA and RSI is below 70. Or: Enter long when price breaks above previous day's high with volume 50% above average."
                        value={formData.entryRules}
                        onChange={(e) => updateFormData('entryRules', e.target.value)}
                        className="mt-2 bg-secondary border-border min-h-[140px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="exitRules">Exit Rules *</Label>
                      <Textarea
                        id="exitRules"
                        placeholder="Example: Exit when price closes below 20-day SMA, or when trailing stop of 2 ATR is hit. Or: Take profit at 2:1 risk-reward ratio, exit at market close for intraday."
                        value={formData.exitRules}
                        onChange={(e) => updateFormData('exitRules', e.target.value)}
                        className="mt-2 bg-secondary border-border min-h-[140px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="indicators">Technical Indicators Used</Label>
                      <Textarea
                        id="indicators"
                        placeholder="List any technical indicators: Moving Averages (SMA, EMA), RSI, MACD, Bollinger Bands, Volume, VWAP, ATR, etc."
                        value={formData.indicators}
                        onChange={(e) => updateFormData('indicators', e.target.value)}
                        className="mt-2 bg-secondary border-border min-h-[100px]"
                      />
                    </div>
                  </div>

                  <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Pro Tip</h4>
                        <p className="text-sm text-muted-foreground">
                          The more specific your entry and exit rules, the better the AI can generate your bot. 
                          Include exact indicator values, timeframes, and conditions when possible.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Risk Management */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                      <Shield className="w-6 h-6 text-primary" />
                      Risk Management
                    </h2>
                    <p className="text-muted-foreground">
                      Define your risk parameters and position management rules.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxRiskPerTrade" className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        Max Risk Per Trade (%)
                      </Label>
                      <Input
                        id="maxRiskPerTrade"
                        type="number"
                        placeholder="e.g., 1"
                        value={formData.maxRiskPerTrade}
                        onChange={(e) => updateFormData('maxRiskPerTrade', e.target.value)}
                        className="mt-2 bg-secondary border-border"
                      />
                    </div>

                    <div>
                      <Label htmlFor="maxDailyLoss" className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        Max Daily Loss (%)
                      </Label>
                      <Input
                        id="maxDailyLoss"
                        type="number"
                        placeholder="e.g., 3"
                        value={formData.maxDailyLoss}
                        onChange={(e) => updateFormData('maxDailyLoss', e.target.value)}
                        className="mt-2 bg-secondary border-border"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="positionSizing">Position Sizing Method</Label>
                    <Textarea
                      id="positionSizing"
                      placeholder="How do you determine position size? Example: Fixed quantity per trade, percentage of capital, or based on volatility (ATR-based sizing)."
                      value={formData.positionSizing}
                      onChange={(e) => updateFormData('positionSizing', e.target.value)}
                      className="mt-2 bg-secondary border-border min-h-[100px]"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stopLossType">Stop Loss Approach</Label>
                      <Input
                        id="stopLossType"
                        placeholder="e.g., Fixed %, ATR-based, support level"
                        value={formData.stopLossType}
                        onChange={(e) => updateFormData('stopLossType', e.target.value)}
                        className="mt-2 bg-secondary border-border"
                      />
                    </div>

                    <div>
                      <Label htmlFor="takeProfitType">Take Profit Approach</Label>
                      <Input
                        id="takeProfitType"
                        placeholder="e.g., Fixed target, trailing stop, R:R ratio"
                        value={formData.takeProfitType}
                        onChange={(e) => updateFormData('takeProfitType', e.target.value)}
                        className="mt-2 bg-secondary border-border"
                      />
                    </div>
                  </div>

                  <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Risk First</h4>
                        <p className="text-sm text-muted-foreground">
                          Proper risk management is the foundation of any successful trading strategy. 
                          Our platform enforces these limits strictly to protect your capital.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                      Review & Create Bot
                    </h2>
                    <p className="text-muted-foreground">
                      Review your strategy details. Our AI will analyze and create your trading bot.
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="bg-secondary/50 rounded-xl p-6 border border-border space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Strategy Summary
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Strategy Name:</span>
                        <p className="text-foreground font-medium">{formData.strategyName || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Timeframe:</span>
                        <p className="text-foreground font-medium">{formData.timeframe || 'Not selected'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Brokers/Exchanges:</span>
                        <p className="text-foreground font-medium">
                          {formData.markets.length > 0 
                            ? formData.markets.map(m => marketOptions.find(o => o.value === m)?.label).join(', ')
                            : 'None selected'}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Entry Rules:</span>
                        <p className="text-foreground font-medium line-clamp-2">{formData.entryRules || 'Not provided'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Exit Rules:</span>
                        <p className="text-foreground font-medium line-clamp-2">{formData.exitRules || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <Bot className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">What happens next?</p>
                        <ul className="space-y-1">
                          <li>• AI analyzes your strategy and generates trading bot logic</li>
                          <li>• Automatic backtesting on historical data</li>
                          <li>• Bot is ready for paper trading immediately</li>
                          <li>• Connect your broker when ready for live trading</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {!user && (
                    <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <div>
                          <p className="font-medium text-yellow-400">Login Required</p>
                          <p className="text-sm text-muted-foreground">
                            Please <Link to="/auth" className="text-primary hover:underline">log in</Link> to create your trading bot.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 1 || isSubmitting}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button
                  variant="hero"
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="hero"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !user}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Bot...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4" />
                      Create Trading Bot
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SubmitStrategy;
