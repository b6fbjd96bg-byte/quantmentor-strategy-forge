import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Code, Key, Zap, BookOpen, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const endpoints = [
  { method: 'GET', path: '/api/v1/strategies', desc: 'List all your strategies', auth: true },
  { method: 'POST', path: '/api/v1/strategies', desc: 'Create a new strategy', auth: true },
  { method: 'GET', path: '/api/v1/bots', desc: 'List active trading bots', auth: true },
  { method: 'POST', path: '/api/v1/bots/:id/start', desc: 'Start a trading bot', auth: true },
  { method: 'POST', path: '/api/v1/bots/:id/stop', desc: 'Stop a trading bot', auth: true },
  { method: 'GET', path: '/api/v1/trades', desc: 'Get trade history', auth: true },
  { method: 'GET', path: '/api/v1/portfolio', desc: 'Get current portfolio & balance', auth: true },
  { method: 'POST', path: '/api/v1/backtest', desc: 'Run a backtest on a strategy', auth: true },
  { method: 'GET', path: '/api/v1/market/overview', desc: 'Get market overview data', auth: false },
  { method: 'POST', path: '/api/v1/chart/analyze', desc: 'AI chart analysis from screenshot', auth: true },
];

const codeExample = `// Install the SDK
npm install @quantmentor/sdk

// Initialize
import { QuantMentor } from '@quantmentor/sdk';

const qm = new QuantMentor({
  apiKey: 'your-api-key-here'
});

// List strategies
const strategies = await qm.strategies.list();

// Start a bot
await qm.bots.start('bot-id', {
  symbol: 'NIFTY50',
  capital: 100000
});

// Get portfolio
const portfolio = await qm.portfolio.get();
console.log(portfolio.balance);`;

const ApiDocumentation = () => {
  const copyCode = () => {
    navigator.clipboard.writeText(codeExample);
    toast.success('Code copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-16">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              API <span className="text-gradient-primary">Documentation</span>
            </h1>
            <p className="text-lg text-muted-foreground">Integrate QuantMentor's trading engine into your own applications.</p>
          </motion.div>

          {/* Quick Start */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Key, title: 'Get API Key', desc: 'Generate your key in Settings → API' },
              { icon: Code, title: 'Install SDK', desc: 'npm install @quantmentor/sdk' },
              { icon: Zap, title: 'Start Trading', desc: 'Deploy strategies programmatically' },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Code Example */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border mb-12 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Quick Start Example</span>
              </div>
              <Button variant="ghost" size="sm" onClick={copyCode} className="gap-1"><Copy className="w-3 h-3" />Copy</Button>
            </div>
            <pre className="p-6 text-sm text-muted-foreground overflow-x-auto font-mono leading-relaxed">{codeExample}</pre>
          </motion.div>

          {/* Endpoints */}
          <h2 className="font-display text-2xl font-bold mb-6">Endpoints</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground">Method</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Endpoint</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Description</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Auth</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoints.map((ep, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          ep.method === 'GET' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
                        }`}>{ep.method}</span>
                      </td>
                      <td className="p-4 font-mono text-foreground">{ep.path}</td>
                      <td className="p-4 text-muted-foreground">{ep.desc}</td>
                      <td className="p-4">{ep.auth ? <Key className="w-4 h-4 text-primary" /> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl border border-primary/20 p-8">
            <h3 className="font-display text-xl font-bold mb-2">Rate Limits</h3>
            <p className="text-muted-foreground text-sm">Free: 100 req/min • Pro: 1,000 req/min • Enterprise: Unlimited. Contact us for higher limits.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApiDocumentation;
