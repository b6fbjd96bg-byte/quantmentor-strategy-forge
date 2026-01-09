import { motion } from 'framer-motion';
import { 
  Brain, 
  Shield, 
  BarChart3, 
  Zap, 
  Lock, 
  RefreshCw,
  Target,
  Clock
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Assisted Execution',
    description: 'Machine learning models analyze market conditions in real-time, optimizing entry and exit points for maximum returns.',
    color: 'primary',
  },
  {
    icon: Shield,
    title: 'Advanced Risk Management',
    description: 'Dynamic position sizing, stop-losses, and exposure limits protect your capital through volatile markets.',
    color: 'accent',
  },
  {
    icon: BarChart3,
    title: 'Comprehensive Backtesting',
    description: 'Test strategies against years of historical data with institutional-grade simulation engines.',
    color: 'primary',
  },
  {
    icon: Zap,
    title: 'Ultra-Low Latency',
    description: 'Co-located servers ensure sub-millisecond execution speeds, capturing opportunities before they vanish.',
    color: 'accent',
  },
  {
    icon: Lock,
    title: 'Secure Broker Integration',
    description: 'Bank-level encryption and API connections with 50+ leading brokers worldwide.',
    color: 'primary',
  },
  {
    icon: RefreshCw,
    title: 'Continuous Optimization',
    description: 'AI continuously learns and adapts your strategy to evolving market conditions.',
    color: 'accent',
  },
  {
    icon: Target,
    title: 'Strategy Customization',
    description: 'Fine-tune every parameter—from timeframes to indicators—to match your trading style.',
    color: 'primary',
  },
  {
    icon: Clock,
    title: '24/7 Monitoring',
    description: 'Round-the-clock surveillance with instant alerts and automated fail-safes.',
    color: 'accent',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 lg:py-32 bg-card relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />
      
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
            Platform Features
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Everything You Need to{' '}
            <span className="text-gradient-accent">Trade Smarter</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Enterprise-grade infrastructure and AI-powered tools, 
            designed for traders who demand excellence.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-background border border-border/50 rounded-2xl p-6 hover:border-primary/40 transition-all duration-300"
            >
              {/* Gradient Hover Effect */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl ${
                feature.color === 'primary' ? 'bg-gradient-glow' : 'bg-[radial-gradient(ellipse_at_center,_hsl(var(--accent)/0.1)_0%,_transparent_70%)]'
              }`} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                  feature.color === 'primary' 
                    ? 'bg-primary/10 group-hover:bg-primary/20' 
                    : 'bg-accent/10 group-hover:bg-accent/20'
                } transition-colors`}>
                  <feature.icon className={`w-6 h-6 ${
                    feature.color === 'primary' ? 'text-primary' : 'text-accent'
                  }`} />
                </div>
                
                {/* Content */}
                <h3 className="font-display text-lg font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
