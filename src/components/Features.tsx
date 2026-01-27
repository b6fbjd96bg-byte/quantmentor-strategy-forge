import { motion } from 'framer-motion';
import { 
  Brain, 
  Shield, 
  BarChart3, 
  Zap, 
  Lock, 
  RefreshCw,
  Target,
  Clock,
  Bot,
  TrendingUp
} from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'Rule-Based Automation',
    description: 'Define your entry and exit rules. Our system executes them automatically—no need to watch charts all day.',
    color: 'primary',
  },
  {
    icon: TrendingUp,
    title: 'Multi-Market Support',
    description: 'Trade stocks, forex, crypto, and commodities from one dashboard. Connect your preferred brokers.',
    color: 'accent',
  },
  {
    icon: Brain,
    title: 'Strategy Builder',
    description: 'Describe your strategy in plain English or use our visual builder. We convert it to executable code.',
    color: 'primary',
  },
  {
    icon: Shield,
    title: 'Built-in Risk Controls',
    description: 'Set stop-losses, position limits, and daily loss caps. Your rules are enforced automatically.',
    color: 'accent',
  },
  {
    icon: BarChart3,
    title: 'Backtest Before You Trade',
    description: 'Test your strategy against historical data. See potential performance before risking real capital.',
    color: 'primary',
  },
  {
    icon: Zap,
    title: 'Fast Execution',
    description: 'Direct broker API connections ensure your trades are placed quickly when conditions are met.',
    color: 'accent',
  },
  {
    icon: Lock,
    title: 'Non-Custodial Security',
    description: 'We never hold your funds. Your money stays in your brokerage account at all times.',
    color: 'primary',
  },
  {
    icon: Clock,
    title: '24/7 Monitoring',
    description: 'Your strategies run around the clock. Get alerts when trades execute or conditions change.',
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
            Tools That Help You{' '}
            <span className="text-gradient-accent">Trade Smarter</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to automate your trading strategy—from backtesting 
            to live execution—with complete control over your capital.
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
