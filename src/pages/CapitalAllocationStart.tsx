import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  TrendingUp, 
  Zap,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  Lock,
  Calendar,
  DollarSign,
  PieChart,
  Target
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type RiskProfile = "conservative" | "balanced" | "aggressive";

interface RiskProfileData {
  name: string;
  icon: JSX.Element;
  targetReturn: string;
  maxDrawdown: string;
  description: string;
  color: string;
  borderColor: string;
  features: string[];
}

const riskProfiles: Record<RiskProfile, RiskProfileData> = {
  conservative: {
    name: "Conservative",
    icon: <Shield className="h-8 w-8" />,
    targetReturn: "8-12%",
    maxDrawdown: "8%",
    description: "Capital preservation focused. Lower volatility strategies with steady, consistent returns.",
    color: "from-emerald-500/20 to-emerald-600/10",
    borderColor: "border-emerald-500/50",
    features: ["Lower volatility exposure", "Diversified across 8-12 strategies", "Weekly rebalancing", "Auto-reduce during high volatility"]
  },
  balanced: {
    name: "Balanced",
    icon: <TrendingUp className="h-8 w-8" />,
    targetReturn: "15-22%",
    maxDrawdown: "15%",
    description: "Optimal risk-reward balance. Suitable for most investors seeking growth with protection.",
    color: "from-cyan-500/20 to-cyan-600/10",
    borderColor: "border-cyan-500/50",
    features: ["Moderate volatility tolerance", "Diversified across 6-10 strategies", "Daily rebalancing", "Dynamic risk adjustment"]
  },
  aggressive: {
    name: "Aggressive",
    icon: <Zap className="h-8 w-8" />,
    targetReturn: "25-40%",
    maxDrawdown: "25%",
    description: "Maximum growth potential. Higher volatility tolerance for experienced investors.",
    color: "from-violet-500/20 to-violet-600/10",
    borderColor: "border-violet-500/50",
    features: ["Higher volatility exposure", "Concentrated 4-8 top strategies", "Real-time rebalancing", "Momentum-focused allocation"]
  }
};

const lockInOptions = [
  { days: 0, label: "No Lock-in", bonus: "0%", description: "Withdraw anytime" },
  { days: 30, label: "30 Days", bonus: "0.1%", description: "Fee reduction" },
  { days: 90, label: "90 Days", bonus: "0.25%", description: "Fee reduction" },
  { days: 180, label: "180 Days", bonus: "0.5%", description: "Fee reduction" }
];

