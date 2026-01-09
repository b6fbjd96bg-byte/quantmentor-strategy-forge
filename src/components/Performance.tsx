import { motion } from 'framer-motion';
import { TrendingUp, Users, Globe, Award } from 'lucide-react';

const metrics = [
  { 
    value: '156%', 
    label: 'Average Annual Return',
    sublabel: 'Top performing strategies',
    icon: TrendingUp,
  },
  { 
    value: '12,500+', 
    label: 'Active Traders',
    sublabel: 'Across 85+ countries',
    icon: Users,
  },
  { 
    value: '50+', 
    label: 'Broker Integrations',
    sublabel: 'Global market access',
    icon: Globe,
  },
  { 
    value: '8 Years', 
    label: 'Track Record',
    sublabel: 'Proven performance',
    icon: Award,
  },
];

const Performance = () => {
  return (
    <section id="performance" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              Performance Analytics
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Data-Driven Results You Can{' '}
              <span className="text-gradient-primary">Trust</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our platform delivers transparent, verifiable performance metrics. 
              Track every trade, analyze every decision, and optimize your returns 
              with comprehensive analytics dashboards.
            </p>

            {/* Feature List */}
            <ul className="space-y-4">
              {[
                'Real-time P&L tracking and portfolio analytics',
                'Detailed trade-by-trade performance breakdown',
                'Risk-adjusted return metrics (Sharpe, Sortino, Max DD)',
                'Comparative benchmarking against market indices',
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right - Metrics Grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 gap-4 lg:gap-6"
          >
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="bg-gradient-card border border-border/50 rounded-2xl p-6 hover:border-primary/40 transition-all duration-300 group"
              >
                <metric.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <div className="text-3xl lg:text-4xl font-bold text-gradient-primary mb-2">
                  {metric.value}
                </div>
                <div className="text-sm font-medium text-foreground mb-1">
                  {metric.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metric.sublabel}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Performance;
