import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Shield, Zap, Users, TrendingUp, Globe, Award, Lightbulb } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const team = [
  { name: 'Jatin Kumar', role: 'Founder & CEO', desc: 'Cybersecurity expert, OSCP+ certified, and expert trader with deep expertise in secure trading infrastructure.' },
  { name: 'Priya Mehta', role: 'Head of AI', desc: 'Former ML lead at a top hedge fund. PhD in Computational Finance.' },
  { name: 'Arjun Patel', role: 'CTO', desc: 'Full-stack architect with expertise in low-latency trading systems.' },
  { name: 'Neha Gupta', role: 'Head of Risk', desc: 'Risk management specialist with experience at leading brokerages.' },
];

const values = [
  { icon: Target, title: 'Precision', desc: 'Every algorithm is rigorously backtested and validated before deployment.' },
  { icon: Shield, title: 'Security', desc: 'Bank-grade encryption and multi-layer security for your data and capital.' },
  { icon: Lightbulb, title: 'Innovation', desc: 'Continuously evolving our AI models with cutting-edge research.' },
  { icon: Users, title: 'Accessibility', desc: 'Making institutional-grade trading tools available to everyone.' },
];

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-20">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              About <span className="text-gradient-primary">QuantMentor</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We're on a mission to democratize algorithmic trading. Our AI-powered platform transforms your trading ideas into fully automated strategies — no coding required.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {[
              { label: 'Active Traders', value: '10,000+' },
              { label: 'Strategies Deployed', value: '25,000+' },
              { label: 'Markets Covered', value: '50+' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-6 text-center">
                <p className="font-display text-3xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Our Story */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border p-8 md:p-12 mb-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold">Our Story</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed max-w-3xl">
              <p>QuantMentor was born from a simple frustration: institutional traders had access to powerful algorithmic tools, while retail traders were left with basic charting platforms and manual execution.</p>
              <p>Founded in 2024, we set out to bridge this gap. By combining advanced AI with an intuitive interface, we created a platform where any trader — from beginners to professionals — can build, test, and deploy sophisticated trading strategies.</p>
              <p>Today, QuantMentor serves thousands of traders worldwide, processing millions of data points daily to deliver actionable insights and automated execution across stocks, crypto, and forex markets.</p>
            </div>
          </motion.div>

          {/* Values */}
          <div className="mb-20">
            <h2 className="font-display text-2xl font-bold text-center mb-10">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                  className="bg-card rounded-2xl border border-border p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <v.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="mb-20">
            <h2 className="font-display text-2xl font-bold text-center mb-10">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                  className="bg-card rounded-2xl border border-border p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">{member.name[0]}</span>
                  </div>
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-sm text-primary mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;
