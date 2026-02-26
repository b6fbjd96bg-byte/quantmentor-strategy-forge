import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ChevronRight, BarChart3, Bot, LineChart, BookOpen, Shield, Zap, TrendingUp, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const demoSteps = [
  {
    icon: TrendingUp,
    title: 'Describe Your Strategy',
    desc: 'Tell us your trading rules in plain English — entry signals, exit conditions, and risk limits. No coding needed.',
    preview: 'strategy-form',
  },
  {
    icon: Bot,
    title: 'AI Builds Your Bot',
    desc: 'Our AI converts your rules into an automated trading bot, complete with backtested performance data.',
    preview: 'ai-build',
  },
  {
    icon: BarChart3,
    title: 'Backtest & Validate',
    desc: 'See how your strategy would have performed on historical data with detailed metrics — win rate, P&L, drawdown.',
    preview: 'backtest',
  },
  {
    icon: Settings,
    title: 'Connect Your Broker',
    desc: 'Link your Zerodha or other broker account via secure API. Your funds stay in your brokerage — we never touch them.',
    preview: 'broker',
  },
  {
    icon: LineChart,
    title: 'Go Live & Monitor',
    desc: 'Your bot executes trades automatically. Monitor real-time performance, positions, and P&L from the dashboard.',
    preview: 'live',
  },
];

interface DemoVideoModalProps {
  open: boolean;
  onClose: () => void;
}

const DemoVideoModal = ({ open, onClose }: DemoVideoModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = demoSteps[currentStep];

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl mx-4 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-bold">How QuantMentor Works</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Visual Preview */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-muted/30 rounded-2xl border border-border p-8 mb-8 min-h-[200px] flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {demoSteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentStep ? 'bg-primary w-8' : i < currentStep ? 'bg-primary/40 w-2' : 'bg-muted-foreground/20 w-2'
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Back
              </Button>

              <span className="text-sm text-muted-foreground">Step {currentStep + 1} of {demoSteps.length}</span>

              {currentStep < demoSteps.length - 1 ? (
                <Button variant="hero" onClick={() => setCurrentStep(currentStep + 1)} className="gap-1">
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Link to="/auth" onClick={onClose}>
                  <Button variant="hero" className="gap-1">
                    Start Free Trial <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DemoVideoModal;
