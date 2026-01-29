import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  TrendingUp, 
  PieChart, 
  Lock, 
  BarChart3, 
  Zap,
  ArrowRight,
  Check,
  AlertTriangle,
  Target,
  Layers,
  RefreshCw
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const CapitalAllocation = () => {
  const features = [
    {
      icon: <PieChart className="h-6 w-6" />,
      title: "Dynamic Allocation",
      description: "Capital is distributed across verified strategies based on real-time risk-adjusted performance metrics."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Capital Preservation",
      description: "Automated risk controls reduce exposure during volatility spikes and remove underperforming strategies."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Institutional Analytics",
      description: "Hedge-fund grade performance metrics including Sharpe ratio, Sortino ratio, and drawdown analysis."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Strategy Qualification",
      description: "Only strategies meeting strict criteria receive capital: live history, max drawdown, execution quality."
    },
    {
      icon: <RefreshCw className="h-6 w-6" />,
      title: "Continuous Optimization",
      description: "Allocations are rebalanced daily/weekly to maximize risk-adjusted returns and minimize correlation."
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Your Funds, Your Control",
      description: "Non-custodial architecture. Your capital stays in your brokerage account at all times."
    }
  ];

  const qualificationCriteria = [
    { metric: "Live Trading History", requirement: "90+ days verified performance" },
    { metric: "Maximum Drawdown", requirement: "< 15% for conservative, < 25% for aggressive" },
    { metric: "Sharpe Ratio", requirement: "> 1.5 risk-adjusted return score" },
    { metric: "Execution Quality", requirement: "> 85% fill rate at expected prices" },
    { metric: "Slippage Score", requirement: "< 0.5% average slippage per trade" }
  ];

  const riskProfiles = [
    {
      name: "Conservative",
      targetReturn: "8-12%",
      maxDrawdown: "8%",
      description: "Focus on capital preservation with steady, consistent returns.",
      color: "from-emerald-500/20 to-emerald-600/5"
    },
    {
      name: "Balanced",
      targetReturn: "15-22%",
      maxDrawdown: "15%",
      description: "Optimal blend of growth and protection for most investors.",
      color: "from-cyan-500/20 to-cyan-600/5"
    },
    {
      name: "Aggressive",
      targetReturn: "25-40%",
      maxDrawdown: "25%",
      description: "Maximum growth potential with higher volatility tolerance.",
      color: "from-violet-500/20 to-violet-600/5"
    }
  ];

  const feeStructure = [
    { type: "Platform Fee", rate: "1.0%", description: "Annual fee on assets under management" },
    { type: "Performance Fee", rate: "15%", description: "On profits above high-water mark only" },
    { type: "Withdrawal Fee", rate: "0%", description: "No fees for standard withdrawals" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm border-primary/30 bg-primary/5">
              <Zap className="h-3 w-3 mr-2 inline" />
              Institutional-Grade Capital Intelligence
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/60">
              Capital Allocation
              <span className="block text-primary">Engine</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Hedge-fund grade capital rotation for everyone. Your capital is dynamically 
              allocated across verified strategies—no manual selection, no emotional decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/capital-allocation/start">
                <Button size="lg" className="px-8 py-6 text-lg group">
                  Start Allocating
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/capital-allocation/methodology">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                  View Methodology
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Past performance does not guarantee future results. Capital at risk.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A systematic approach to capital deployment that removes guesswork and emotional bias.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Select Risk Profile", desc: "Choose Conservative, Balanced, or Aggressive based on your goals." },
              { step: "02", title: "Deposit Capital", desc: "Fund your account with your preferred amount and optional lock-in period." },
              { step: "03", title: "Automatic Allocation", desc: "Our engine distributes capital across qualified strategies." },
              { step: "04", title: "Track Performance", desc: "Monitor returns, risk metrics, and allocation changes in real-time." }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-background/50 border-border/50 hover:border-primary/30 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Intelligent Capital Management</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built on the same principles used by institutional investors and hedge funds.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full bg-card/50 border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/20 transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Risk Profiles */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Risk Profile</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each profile is optimized for different investment objectives and risk tolerances.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {riskProfiles.map((profile, index) => (
              <motion.div
                key={profile.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`h-full border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden`}>
                  <div className={`h-2 bg-gradient-to-r ${profile.color}`} />
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{profile.name}</h3>
                    <p className="text-muted-foreground mb-6">{profile.description}</p>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-muted-foreground text-sm">Target Annual Return</span>
                        <span className="font-semibold text-primary">{profile.targetReturn}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground text-sm">Max Drawdown Limit</span>
                        <span className="font-semibold">{profile.maxDrawdown}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategy Qualification */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp}>
              <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-primary/30 bg-primary/5">
                <Layers className="h-3 w-3 mr-2 inline" />
                Strategy Qualification
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Only the Best Strategies Receive Capital
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Every strategy must pass rigorous qualification criteria before receiving 
                any capital allocation. Underperforming strategies are automatically 
                disqualified and removed from the pool.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This systematic approach ensures your capital is only deployed to 
                strategies with proven track records and consistent execution quality.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Qualification Criteria
                  </h3>
                  <div className="space-y-4">
                    {qualificationCriteria.map((criteria, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                        <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">{criteria.metric}</div>
                          <div className="text-muted-foreground text-xs">{criteria.requirement}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Fee Structure */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Transparent Fee Structure</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We succeed when you succeed. Performance fees are only charged on profits above your high-water mark.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Card className="bg-background/50 border-border/50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {feeStructure.map((fee, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-card/50 hover:bg-card transition-colors">
                      <div>
                        <div className="font-medium">{fee.type}</div>
                        <div className="text-muted-foreground text-sm">{fee.description}</div>
                      </div>
                      <div className="text-2xl font-bold text-primary">{fee.rate}</div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-muted-foreground text-sm mt-6">
                  * High-water mark ensures you never pay performance fees on the same profits twice.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Deploy Your Capital Intelligently?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join traders who trust our systematic approach to capital allocation. 
              Start with any amount and see how institutional-grade intelligence works.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/capital-allocation/start">
                <Button size="lg" className="px-8 py-6 text-lg group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/capital-allocation/dashboard">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                  View Demo Dashboard
                </Button>
              </Link>
            </div>
            
            <p className="text-xs text-muted-foreground mt-8 max-w-xl mx-auto">
              This is not financial advice. Trading involves significant risk of loss. 
              Past performance is not indicative of future results. Only invest what you can afford to lose.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CapitalAllocation;
