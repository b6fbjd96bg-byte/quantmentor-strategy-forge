import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$299',
    period: '/month',
    description: 'Perfect for individual traders getting started with automation.',
    features: [
      '1 Live Strategy',
      'Basic Backtesting (5 years)',
      'Standard Execution Speed',
      'Email Support',
      'Basic Risk Controls',
      'Weekly Performance Reports',
    ],
    cta: 'Get Started',
    variant: 'heroOutline' as const,
    popular: false,
  },
  {
    name: 'Professional',
    price: '$799',
    period: '/month',
    description: 'For serious traders demanding professional-grade tools.',
    features: [
      '5 Live Strategies',
      'Advanced Backtesting (20 years)',
      'Low-Latency Execution',
      'Priority Support (24/7)',
      'Advanced Risk Management',
      'Real-time Analytics Dashboard',
      'Custom Indicator Integration',
      'API Access',
    ],
    cta: 'Start Free Trial',
    variant: 'hero' as const,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Tailored solutions for funds and institutional clients.',
    features: [
      'Unlimited Strategies',
      'Full Historical Data Access',
      'Ultra-Low Latency (Co-located)',
      'Dedicated Account Manager',
      'Custom Risk Frameworks',
      'White-Label Options',
      'Compliance & Audit Support',
      'SLA Guarantees',
    ],
    cta: 'Contact Sales',
    variant: 'heroOutline' as const,
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-card relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
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
            Pricing
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Simple, <span className="text-gradient-primary">Transparent</span> Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            No hidden fees. No performance charges. Choose the plan that matches 
            your trading goals and scale as you grow.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative bg-background border rounded-2xl p-6 lg:p-8 ${
                plan.popular 
                  ? 'border-primary shadow-glow scale-105' 
                  : 'border-border/50 hover:border-primary/40'
              } transition-all duration-300`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold">
                    <Zap className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}
              
              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl lg:text-5xl font-bold text-gradient-primary">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  {plan.description}
                </p>
              </div>
              
              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* CTA */}
              <Button 
                variant={plan.variant} 
                size="lg" 
                className="w-full"
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
