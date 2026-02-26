import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const sections = [
  { title: '1. Acceptance of Terms', content: 'By accessing or using QuantMentor ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, you may not use our services. These terms apply to all users, including traders, visitors, and API consumers.' },
  { title: '2. Account Registration', content: 'You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your credentials. You must be at least 18 years old to use the Platform. One person may not maintain more than one account.' },
  { title: '3. Trading & Financial Disclaimer', content: 'QuantMentor provides tools for algorithmic trading but does NOT provide financial advice. All trading involves substantial risk of loss. Past performance of any strategy does not guarantee future results. You are solely responsible for your trading decisions and any resulting profits or losses. We recommend consulting a qualified financial advisor before trading.' },
  { title: '4. Broker Connections', content: 'When you connect a broker account, you authorize QuantMentor to execute trades on your behalf according to your configured strategies. You retain full control and can disconnect at any time. We are not responsible for broker outages, execution delays, or slippage beyond our control.' },
  { title: '5. AI & Strategy Disclaimers', content: 'AI-generated analysis, predictions, and strategy suggestions are for informational purposes only and should not be treated as financial advice. While we strive for accuracy, AI models can produce errors. Backtesting results are simulated and may not reflect actual trading conditions including slippage, fees, and liquidity constraints.' },
  { title: '6. Acceptable Use', content: 'You agree not to: reverse-engineer, decompile, or attempt to extract source code; use the platform for market manipulation or illegal trading activities; share your account credentials; use automated tools to scrape or overload our systems; or violate any applicable securities laws or regulations.' },
  { title: '7. Intellectual Property', content: 'All content, algorithms, AI models, and software on QuantMentor are our intellectual property. Strategies you create belong to you, but the underlying platform technology remains ours. You grant us a license to use your strategies for improving our AI models (anonymized and aggregated only).' },
  { title: '8. Limitation of Liability', content: 'To the maximum extent permitted by law, QuantMentor shall not be liable for any indirect, incidental, special, or consequential damages, including trading losses, lost profits, or data loss. Our total liability shall not exceed the amount you paid for the service in the 12 months preceding the claim.' },
  { title: '9. Termination', content: 'We may suspend or terminate your account for violation of these terms, suspicious activity, or at our discretion with notice. Upon termination, your right to use the platform ceases, but your data can be exported within 30 days. Active trading bots will be stopped upon termination.' },
  { title: '10. Governing Law', content: 'These terms are governed by the laws of India. Any disputes shall be resolved through arbitration in Gurugram, Haryana, in accordance with the Arbitration and Conciliation Act, 1996.' },
];

const TermsOfService = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Terms of <span className="text-gradient-primary">Service</span></h1>
          <p className="text-muted-foreground">Last updated: February 2025</p>
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

export default TermsOfService;
