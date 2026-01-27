import { motion } from 'framer-motion';
import { FileText, Cpu, TestTube2, Rocket, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    step: '01',
    title: 'Describe Your Strategy',
    description: 'Tell us your trading rules in plain English. What triggers a buy? When do you sell? What are your risk limits?',
  },
  {
    icon: Cpu,
    step: '02',
    title: 'We Build & Review Together',
    description: 'Our team converts your rules into code. You review everything before going live—no surprises.',
  },
  {
    icon: TestTube2,
    step: '03',
    title: 'Backtest on Historical Data',
    description: 'See how your strategy would have performed. Adjust parameters until you\'re satisfied with the results.',
  },
  {
    icon: Rocket,
    step: '04',
    title: 'Connect & Go Live',
    description: 'Link your brokerage account via API. Your strategy starts executing trades automatically based on your rules.',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-glow opacity-30" />
      
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
            How It Works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            From Idea to <span className="text-gradient-primary">Live Trading</span> in 4 Steps
          </h2>
          <p className="text-lg text-muted-foreground">
            You focus on the strategy. We handle the technical implementation. 
            Full transparency at every step so you stay in control.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-border via-primary/30 to-border z-0" />
              )}
              
              <div className="relative bg-gradient-card border border-border/50 rounded-2xl p-6 lg:p-8 hover:border-primary/40 transition-all duration-300 hover:shadow-glow h-full">
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow text-sm font-bold text-primary-foreground">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="font-display text-xl font-semibold mb-3 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <a
            href="#"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-4 transition-all duration-300"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
