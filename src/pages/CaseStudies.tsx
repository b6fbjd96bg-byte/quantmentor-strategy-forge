import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, BarChart3, Target, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const studies = [
  {
    title: 'How a Retail Trader Achieved 32% Annual Returns with AI Strategies',
    category: 'Retail Trading',
    metrics: [{ label: 'Annual Return', value: '32%' }, { label: 'Max Drawdown', value: '8.4%' }, { label: 'Sharpe Ratio', value: '2.1' }],
    summary: 'A part-time trader used QuantMentor\'s momentum strategies on Indian equities to generate consistent returns while maintaining a full-time job. By combining the AI chart analysis with automated execution, they reduced screen time from 4 hours to 15 minutes daily.',
  },
  {
    title: 'Prop Trading Firm Scales to 50+ Strategies Using QuantMentor',
    category: 'Institutional',
    metrics: [{ label: 'Strategies', value: '54' }, { label: 'Daily Trades', value: '2,800+' }, { label: 'Uptime', value: '99.99%' }],
    summary: 'A proprietary trading firm migrated their strategy development to QuantMentor, cutting development time by 70%. The capital allocation engine automatically distributes capital across strategies based on real-time performance metrics.',
  },
  {
    title: 'Crypto Portfolio Manager Reduces Drawdown by 45% with Risk Controls',
    category: 'Crypto',
    metrics: [{ label: 'Drawdown Reduced', value: '45%' }, { label: 'Win Rate', value: '61%' }, { label: 'Assets Managed', value: '$2.5M' }],
    summary: 'A crypto fund manager used QuantMentor\'s risk control system to automatically reduce exposure during high volatility periods. The dynamic position sizing and correlation-aware allocation prevented significant losses during multiple market crashes.',
  },
  {
    title: 'Student Trader Builds First Profitable Algorithm in 2 Weeks',
    category: 'Education',
    metrics: [{ label: 'Time to Profit', value: '14 days' }, { label: 'Paper P&L', value: '+₹47K' }, { label: 'Strategies Tested', value: '12' }],
    summary: 'A finance student with no coding experience used QuantMentor\'s strategy builder and backtesting engine to develop and validate their first profitable trading algorithm, transitioning from paper trading to live markets within a month.',
  },
];

const CaseStudies = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-16">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Case <span className="text-gradient-primary">Studies</span>
            </h1>
            <p className="text-lg text-muted-foreground">Real results from real traders using QuantMentor.</p>
          </motion.div>

          <div className="space-y-8 max-w-4xl mx-auto">
            {studies.map((study, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-8 hover:border-primary/30 transition-all">
                <span className="text-xs text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">{study.category}</span>
                <h2 className="font-display text-xl font-bold mt-4 mb-4">{study.title}</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {study.metrics.map((m, j) => (
                    <div key={j} className="bg-muted/30 rounded-xl p-4 text-center">
                      <p className="font-display text-2xl font-bold text-primary">{m.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed">{study.summary}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CaseStudies;
