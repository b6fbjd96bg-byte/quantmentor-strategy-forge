import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Loader2, 
  AlertTriangle,
  Target,
  Shield,
  BarChart3,
  Activity,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface AnalysisResult {
  recommendation: "BUY" | "SELL" | "HOLD";
  confidence: "Low" | "Medium" | "High";
  summary: string;
  reasons: string[];
  technicalPatterns?: string[];
  riskFactors?: string[];
  supportLevel?: string;
  resistanceLevel?: string;
  stopLoss?: string;
  targetPrice?: string;
  timeframe?: string;
  oiAnalysis?: string;
  marketSentiment?: "Bullish" | "Bearish" | "Neutral";
  rawAnalysis?: string;
}

interface CurrentPosition {
  type: "LONG" | "SHORT";
  entryPrice: string;
  quantity?: string;
}

const AIStockAnalyzer = () => {
  const [symbol, setSymbol] = useState("");
  const [assetType, setAssetType] = useState("Stock");
  const [hasPosition, setHasPosition] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<CurrentPosition>({
    type: "LONG",
    entryPrice: "",
    quantity: ""
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleAnalyze = async () => {
    if (!symbol.trim()) {
      toast.error("Please enter a symbol");
      return;
    }

    if (hasPosition && !currentPosition.entryPrice) {
      toast.error("Please enter your entry price");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-stock', {
        body: {
          symbol: symbol.toUpperCase().trim(),
          assetType,
          currentPosition: hasPosition ? currentPosition : null
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setAnalysis(data.analysis);
      toast.success(`Analysis complete for ${symbol.toUpperCase()}`);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Failed to analyze. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRecommendationStyle = (rec: string) => {
    switch (rec) {
      case "BUY":
        return {
          bg: "bg-emerald-500/20",
          border: "border-emerald-500/50",
          text: "text-emerald-400",
          icon: TrendingUp,
          gradient: "from-emerald-500/20 to-emerald-500/5"
        };
      case "SELL":
        return {
          bg: "bg-red-500/20",
          border: "border-red-500/50",
          text: "text-red-400",
          icon: TrendingDown,
          gradient: "from-red-500/20 to-red-500/5"
        };
      default:
        return {
          bg: "bg-amber-500/20",
          border: "border-amber-500/50",
          text: "text-amber-400",
          icon: Minus,
          gradient: "from-amber-500/20 to-amber-500/5"
        };
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "High": return "text-emerald-400 bg-emerald-500/20";
      case "Medium": return "text-amber-400 bg-amber-500/20";
      default: return "text-red-400 bg-red-500/20";
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Bullish": return "text-emerald-400";
      case "Bearish": return "text-red-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          AI Stock Analyzer
          <Badge variant="outline" className="ml-auto text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered by AI
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Symbol</Label>
              <Input
                placeholder="e.g., BTC, AAPL, ETH"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="bg-background/50 border-border/50 h-10"
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Asset Type</Label>
              <Select value={assetType} onValueChange={setAssetType}>
                <SelectTrigger className="bg-background/50 border-border/50 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Stock">Stock</SelectItem>
                  <SelectItem value="Crypto">Crypto</SelectItem>
                  <SelectItem value="Forex">Forex</SelectItem>
                  <SelectItem value="Commodity">Commodity</SelectItem>
                  <SelectItem value="Index">Index</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Existing Position Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/30">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">I have an existing position</Label>
              <p className="text-xs text-muted-foreground">Get tailored hold/exit advice</p>
            </div>
            <Switch checked={hasPosition} onCheckedChange={setHasPosition} />
          </div>

          {/* Position Details */}
          <AnimatePresence>
            {hasPosition && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Position</Label>
                    <Select 
                      value={currentPosition.type} 
                      onValueChange={(v) => setCurrentPosition(prev => ({ ...prev, type: v as "LONG" | "SHORT" }))}
                    >
                      <SelectTrigger className="bg-background/50 border-border/50 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LONG">Long</SelectItem>
                        <SelectItem value="SHORT">Short</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Entry Price</Label>
                    <Input
                      placeholder="100.50"
                      value={currentPosition.entryPrice}
                      onChange={(e) => setCurrentPosition(prev => ({ ...prev, entryPrice: e.target.value }))}
                      className="bg-background/50 border-border/50 h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Qty (optional)</Label>
                    <Input
                      placeholder="10"
                      value={currentPosition.quantity}
                      onChange={(e) => setCurrentPosition(prev => ({ ...prev, quantity: e.target.value }))}
                      className="bg-background/50 border-border/50 h-9"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !symbol.trim()}
            className="w-full h-11 bg-primary hover:bg-primary/90"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing {symbol}...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analyze {symbol || "Symbol"}
              </>
            )}
          </Button>
        </div>

        {/* Analysis Result */}
        <AnimatePresence mode="wait">
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Main Recommendation Card */}
              {(() => {
                const style = getRecommendationStyle(analysis.recommendation);
                const Icon = style.icon;
                return (
                  <div className={`relative p-4 rounded-xl border ${style.border} bg-gradient-to-br ${style.gradient} overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="flex items-start justify-between relative">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${style.bg}`}>
                            <Icon className={`h-5 w-5 ${style.text}`} />
                          </div>
                          <div>
                            <h3 className={`text-2xl font-bold ${style.text}`}>
                              {analysis.recommendation}
                            </h3>
                            <p className="text-xs text-muted-foreground">{symbol.toUpperCase()} • {assetType}</p>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80 max-w-[280px]">
                          {analysis.summary}
                        </p>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <Badge className={getConfidenceColor(analysis.confidence)}>
                          {analysis.confidence} Confidence
                        </Badge>
                        {analysis.marketSentiment && (
                          <p className={`text-xs ${getSentimentColor(analysis.marketSentiment)}`}>
                            {analysis.marketSentiment} Sentiment
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                {analysis.targetPrice && (
                  <div className="p-3 rounded-lg bg-background/30 border border-border/30">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Target className="h-3 w-3" />
                      Target
                    </div>
                    <p className="text-sm font-semibold text-emerald-400">{analysis.targetPrice}</p>
                  </div>
                )}
                {analysis.stopLoss && (
                  <div className="p-3 rounded-lg bg-background/30 border border-border/30">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Shield className="h-3 w-3" />
                      Stop Loss
                    </div>
                    <p className="text-sm font-semibold text-red-400">{analysis.stopLoss}</p>
                  </div>
                )}
                {analysis.supportLevel && (
                  <div className="p-3 rounded-lg bg-background/30 border border-border/30">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <BarChart3 className="h-3 w-3" />
                      Support
                    </div>
                    <p className="text-sm font-semibold">{analysis.supportLevel}</p>
                  </div>
                )}
                {analysis.resistanceLevel && (
                  <div className="p-3 rounded-lg bg-background/30 border border-border/30">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Activity className="h-3 w-3" />
                      Resistance
                    </div>
                    <p className="text-sm font-semibold">{analysis.resistanceLevel}</p>
                  </div>
                )}
              </div>

              {/* Key Reasons */}
              {analysis.reasons && analysis.reasons.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Key Reasons
                  </h4>
                  <ul className="space-y-1.5">
                    {analysis.reasons.slice(0, 4).map((reason, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Expandable Details */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-xs text-muted-foreground hover:text-foreground"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show More Details
                  </>
                )}
              </Button>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Technical Patterns */}
                    {analysis.technicalPatterns && analysis.technicalPatterns.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Chart Patterns Identified</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.technicalPatterns.map((pattern, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {pattern}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* OI Analysis */}
                    {analysis.oiAnalysis && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          Open Interest Analysis
                        </h4>
                        <p className="text-xs text-muted-foreground bg-background/30 p-3 rounded-lg">
                          {analysis.oiAnalysis}
                        </p>
                      </div>
                    )}

                    {/* Risk Factors */}
                    {analysis.riskFactors && analysis.riskFactors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2 text-amber-400">
                          <AlertTriangle className="h-4 w-4" />
                          Risk Factors
                        </h4>
                        <ul className="space-y-1.5">
                          {analysis.riskFactors.map((risk, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-amber-400 mt-0.5">⚠</span>
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Timeframe */}
                    {analysis.timeframe && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Suggested Timeframe:</span>
                        <Badge variant="outline">{analysis.timeframe}</Badge>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Disclaimer */}
              <p className="text-[10px] text-muted-foreground/60 text-center pt-2 border-t border-border/30">
                AI-generated analysis for educational purposes only. Not financial advice. Always do your own research.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default AIStockAnalyzer;
