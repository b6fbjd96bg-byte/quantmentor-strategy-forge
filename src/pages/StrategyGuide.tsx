import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, TrendingUp, BarChart3, Shield, Zap, Target, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const chapters = [
  {
    icon: BookOpen, number: '01', title: 'Understanding Algorithmic Trading',
    topics: ['What is algo trading?', 'Manual vs automated trading', 'Types of trading strategies', 'Key terminology'],
    desc: 'Learn the fundamentals of algorithmic trading and how AI can enhance your trading decisions.',
  },
  {
    icon: TrendingUp, number: '02', title: 'Building Your First Strategy',
    topics: ['Choosing a market & timeframe', 'Defining entry & exit rules', 'Technical indicators explained', 'Strategy templates'],
    desc: 'Step-by-step guide to creating a trading strategy from scratch using QuantMentor\'s builder.',
  },
  {
    icon: BarChart3, number: '03', title: 'Backtesting & Optimization',
    topics: ['How backtesting works', 'Reading backtest results', 'Avoiding overfitting', 'Walk-forward analysis'],
    desc: 'Validate your strategy against historical data and optimize parameters for better performance.',
  },
  {
    icon: Shield, number: '04', title: 'Risk Management',
    topics: ['Position sizing methods', 'Stop-loss strategies', 'Portfolio-level risk controls', 'Drawdown management'],
    desc: 'Protect your capital with proven risk management techniques and automated safeguards.',
  },
  {
    icon: Zap, number: '05', title: 'Going Live',
    topics: ['Connecting your broker', 'Paper trading first', 'Monitoring live performance', 'When to intervene'],
    desc: 'Deploy your strategy to live markets and monitor performance in real-time.',
  },
  {
    icon: Target, number: '06', title: 'Advanced Techniques',
    topics: ['Multi-strategy portfolios', 'Market regime detection', 'AI-powered signal generation', 'Capital allocation'],
    desc: 'Level up with advanced concepts like portfolio allocation, regime detection, and AI signals.',
  },
];

const StrategyGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-16">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Strategy <span className="text-gradient-primary">Guide</span>
            </h1>
            <p className="text-lg text-muted-foreground">Everything you need to know about building profitable trading strategies with QuantMentor.</p>
          </motion.div>

          <div className="space-y-6">
            {chapters.map((ch, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl border border-border p-8 hover:border-primary/30 transition-all group">
                <div className="flex items-start gap-6">
                  <div className="shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <ch.icon className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2 font-mono">Ch. {ch.number}</p>
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">{ch.title}</h2>
                    <p className="text-muted-foreground text-sm mb-4">{ch.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {ch.topics.map((topic, j) => (
                        <span key={j} className="text-xs bg-muted/50 text-muted-foreground px-3 py-1.5 rounded-full">{topic}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl border border-primary/20 p-8 text-center">
            <h3 className="font-display text-2xl font-bold mb-2">Ready to build your first strategy?</h3>
            <p className="text-muted-foreground mb-4">Put this knowledge into action with our AI-powered strategy builder.</p>
            <Link to="/submit-strategy"><Button variant="hero" className="gap-2"><Zap className="w-4 h-4" />Create Strategy</Button></Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StrategyGuide;
