import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const sections = [
  { title: '1. Information We Collect', content: `We collect information you provide directly: account details (name, email, phone), trading preferences, strategy configurations, and broker API credentials (encrypted). We also collect usage data: pages visited, features used, device information, and IP address. We do NOT collect or store your broker passwords or have direct access to your trading accounts.` },
  { title: '2. How We Use Your Information', content: `Your information is used to: provide and improve our services, execute and monitor your trading strategies, generate AI-powered analysis and recommendations, communicate important updates, and ensure platform security. We never sell your personal data to third parties.` },
  { title: '3. Data Security', content: `We implement bank-grade security: AES-256 encryption for data at rest, TLS 1.3 for data in transit, encrypted storage for all API keys and credentials, regular security audits, and SOC 2 compliance practices. Your broker API credentials are encrypted using industry-standard methods and stored in isolated, secure environments.` },
  { title: '4. Data Sharing', content: `We share data only when necessary: with your connected broker (to execute trades on your behalf), with service providers who assist our operations (under strict confidentiality), and when required by law or regulatory authorities. We never share your trading strategies, performance data, or personal information with other users.` },
  { title: '5. Data Retention', content: `We retain your account data for as long as your account is active. Trading history and journal entries are retained indefinitely unless you request deletion. Upon account deletion, personal data is removed within 30 days, though anonymized aggregate data may be retained for analytics.` },
  { title: '6. Your Rights', content: `You have the right to: access your personal data, correct inaccurate data, delete your account and associated data, export your data in standard formats, opt out of marketing communications, and withdraw consent at any time. Contact us at privacy@quantmentor.org to exercise these rights.` },
  { title: '7. Cookies & Tracking', content: `We use essential cookies for authentication and session management. Analytics cookies help us understand usage patterns and improve the platform. You can control cookie preferences through your browser settings. We do not use cookies for advertising or cross-site tracking.` },
  { title: '8. Changes to This Policy', content: `We may update this privacy policy from time to time. We will notify you of significant changes via email or in-app notification. Continued use of the platform after changes constitutes acceptance. Last updated: February 2025.` },
];

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Privacy <span className="text-gradient-primary">Policy</span></h1>
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

export default PrivacyPolicy;
