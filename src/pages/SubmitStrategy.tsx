import { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  { id: 1, title: 'Strategy Overview', icon: Target },
  { id: 2, title: 'Entry & Exit Rules', icon: Zap },
  { id: 3, title: 'Risk Management', icon: Shield },
  { id: 4, title: 'Review & Submit', icon: CheckCircle2 },
];

const marketOptions = [
  'US Stocks', 'Indian Stocks (NSE/BSE)', 'Forex', 'Cryptocurrencies', 
  'Commodities', 'Futures & Options', 'ETFs'
];

const timeframeOptions = [
  'Scalping (< 5 min)', 'Intraday (5-60 min)', 'Swing (1-5 days)', 
  'Positional (1-4 weeks)', 'Long-term (> 1 month)'
];

const SubmitStrategy = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1
    strategyName: '',
    description: '',
    markets: [] as string[],
    timeframe: '',
    // Step 2
    entryRules: '',
    exitRules: '',
    indicators: '',
    // Step 3
    maxRiskPerTrade: '',
    maxDailyLoss: '',
    positionSizing: '',
    stopLossType: '',
    takeProfitType: '',
    // Contact
    name: '',
    email: '',
    phone: '',
  });

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

  const handleSubmit = () => {
    setIsSubmitted(true);
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
            <CheckCircle2 className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Strategy Submitted Successfully!
          </h1>
          <p className="text-muted-foreground mb-8">
            Our team of expert quantitative developers will review your strategy 
            and get back to you within 24-48 hours with a detailed analysis and next steps.
          </p>
          <div className="space-y-4">
            <Link to="/">
              <Button variant="hero" size="lg" className="w-full">
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
              Submit Your <span className="text-gradient-primary">Strategy</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Describe your trading strategy and let our AI-powered platform transform it 
              into a fully automated trading algorithm.
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
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
                      <Label>Target Markets *</Label>
                      <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {marketOptions.map((market) => (
                          <button
                            key={market}
                            type="button"
                            onClick={() => toggleMarket(market)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium border transition-all ${
                              formData.markets.includes(market)
                                ? 'bg-primary/20 border-primary text-primary'
                                : 'bg-secondary border-border text-foreground hover:border-primary/50'
                            }`}
                          >
                            {market}
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
                          The more specific your entry and exit rules, the better we can optimize 
                          your algorithm. Include exact indicator values, timeframes, and conditions 
                          when possible.
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
                        Max Risk Per Trade
                      </Label>
                      <Input
                        id="maxRiskPerTrade"
                        placeholder="e.g., 1% of capital, or ₹5,000"
                        value={formData.maxRiskPerTrade}
                        onChange={(e) => updateFormData('maxRiskPerTrade', e.target.value)}
                        className="mt-2 bg-secondary border-border"
                      />
                    </div>

                    <div>
                      <Label htmlFor="maxDailyLoss" className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        Max Daily Loss Limit
                      </Label>
                      <Input
                        id="maxDailyLoss"
                        placeholder="e.g., 3% of capital, or ₹15,000"
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
                      Review & Submit
                    </h2>
                    <p className="text-muted-foreground">
                      Review your strategy details and provide your contact information.
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
                        <span className="text-muted-foreground">Markets:</span>
                        <p className="text-foreground font-medium">
                          {formData.markets.length > 0 ? formData.markets.join(', ') : 'None selected'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Contact Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => updateFormData('name', e.target.value)}
                          className="mt-2 bg-secondary border-border"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="+91 XXXXXXXXXX"
                          value={formData.phone}
                          onChange={(e) => updateFormData('phone', e.target.value)}
                          className="mt-2 bg-secondary border-border"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className="mt-2 bg-secondary border-border"
                      />
                    </div>
                  </div>

                  <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">What happens next?</p>
                        <ul className="space-y-1">
                          <li>• Our quant team reviews your strategy within 24-48 hours</li>
                          <li>• We'll schedule a call to discuss optimization opportunities</li>
                          <li>• Receive a detailed feasibility report and cost estimate</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 1}
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
                  className="flex items-center gap-2"
                >
                  Submit Strategy
                  <Check className="w-4 h-4" />
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
