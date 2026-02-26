import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle2, FileText, Globe } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const frameworks = [
  { icon: Shield, title: 'Data Protection', items: ['GDPR compliant data handling', 'IT Act 2000 (India) compliance', 'User consent management', 'Data breach notification procedures', 'Right to erasure support'] },
  { icon: FileText, title: 'Financial Regulations', items: ['SEBI guidelines awareness for algo trading', 'KYC/AML compliance via broker partners', 'Risk disclosure requirements met', 'Fair trading practices', 'No market manipulation policies'] },
  { icon: Globe, title: 'Security Standards', items: ['AES-256 encryption at rest', 'TLS 1.3 encryption in transit', 'Regular penetration testing', 'SOC 2 practices', 'Isolated credential storage'] },
  { icon: CheckCircle2, title: 'Operational Compliance', items: ['99.9% uptime SLA', 'Disaster recovery procedures', 'Regular security audits', 'Employee background checks', 'Incident response plan'] },
];

const Compliance = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-16">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gradient-primary">Compliance</span> & Security
          </h1>
          <p className="text-lg text-muted-foreground">How QuantMentor meets regulatory requirements and protects your data.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {frameworks.map((fw, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl border border-border p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <fw.icon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display text-xl font-bold">{fw.title}</h2>
              </div>
              <ul className="space-y-3">
                {fw.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl border border-border p-8">
          <h2 className="font-display text-xl font-bold mb-4">Reporting a Concern</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you believe there has been a security vulnerability, data breach, or compliance violation, please contact our security team immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <a href="mailto:security@quantmentor.org" className="text-primary hover:text-primary/80 font-medium">security@quantmentor.org</a>
            <a href="mailto:compliance@quantmentor.org" className="text-primary hover:text-primary/80 font-medium">compliance@quantmentor.org</a>
          </div>
        </motion.div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Compliance;
