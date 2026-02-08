import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Image as ImageIcon, X, Sparkles, Loader2, Send, Bot,
  TrendingUp, TrendingDown, Target, Shield, BarChart3, Activity,
  AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight, Trash2, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface AnalysisResult {
  overview: {
    symbol: string;
    timeframe: string;
    market_structure: string;
    trend_strength: string;
  };
  recommendation: {
    action: string;
    confidence: number;
    entry_zone: string;
    stop_loss: string;
    take_profit_1: string;
    take_profit_2: string;
    take_profit_3: string;
    risk_reward: string;
  };
  patterns: Array<{
    name: string;
    type: string;
    confidence: number;
    description: string;
  }>;
  indicators: {
    rsi: { value: string; signal: string; interpretation: string };
    macd: { signal: string; interpretation: string };
    moving_averages: { signal: string; interpretation: string };
    volume: { signal: string; interpretation: string };
  };
  support_resistance: Array<{
    level: string;
    type: string;
    strength: string;
  }>;
  risk_assessment: {
    level: string;
    max_loss_percent: string;
    key_invalidation: string;
    catalysts: string[];
  };
  summary: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const TradingViewChartAI = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [chartImage, setChartImage] = useState<string | null>(null);
  
  // Chat state for follow-ups
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedImage(dataUrl);
      setImageBase64(dataUrl.split(',')[1]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) { handleFileSelect(file); e.preventDefault(); }
        }
      }
    }
  }, [handleFileSelect]);

  const analyzeChart = async () => {
    if (!imageBase64) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    setShowChat(false);
    setChatMessages([]);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          mode: 'structured',
          messages: [{ role: 'user', content: 'Analyze this chart screenshot in detail.', imageBase64 }],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data);
      setChartImage(uploadedImage);
      toast.success('Chart analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze chart');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim(), timestamp: new Date() };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput('');
    setIsChatLoading(true);
    setStreamingContent('');

    try {
      const apiMessages = [
        { role: 'user', content: `Previous analysis: ${JSON.stringify(analysis)}`, imageBase64 },
        ...newMessages.map(m => ({ role: m.role, content: m.content })),
      ];

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ mode: 'chat', messages: apiMessages }),
      });

      if (!response.ok) throw new Error('Chat failed');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) { fullContent += content; setStreamingContent(fullContent); }
          } catch { textBuffer = line + '\n' + textBuffer; break; }
        }
      }

      setChatMessages(prev => [...prev, { role: 'assistant', content: fullContent, timestamp: new Date() }]);
      setStreamingContent('');
    } catch (error) {
      toast.error('Failed to get response');
    } finally {
      setIsChatLoading(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setUploadedImage(null);
    setImageBase64(null);
    setChartImage(null);
    setShowChat(false);
    setChatMessages([]);
  };

  const getActionColor = (action: string) => {
    if (action?.toUpperCase().includes('BUY')) return 'text-accent bg-accent/10 border-accent/30';
    if (action?.toUpperCase().includes('SELL')) return 'text-destructive bg-destructive/10 border-destructive/30';
    return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
  };

  const getActionIcon = (action: string) => {
    if (action?.toUpperCase().includes('BUY')) return <TrendingUp className="w-6 h-6" />;
    if (action?.toUpperCase().includes('SELL')) return <TrendingDown className="w-6 h-6" />;
    return <Activity className="w-6 h-6" />;
  };

  const getRiskColor = (level: string) => {
    if (level?.toLowerCase().includes('low')) return 'text-accent';
    if (level?.toLowerCase().includes('high')) return 'text-destructive';
    return 'text-yellow-400';
  };

  const getPatternColor = (type: string) => {
    if (type?.toLowerCase().includes('bullish')) return 'bg-accent/10 text-accent border-accent/20';
    if (type?.toLowerCase().includes('bearish')) return 'bg-destructive/10 text-destructive border-destructive/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  // Upload state (no analysis yet)
  if (!analysis) {
    return (
      <div
        className="space-y-6"
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onPaste={handlePaste}
      >
        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative bg-card rounded-2xl border-2 border-dashed transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border'
          } p-12`}
        >
          {uploadedImage ? (
            <div className="flex flex-col items-center gap-6">
              <div className="relative max-w-2xl w-full">
                <img src={uploadedImage} alt="Chart" className="w-full rounded-xl border border-border" />
                <button
                  onClick={() => { setUploadedImage(null); setImageBase64(null); }}
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Button variant="hero" size="lg" onClick={analyzeChart} disabled={isAnalyzing} className="gap-2 px-8">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Chart...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze with AI
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <ImageIcon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Upload a Chart Screenshot</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Take a screenshot of any TradingView chart. The AI will analyze patterns, indicators, and provide a structured trade setup.
              </p>
              <div className="flex gap-3">
                <Button variant="hero" onClick={() => fileInputRef.current?.click()} className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Screenshot
                </Button>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                  📋 Paste (Ctrl+V)
                </Button>
              </div>
            </div>
          )}
          <input
            type="file" ref={fileInputRef} className="hidden" accept="image/*"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ''; }}
          />
        </motion.div>

        {isAnalyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {['Detecting chart patterns...', 'Reading technical indicators...', 'Analyzing price action...', 'Generating trade setup...'].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.8 }}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Loader2 className="w-4 h-4 text-primary" />
                </motion.div>
                {step}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    );
  }

  // Analysis Dashboard
  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-accent" />
          <span className="font-medium text-accent">Analysis Complete</span>
          {analysis.overview?.symbol && (
            <span className="px-3 py-1 rounded-lg bg-muted text-sm font-bold">
              {analysis.overview.symbol}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowChat(!showChat)} className="gap-2">
            <MessageCircle className="w-4 h-4" />
            {showChat ? 'Hide Chat' : 'Ask Follow-up'}
          </Button>
          <Button variant="ghost" size="sm" onClick={resetAnalysis} className="gap-2">
            <Trash2 className="w-4 h-4" />
            New Analysis
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chart + Recommendation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recommendation Card - Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-6 ${getActionColor(analysis.recommendation?.action)}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getActionIcon(analysis.recommendation?.action)}
                <div>
                  <h2 className="text-2xl font-bold">{analysis.recommendation?.action || 'HOLD'}</h2>
                  <p className="text-sm opacity-75">AI Recommendation</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{analysis.recommendation?.confidence || 0}%</div>
                <p className="text-sm opacity-75">Confidence</p>
              </div>
            </div>
            <p className="text-sm opacity-90">{analysis.summary}</p>
          </motion.div>

          {/* Trade Setup Grid */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Trade Setup
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">Entry Zone</p>
                <p className="font-bold text-primary">{analysis.recommendation?.entry_zone || '—'}</p>
              </div>
              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <p className="text-xs text-muted-foreground mb-1">Stop Loss</p>
                <p className="font-bold text-destructive">{analysis.recommendation?.stop_loss || '—'}</p>
              </div>
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                <p className="text-xs text-muted-foreground mb-1">Take Profit 1</p>
                <p className="font-bold text-accent">{analysis.recommendation?.take_profit_1 || '—'}</p>
              </div>
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                <p className="text-xs text-muted-foreground mb-1">Take Profit 2</p>
                <p className="font-bold text-accent">{analysis.recommendation?.take_profit_2 || '—'}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Risk:Reward</span>
              <span className="font-bold text-primary">{analysis.recommendation?.risk_reward || '—'}</span>
              <span className="text-muted-foreground">TP3</span>
              <span className="font-bold text-accent">{analysis.recommendation?.take_profit_3 || '—'}</span>
            </div>
          </motion.div>

          {/* Chart Preview */}
          {chartImage && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-bold text-sm mb-3 text-muted-foreground">Analyzed Chart</h3>
              <img src={chartImage} alt="Analyzed chart" className="w-full rounded-xl border border-border" />
            </motion.div>
          )}

          {/* Patterns */}
          {analysis.patterns && analysis.patterns.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Detected Patterns
              </h3>
              <div className="space-y-3">
                {analysis.patterns.map((pattern, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${getPatternColor(pattern.type)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">{pattern.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-background/50">{pattern.confidence}% confidence</span>
                    </div>
                    <p className="text-sm opacity-75">{pattern.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Indicators + Risk + S/R */}
        <div className="space-y-6">
          {/* Overview Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Overview
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Symbol', value: analysis.overview?.symbol },
                { label: 'Timeframe', value: analysis.overview?.timeframe },
                { label: 'Structure', value: analysis.overview?.market_structure },
                { label: 'Trend', value: analysis.overview?.trend_strength },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-sm">{item.value || '—'}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Indicators */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Technical Indicators
            </h3>
            <div className="space-y-4">
              {analysis.indicators && Object.entries(analysis.indicators).map(([key, val], i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase">{key.replace('_', ' ')}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {(val as any)?.signal || (val as any)?.value || '—'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{(val as any)?.interpretation || ''}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Support & Resistance */}
          {analysis.support_resistance && analysis.support_resistance.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Support & Resistance
              </h3>
              <div className="space-y-2">
                {analysis.support_resistance.map((sr, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-2">
                      {sr.type === 'resistance' ? (
                        <ArrowUpRight className="w-4 h-4 text-destructive" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-accent" />
                      )}
                      <span className="text-sm capitalize">{sr.type}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm">{sr.level}</span>
                      <span className="text-xs text-muted-foreground ml-2 capitalize">{sr.strength}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Risk Assessment */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Risk Assessment
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk Level</span>
                <span className={`font-bold ${getRiskColor(analysis.risk_assessment?.level)}`}>
                  {analysis.risk_assessment?.level || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Max Loss</span>
                <span className="font-bold text-destructive">{analysis.risk_assessment?.max_loss_percent || '—'}</span>
              </div>
              {analysis.risk_assessment?.key_invalidation && (
                <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3 h-3 text-destructive" />
                    <span className="text-xs font-bold text-destructive">Invalidation</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{analysis.risk_assessment.key_invalidation}</p>
                </div>
              )}
              {analysis.risk_assessment?.catalysts && analysis.risk_assessment.catalysts.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground">Catalysts</span>
                  {analysis.risk_assessment.catalysts.map((c, i) => (
                    <div key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Follow-up Chat */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Ask AI about this analysis</h3>
            </div>
            <div className="max-h-80 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {streamingContent && (
                <div className="flex gap-3">
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted/50">
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{streamingContent}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
              {isChatLoading && !streamingContent && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thinking...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Challenge the prediction, ask why, or request alternatives..."
                className="flex-1 px-4 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:outline-none text-sm"
              />
              <Button variant="hero" size="icon" onClick={sendChatMessage} disabled={isChatLoading || !chatInput.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TradingViewChartAI;
