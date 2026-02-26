import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const sections = [
  { title: '1. General Risk Warning', content: 'Trading in financial instruments carries a high level of risk and may not be suitable for all investors. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment.' },
  { title: '2. Algorithmic Trading Risks', content: 'Automated trading systems are subject to technology risks including software bugs, connectivity issues, hardware failures, and latency delays. These can result in missed trades, duplicate orders, or execution at unintended prices. Past performance of any algorithm or strategy does not guarantee future results.' },
  { title: '3. AI & Machine Learning Limitations', content: 'AI-generated predictions and analysis are probabilistic in nature and can be wrong. Market conditions can change rapidly and in ways not captured by historical data. AI models may fail during unprecedented market events (black swan events). Always use AI outputs as one input among many in your decision-making process.' },
  { title: '4. Market Risks', content: 'Markets can experience extreme volatility, gaps, and illiquidity that can amplify losses. Leveraged trading can magnify both profits and losses. Cryptocurrency markets operate 24/7 and can be especially volatile. Emerging market instruments may have additional risks including currency risk and political instability.' },
  { title: '5. Execution & Slippage Risks', content: 'There may be differences between backtested/simulated results and actual trading results. Slippage (difference between expected and actual execution price) can significantly impact returns, especially during volatile periods. Broker fees, commissions, and taxes can reduce net returns.' },
  { title: '6. Capital at Risk', content: 'You should only trade with capital you can afford to lose entirely. Never borrow money to trade or invest. Ensure you have adequate emergency savings before allocating funds to trading. Consider your overall financial situation and obligations before trading.' },
  { title: '7. No Financial Advice', content: 'QuantMentor does not provide personal financial, investment, or tax advice. All content on the platform is for informational and educational purposes only. You should consult with qualified financial advisors, tax professionals, and legal counsel before making trading decisions.' },
  { title: '8. Regulatory Notice', content: 'Trading activities may be subject to regulations by SEBI (India), SEC (US), and other regulatory bodies depending on your jurisdiction. It is your responsibility to ensure compliance with all applicable laws and regulations. QuantMentor does not guarantee regulatory compliance on your behalf.' },
];

const RiskDisclosure = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Risk <span className="text-gradient-primary">Disclosure</span></h1>
          <p className="text-muted-foreground">Last updated: February 2025</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-destructive/10 border border-destructive/30 rounded-2xl p-6 mb-10 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-destructive mb-1">Important Warning</p>
            <p className="text-sm text-muted-foreground">Trading involves substantial risk of loss. Only trade with money you can afford to lose. This is not financial advice.</p>
          </div>
        </motion.div>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <h2 className="font-display text-xl font-bold mb-3">{s.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{s.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default RiskDisclosure;
