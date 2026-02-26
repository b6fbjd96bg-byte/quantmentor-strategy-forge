import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Briefcase, ChevronRight, Zap, Heart, Coffee, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const openings = [
  { title: 'Senior ML Engineer', team: 'AI & Research', location: 'Gurugram / Remote', type: 'Full-time', desc: 'Build and optimize AI models for real-time market prediction and strategy generation.' },
  { title: 'Full-Stack Developer', team: 'Engineering', location: 'Gurugram / Remote', type: 'Full-time', desc: 'Develop and scale our trading platform using React, TypeScript, and cloud infrastructure.' },
  { title: 'Quantitative Analyst', team: 'Trading', location: 'Gurugram', type: 'Full-time', desc: 'Design and backtest algorithmic trading strategies across multiple asset classes.' },
  { title: 'Product Designer', team: 'Design', location: 'Remote', type: 'Full-time', desc: 'Create intuitive interfaces for complex trading workflows and data visualization.' },
  { title: 'DevOps Engineer', team: 'Infrastructure', location: 'Gurugram / Remote', type: 'Full-time', desc: 'Maintain low-latency infrastructure for real-time trading and data processing.' },
  { title: 'Community Manager', team: 'Growth', location: 'Remote', type: 'Full-time', desc: 'Build and engage our growing community of traders across social platforms.' },
];

const perks = [
  { icon: Heart, title: 'Health & Wellness', desc: 'Comprehensive health insurance for you and your family' },
  { icon: Coffee, title: 'Flexible Work', desc: 'Remote-first culture with flexible hours' },
  { icon: GraduationCap, title: 'Learning Budget', desc: '₹1L annual budget for courses, conferences, and books' },
  { icon: Zap, title: 'Stock Options', desc: 'Equity participation for all full-time employees' },
];

const Careers = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-16">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Join <span className="text-gradient-primary">Our Team</span>
            </h1>
            <p className="text-lg text-muted-foreground">Help us democratize algorithmic trading. We're building the future of AI-powered finance.</p>
          </motion.div>

          {/* Perks */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
            {perks.map((perk, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border p-6">
                <perk.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold mb-1">{perk.title}</h3>
                <p className="text-sm text-muted-foreground">{perk.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Openings */}
          <h2 className="font-display text-2xl font-bold mb-6">Open Positions</h2>
          <div className="space-y-4 mb-16">
            {openings.map((job, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-all group cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{job.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{job.desc}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.team}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.type}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1 shrink-0">
                    Apply <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl border border-primary/20 p-8 text-center">
            <h3 className="font-display text-2xl font-bold mb-2">Don't see your role?</h3>
            <p className="text-muted-foreground mb-4">We're always looking for talented people. Send us your resume!</p>
            <a href="mailto:careers@quantmentor.org">
              <Button variant="hero">Send Resume</Button>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
