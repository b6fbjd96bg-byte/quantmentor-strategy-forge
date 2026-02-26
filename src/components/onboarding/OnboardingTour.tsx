import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, ChevronLeft, BarChart3, Bot, LineChart, 
  BookOpen, PieChart, Settings, TrendingUp, DollarSign, Zap, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface TourStep {
  title: string;
  description: string;
  icon: React.ElementType;
  highlight?: string;
  action?: string;
  route?: string;
}

const tourSteps: TourStep[] = [
  {
    title: 'Welcome to QuantMentor! 🎉',
    description: 'Your AI-powered trading command center. Let me walk you through the key features so you can start trading smarter.',
    icon: Zap,
  },
  {
    title: 'Dashboard Overview',
    description: 'This is your home base. See your strategies, active bots, total trades, and P&L at a glance. Everything updates in real-time from your trading activity.',
    icon: BarChart3,
    highlight: 'stats',
  },
  {
    title: 'AI Chart Analysis',
    description: 'Upload any TradingView screenshot and our AI will identify patterns, support/resistance levels, and suggest trade setups with entry/exit points.',
    icon: TrendingUp,
    route: '/chart-analysis',
  },
  {
    title: 'AI Strategies',
    description: 'Browse and create AI-powered trading strategies. Each strategy can be backtested with historical data and deployed as an automated trading bot.',
    icon: Bot,
    route: '/ai-strategies',
  },
  {
    title: 'Create Your First Strategy',
    description: 'Click "Create Strategy" to define your trading rules — entry/exit conditions, risk parameters, and target markets. Our AI will generate the bot code for you.',
    icon: Bot,
    action: 'create-strategy',
    route: '/submit-strategy',
  },
  {
    title: 'Live Trading',
    description: 'Monitor your open positions, view trade history, and track real-time P&L. All trades from your connected broker appear here automatically.',
    icon: LineChart,
    route: '/live-trading',
  },
  {
    title: 'Connect Your Broker',
    description: 'To execute real trades, connect your broker (like Zerodha). Go to Settings → Broker Connection, enter your API key and secret, and you\'re ready to trade live.',
    icon: Settings,
    route: '/settings',
  },
  {
    title: 'Trade Journal',
    description: 'Log every trade with emotions, strategy tags, and lessons learned. Track your trading psychology alongside your P&L to improve over time.',
    icon: BookOpen,
    route: '/trade-journal',
  },
  {
    title: 'Analytics',
    description: 'Deep dive into your performance — win rates, P&L curves, market distribution, and strategy comparison charts. All powered by your real trading data.',
    icon: PieChart,
    route: '/analytics',
  },
  {
    title: 'Capital Allocation',
    description: 'Allocate capital across qualified strategies with automated risk controls, drawdown limits, and performance-based fee tracking.',
    icon: DollarSign,
    route: '/capital-allocation',
  },
  {
    title: 'You\'re All Set! 🚀',
    description: 'Start by creating your first strategy or uploading a chart for AI analysis. You can always access this tour again from Settings.',
    icon: CheckCircle2,
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

const OnboardingTour = ({ onComplete }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const step = tourSteps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === tourSteps.length - 1;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) setCurrentStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    // Mark onboarding as complete in profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ 
        trading_experience: 'onboarded' 
      }).eq('user_id', user.id);
    }
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleGoToRoute = () => {
    if (step.route) {
      handleComplete();
      navigate(step.route);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg mx-4 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
        >
          {/* Progress bar */}
          <div className="h-1 bg-muted">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Close / Skip */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-8">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs text-muted-foreground font-medium">
                Step {currentStep + 1} of {tourSteps.length}
              </span>
            </div>

            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <step.icon className="w-8 h-8 text-primary" />
            </div>

            {/* Title & Description */}
            <h2 className="font-display text-2xl font-bold mb-3">{step.title}</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">{step.description}</p>

            {/* Navigation route button */}
            {step.route && (
              <button
                onClick={handleGoToRoute}
                className="mb-6 text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
              >
                Go to {step.title} →
              </button>
            )}

            {/* Step dots */}
            <div className="flex items-center justify-center gap-1.5 mb-6">
              {tourSteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentStep 
                      ? 'bg-primary w-6' 
                      : i < currentStep 
                        ? 'bg-primary/40' 
                        : 'bg-muted-foreground/20'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={isFirst}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>

              <div className="flex gap-2">
                {!isLast && (
                  <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
                    Skip Tour
                  </Button>
                )}
                <Button variant="hero" onClick={handleNext} className="gap-1">
                  {isLast ? 'Get Started' : 'Next'}
                  {!isLast && <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingTour;
