import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  RefreshCw,
  Scale,
  Activity,
  Eye,
  Database,
  Cpu,
  Clock
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const CapitalAllocationMethodology = () => {
  const allocationFactors = [
    { 
      factor: "Risk-Adjusted Returns", 
      weight: "30%", 
      description: "Sharpe and Sortino ratios measuring return per unit of risk taken. Strategies with higher risk-adjusted returns receive more capital." 
    },
    { 
      factor: "Drawdown Stability", 
      weight: "25%", 
      description: "Historical drawdown patterns and recovery times. Strategies with smaller, shorter drawdowns are preferred." 
    },
    { 
      factor: "Recent Performance", 
      weight: "15%", 
      description: "Rolling 30-day and 60-day performance to detect performance decay. Declining strategies have allocation reduced." 
    },
    { 
      factor: "Strategy Correlation", 
      weight: "15%", 
      description: "Correlation with other portfolio strategies. Lower correlation strategies help diversify risk." 
    },
    { 
      factor: "Market Regime Fit", 
      weight: "10%", 
      description: "How well the strategy performs in current market conditions (trending, ranging, volatile)." 
    },
    { 
      factor: "Execution Quality", 
      weight: "5%", 
      description: "Fill rates, slippage, and timing accuracy. Poor execution reduces effective allocation." 
    }
  ];

  const riskControls = [
    {
      name: "Volatility-Based Exposure",
      icon: <Activity className="h-5 w-5" />,
      description: "When market volatility (VIX) spikes above threshold, overall portfolio exposure is automatically reduced by 10-30% depending on severity."
    },
    {
      name: "Strategy Breach Protocol",
      icon: <AlertTriangle className="h-5 w-5" />,
      description: "Any strategy exceeding its maximum drawdown limit is immediately paused and its allocation redistributed to remaining qualified strategies."
    },
    {
      name: "Profile-Based Limits",
      icon: <Shield className="h-5 w-5" />,
      description: "Each risk profile has strict limits for maximum single-strategy allocation, total drawdown, and volatility exposure."
    },
    {
      name: "Correlation Monitoring",
      icon: <Layers className="h-5 w-5" />,
      description: "Real-time correlation tracking between strategies. If correlation increases significantly, diversification is restored through rebalancing."
    }
  ];

  const qualificationProcess = [
    {
      step: "1",
      title: "Live Performance Verification",
      description: "Strategy must have at least 90 days of verified live trading history with auditable trade records. Paper trading does not qualify.",
      criteria: ["90+ days live trading", "Verified trade records", "Real capital deployed"]
    },
    {
      step: "2",
      title: "Risk Metrics Analysis",
      description: "Comprehensive analysis of risk-adjusted metrics to ensure the strategy meets institutional-grade standards.",
      criteria: ["Sharpe ratio > 1.5", "Max drawdown < 25%", "Win rate > 45%"]
    },
    {
      step: "3",
      title: "Execution Quality Audit",
      description: "Analysis of trade execution quality including fill rates, slippage, and timing accuracy.",
      criteria: ["Fill rate > 85%", "Avg slippage < 0.5%", "Consistent execution"]
    },
    {
      step: "4",
      title: "Ongoing Monitoring",
      description: "Continuous monitoring ensures strategies maintain qualification standards. Underperforming strategies are disqualified.",
      criteria: ["Daily performance review", "Weekly risk assessment", "Monthly requalification"]
    }
  ];

  const feeDetails = [
    {
      type: "Platform Fee",
      rate: "1.0% annually",
      calculation: "Calculated daily on assets under management and deducted monthly.",
      example: "On $10,000 allocation: ~$8.33/month"
    },
    {
      type: "Performance Fee",
      rate: "15% of profits",
      calculation: "Only charged on profits above your high-water mark. Losses must be recovered before new fees apply.",
      example: "If you profit $1,000 above HWM: $150 fee"
    },
    {
      type: "High-Water Mark",
      rate: "Lifetime",
      calculation: "Your highest portfolio value is recorded. Performance fees only apply to profits exceeding this level.",
      example: "Protects you from paying fees on the same profits twice"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm border-primary/30 bg-primary/5">
              <Eye className="h-3 w-3 mr-2 inline" />
              Full Transparency
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Our Methodology
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Understand exactly how we allocate capital, manage risk, and select strategies. 
              No black boxes—complete transparency in our approach.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Allocation Methodology */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h2 className="text-3xl font-bold mb-4">Capital Allocation Model</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our allocation algorithm considers multiple factors to optimize risk-adjusted returns while maintaining diversification.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-background/50 border-border/50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {allocationFactors.map((factor, index) => (
                    <motion.div
                      key={factor.factor}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-primary">{factor.weight}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{factor.factor}</h3>
                        <p className="text-sm text-muted-foreground">{factor.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 p-6 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-4">
                <Cpu className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-2">Algorithmic Rebalancing</h4>
                  <p className="text-sm text-muted-foreground">
                    Allocations are recalculated daily using the weighted factor model above. Changes are 
                    executed gradually to minimize market impact. Conservative profiles rebalance weekly, 
                    while aggressive profiles rebalance daily or in real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategy Qualification */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h2 className="text-3xl font-bold mb-4">Strategy Qualification Process</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every strategy must pass our rigorous qualification process before receiving any capital allocation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {qualificationProcess.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card/50 border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-primary/20 mb-4">{step.step}</div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                    <div className="space-y-2">
                      {step.criteria.map((criterion, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span>{criterion}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Control System */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h2 className="text-3xl font-bold mb-4">Risk Control System</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Multiple layers of automated risk controls protect your capital at all times.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {riskControls.map((control, index) => (
              <motion.div
                key={control.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-background/50 border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-500">
                        {control.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{control.name}</h3>
                        <p className="text-sm text-muted-foreground">{control.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee Structure Detail */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h2 className="text-3xl font-bold mb-4">Fee Structure Explained</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We believe in transparent, fair fees aligned with your success.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {feeDetails.map((fee, index) => (
              <motion.div
                key={fee.type}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">{fee.type}</CardTitle>
                    <Badge variant="outline" className="w-fit bg-primary/5 border-primary/30">
                      {fee.rate}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{fee.calculation}</p>
                    <div className="p-3 rounded-lg bg-muted/50 text-xs">
                      <span className="font-medium">Example: </span>
                      <span className="text-muted-foreground">{fee.example}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Disclaimers */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-background border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-3">Important Risk Disclosures</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        <strong>No Guaranteed Returns:</strong> The target returns mentioned are based on historical 
                        performance and are not guaranteed. Past performance does not indicate future results.
                      </p>
                      <p>
                        <strong>Capital at Risk:</strong> Trading and investing carry significant risk. You may 
                        lose some or all of your invested capital. Only invest what you can afford to lose.
                      </p>
                      <p>
                        <strong>Not Financial Advice:</strong> This platform provides algorithmic trading services, 
                        not personalized financial advice. Consult a qualified financial advisor for personal guidance.
                      </p>
                      <p>
                        <strong>Algorithm Limitations:</strong> While our algorithms are designed to optimize returns 
                        and manage risk, no system can predict all market conditions or prevent all losses.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Now that you understand our methodology, start allocating your capital with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/capital-allocation/start">
                <Button size="lg" className="px-8">
                  Start Allocating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/capital-allocation">
                <Button size="lg" variant="outline" className="px-8">
                  Back to Overview
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CapitalAllocationMethodology;
