import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, BookOpen, Bot, LineChart, Shield, Settings, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const categories = [
  { icon: BookOpen, title: 'Getting Started', count: 5 },
  { icon: Bot, title: 'AI Strategies', count: 4 },
  { icon: LineChart, title: 'Live Trading', count: 4 },
  { icon: Shield, title: 'Security & Privacy', count: 3 },
  { icon: Settings, title: 'Account & Settings', count: 4 },
  { icon: CreditCard, title: 'Billing & Plans', count: 3 },
];

const faqs = [
  { q: 'How do I create my first trading strategy?', a: 'Navigate to Dashboard → Create Strategy. Define your entry/exit rules, select markets and timeframe, set risk parameters, and our AI will generate the bot code. You can then backtest it before going live.' },
  { q: 'How do I connect my Zerodha account?', a: 'Go to Settings → Broker Connection. Select Zerodha, enter your API Key and API Secret from Kite Connect, and click Connect. Your account balance and positions will sync automatically.' },
  { q: 'What is backtesting and how does it work?', a: 'Backtesting runs your strategy against historical market data to simulate how it would have performed. Go to AI Strategies → select a strategy → Chart Preview to see entry/exit signals on real candlestick data.' },
  { q: 'Is my data secure?', a: 'Yes. We use bank-grade encryption (AES-256) for all data at rest and TLS 1.3 for data in transit. API keys are encrypted and never stored in plain text. We never have access to your broker credentials.' },
  { q: 'What markets are supported?', a: 'QuantMentor supports Indian equities (NSE/BSE), US stocks, cryptocurrency, and forex markets. Support for more exchanges is being added continuously.' },
  { q: 'How do I set up risk management?', a: 'Each strategy has built-in risk parameters: stop-loss, take-profit, max positions, and max daily loss. The Capital Allocation engine adds portfolio-level risk controls including drawdown limits and volatility-based sizing.' },
  { q: 'Can I paper trade before going live?', a: 'Absolutely! All strategies start in paper trading mode by default. You can monitor simulated results and only switch to live trading once you\'re confident in the strategy\'s performance.' },
  { q: 'How does AI Chart Analysis work?', a: 'Upload a TradingView screenshot to Chart Analysis. Our AI identifies chart patterns, support/resistance levels, trend lines, and generates trade setups with specific entry, stop-loss, and target prices.' },
];

const HelpCenter = () => {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-12">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Help <span className="text-gradient-primary">Center</span>
            </h1>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search for help..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
          </motion.div>

          {/* Categories */}
          {!search && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
              {categories.map((cat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-2xl border border-border p-5 hover:border-primary/30 transition-all cursor-pointer text-center">
                  <cat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-sm">{cat.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{cat.count} articles</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* FAQs */}
          <h2 className="font-display text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {filteredFaqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl border border-border overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors">
                  <span className="font-medium pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 shrink-0 text-primary" /> : <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />}
                </button>
                {openFaq === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-5 pb-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