const CapitalAllocationStart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState<RiskProfile>("balanced");
  const [capitalAmount, setCapitalAmount] = useState<string>("10000");
  const [lockInDays, setLockInDays] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to start allocating capital.",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      const lockEndDate = lockInDays > 0 
        ? new Date(Date.now() + lockInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from("capital_allocations")
        .insert({
          user_id: user.id,
          risk_profile: selectedProfile,
          capital_amount: parseFloat(capitalAmount),
          current_value: parseFloat(capitalAmount),
          high_water_mark: parseFloat(capitalAmount),
          lock_in_days: lockInDays || null,
          lock_end_date: lockEndDate,
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Allocation Created!",
        description: "Your capital allocation is being processed. You'll be redirected to your dashboard."
      });

      navigate("/capital-allocation/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create allocation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const profile = riskProfiles[selectedProfile];
  const capitalNum = parseFloat(capitalAmount) || 0;
  const platformFee = capitalNum * 0.01;
  const lockInBonus = lockInOptions.find(l => l.days === lockInDays)?.bonus || "0%";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <motion.div 
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    s < step 
                      ? "bg-primary text-primary-foreground" 
                      : s === step 
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
                        : "bg-muted text-muted-foreground"
                  }`}
                  animate={{ scale: s === step ? 1.1 : 1 }}
                >
                  {s < step ? <Check className="h-5 w-5" /> : s}
                </motion.div>
                {s < 3 && (
                  <div className={`h-0.5 w-16 ${s < step ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Risk Profile Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <Badge variant="outline" className="mb-4 px-3 py-1 border-primary/30 bg-primary/5">
                    Step 1 of 3
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">Select Your Risk Profile</h1>
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    Choose the risk level that matches your investment goals and tolerance.
                  </p>
                </div>

                <RadioGroup
                  value={selectedProfile}
                  onValueChange={(value) => setSelectedProfile(value as RiskProfile)}
                  className="grid md:grid-cols-3 gap-4"
                >
                  {(Object.entries(riskProfiles) as [RiskProfile, RiskProfileData][]).map(([key, data]) => (
                    <motion.div
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Label htmlFor={key} className="cursor-pointer">
                        <Card 
                          className={`h-full transition-all duration-300 ${
                            selectedProfile === key 
                              ? `${data.borderColor} border-2 bg-gradient-to-b ${data.color}` 
                              : "border-border/50 hover:border-border"
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className={`p-3 rounded-xl ${selectedProfile === key ? "bg-background/50" : "bg-muted"}`}>
                                {data.icon}
                              </div>
                              <RadioGroupItem value={key} id={key} />
                            </div>
                            
                            <h3 className="text-xl font-bold mb-2">{data.name}</h3>
                            <p className="text-muted-foreground text-sm mb-4">{data.description}</p>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Target Return</span>
                                <span className="font-semibold text-primary">{data.targetReturn}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Max Drawdown</span>
                                <span className="font-semibold">{data.maxDrawdown}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>

                {/* Selected Profile Features */}
                <motion.div 
                  className="mt-8"
                  key={selectedProfile}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        {profile.name} Profile Features
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {profile.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-emerald-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <div className="flex justify-end mt-8">
                  <Button size="lg" onClick={() => setStep(2)} className="px-8">
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Capital Amount & Lock-in */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <Badge variant="outline" className="mb-4 px-3 py-1 border-primary/30 bg-primary/5">
                    Step 2 of 3
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">Configure Your Allocation</h1>
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    Set your capital amount and optional lock-in period for fee benefits.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Capital Amount */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Capital Amount
                      </CardTitle>
                      <CardDescription>Enter the amount you want to allocate</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
                        <Input
                          type="number"
                          value={capitalAmount}
                          onChange={(e) => setCapitalAmount(e.target.value)}
                          className="pl-8 text-2xl font-bold h-14"
                          min="100"
                          step="100"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Quick Select</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {["1000", "5000", "10000", "25000"].map((amount) => (
                            <Button
                              key={amount}
                              variant={capitalAmount === amount ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCapitalAmount(amount)}
                            >
                              ${parseInt(amount).toLocaleString()}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Slider
                        value={[parseFloat(capitalAmount) || 0]}
                        onValueChange={([value]) => setCapitalAmount(value.toString())}
                        min={100}
                        max={100000}
                        step={100}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>$100</span>
                        <span>$100,000</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lock-in Period */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                        Lock-in Period
                      </CardTitle>
                      <CardDescription>Optional commitment for fee reductions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={lockInDays.toString()}
                        onValueChange={(value) => setLockInDays(parseInt(value))}
                        className="space-y-3"
                      >
                        {lockInOptions.map((option) => (
                          <Label
                            key={option.days}
                            htmlFor={`lock-${option.days}`}
                            className="cursor-pointer"
                          >
                            <div className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                              lockInDays === option.days 
                                ? "border-primary bg-primary/5" 
                                : "border-border/50 hover:border-border"
                            }`}>
                              <div className="flex items-center gap-3">
                                <RadioGroupItem value={option.days.toString()} id={`lock-${option.days}`} />
                                <div>
                                  <div className="font-medium">{option.label}</div>
                                  <div className="text-xs text-muted-foreground">{option.description}</div>
                                </div>
                              </div>
                              {option.bonus !== "0%" && (
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-0">
                                  -{option.bonus}
                                </Badge>
                              )}
                            </div>
                          </Label>
                        ))}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="outline" size="lg" onClick={() => setStep(1)} className="px-8">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                  <Button 
                    size="lg" 
                    onClick={() => setStep(3)} 
                    className="px-8"
                    disabled={capitalNum < 100}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review & Confirm */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <Badge variant="outline" className="mb-4 px-3 py-1 border-primary/30 bg-primary/5">
                    Step 3 of 3
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">Review & Confirm</h1>
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    Review your allocation settings before confirming.
                  </p>
                </div>

                <Card className="bg-card/50 border-border/50 max-w-2xl mx-auto">
                  <CardContent className="p-6 space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-background/50">
                        <div className="text-sm text-muted-foreground mb-1">Risk Profile</div>
                        <div className="font-semibold text-lg flex items-center gap-2">
                          {profile.icon}
                          {profile.name}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-background/50">
                        <div className="text-sm text-muted-foreground mb-1">Capital Amount</div>
                        <div className="font-semibold text-lg text-primary">
                          ${capitalNum.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-background/50">
                        <div className="text-sm text-muted-foreground mb-1">Lock-in Period</div>
                        <div className="font-semibold text-lg">
                          {lockInDays > 0 ? `${lockInDays} Days` : "None"}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-background/50">
                        <div className="text-sm text-muted-foreground mb-1">Fee Reduction</div>
                        <div className="font-semibold text-lg text-emerald-500">
                          {lockInBonus}
                        </div>
                      </div>
                    </div>

                    {/* Fee Breakdown */}
                    <div className="p-4 rounded-lg border border-border/50">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-primary" />
                        Fee Breakdown (Annual)
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Platform Fee (1.0%)</span>
                          <span>${platformFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Performance Fee</span>
                          <span>15% of profits*</span>
                        </div>
                        <div className="pt-2 border-t border-border/50 flex justify-between font-medium">
                          <span>Lock-in Discount</span>
                          <span className="text-emerald-500">-{lockInBonus}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        * Performance fee only applies to profits above your high-water mark.
                      </p>
                    </div>

                    {/* Risk Warning */}
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-500 mb-1">Important Risk Notice</p>
                          <p className="text-muted-foreground">
                            Trading involves significant risk of loss. Past performance does not guarantee 
                            future results. Only allocate capital you can afford to lose. Target returns 
                            are not guaranteed.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Terms */}
                    <p className="text-xs text-muted-foreground text-center">
                      By clicking "Confirm Allocation", you agree to our Terms of Service and 
                      acknowledge the risks involved in algorithmic trading.
                    </p>
                  </CardContent>
                </Card>

                <div className="flex justify-between mt-8 max-w-2xl mx-auto">
                  <Button variant="outline" size="lg" onClick={() => setStep(2)} className="px-8">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                  <Button 
                    size="lg" 
                    onClick={handleSubmit} 
                    className="px-8"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Lock className="mr-2 h-5 w-5" />
                        Confirm Allocation
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CapitalAllocationStart;
