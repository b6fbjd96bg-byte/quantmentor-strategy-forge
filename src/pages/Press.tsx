import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const pressReleases = [
  { date: 'Feb 2025', title: 'QuantMentor Launches AI-Powered Capital Allocation Engine', desc: 'New feature allows traders to allocate capital across qualified strategies with automated risk controls.' },
  { date: 'Jan 2025', title: 'QuantMentor Crosses 10,000 Active Traders', desc: 'Platform milestone demonstrates growing demand for accessible algorithmic trading tools.' },
  { date: 'Dec 2024', title: 'QuantMentor Integrates with Zerodha for Indian Markets', desc: 'Indian traders can now automate strategies directly through their Zerodha accounts.' },
  { date: 'Oct 2024', title: 'QuantMentor Raises Seed Funding to Democratize Algo Trading', desc: 'Seed round to accelerate AI research and expand to global markets.' },
];

const mediaFeatures = [
  { outlet: 'Economic Times', title: 'How AI is Transforming Retail Trading in India', date: 'Jan 2025' },
  { outlet: 'YourStory', title: 'QuantMentor: Making Algo Trading Accessible to Everyone', date: 'Dec 2024' },
  { outlet: 'Inc42', title: 'Top 10 Fintech Startups to Watch in 2025', date: 'Nov 2024' },
];

const Press = () => {
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
              <span className="text-gradient-primary">Press</span> & Media
            </h1>
            <p className="text-lg text-muted-foreground">Latest news, press releases, and media coverage about QuantMentor.</p>
          </motion.div>

          {/* Press Contact */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg">Press Inquiries</h3>
              <p className="text-sm text-muted-foreground">For media inquiries, interviews, or press kit access</p>
            </div>
            <a href="mailto:press@quantmentor.org">
              <Button variant="outline" className="gap-2"><Mail className="w-4 h-4" /> press@quantmentor.org</Button>
            </a>
          </motion.div>

          {/* Press Releases */}
          <h2 className="font-display text-2xl font-bold mb-6">Press Releases</h2>
          <div className="space-y-4 mb-16">
            {pressReleases.map((pr, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border p-6">
                <span className="text-xs text-primary font-medium">{pr.date}</span>
                <h3 className="font-bold text-lg mt-1">{pr.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{pr.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Media Coverage */}
          <h2 className="font-display text-2xl font-bold mb-6">Media Coverage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {mediaFeatures.map((media, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-all cursor-pointer group">
                <p className="text-xs text-muted-foreground mb-2">{media.date}</p>
                <p className="text-sm text-primary font-medium mb-1">{media.outlet}</p>
                <h3 className="font-bold group-hover:text-primary transition-colors">{media.title}</h3>
                <div className="mt-3 flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Read <ExternalLink className="w-3 h-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Press;
