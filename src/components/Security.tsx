import { motion } from 'framer-motion';
import { Shield, Lock, Server, FileCheck, Eye, AlertTriangle } from 'lucide-react';

const securityFeatures = [
  {
    icon: Lock,
    title: 'Bank-Grade Encryption',
    description: 'AES-256 encryption for all data at rest and in transit. Your strategies and data are fortress-protected.',
  },
  {
    icon: Server,
    title: 'Secure Infrastructure',
    description: 'SOC 2 Type II certified data centers with redundant systems and 24/7 physical security.',
  },
  {
    icon: FileCheck,
    title: 'Regulatory Compliance',
    description: 'Full compliance with SEC, FINRA, and international trading regulations across all jurisdictions.',
  },
  {
    icon: Eye,
    title: 'Real-Time Monitoring',
    description: 'Continuous security monitoring with AI-powered threat detection and instant response protocols.',
  },
  {
    icon: Shield,
    title: 'Access Controls',
    description: 'Multi-factor authentication, IP whitelisting, and granular permission management.',
  },
  {
    icon: AlertTriangle,
    title: 'Risk Safeguards',
    description: 'Automated circuit breakers, position limits, and emergency shutdown capabilities.',
  },
];

const Security = () => {
  return (
    <section id="security" className="py-24 lg:py-32 bg-card relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            hsl(var(--primary)) 0,
            hsl(var(--primary)) 1px,
            transparent 0,
            transparent 50%
          )`,
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
        >
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Security & Compliance
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Your Capital is{' '}
            <span className="text-gradient-primary">Protected</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Enterprise-grade security infrastructure with regulatory compliance 
            across major financial markets. Trade with confidence.
          </p>
        </motion.div>

        {/* Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-background border border-border/50 rounded-2xl p-6 hover:border-primary/40 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 lg:gap-12"
        >
          {['SOC 2 Certified', 'GDPR Compliant', 'ISO 27001', 'SEC Registered'].map((badge) => (
            <div
              key={badge}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{badge}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Security;
