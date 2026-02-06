import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Send, 
  TrendingUp, 
  TrendingDown,
  Bot,
  RefreshCw,
  ChevronDown,
  Maximize2,
  Minimize2,
  MessageCircle,
  Sparkles,
  Clock,
  BarChart3,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ASSET_TYPES = [
  { value: 'stock', label: 'Stocks', exchange: 'NASDAQ' },
  { value: 'crypto', label: 'Crypto', exchange: 'BINANCE' },
  { value: 'forex', label: 'Forex', exchange: 'FX' },
  { value: 'futures', label: 'Futures', exchange: 'CME' },
];

const TIMEFRAMES = [
  { value: '1', label: '1m' },
  { value: '5', label: '5m' },
  { value: '15', label: '15m' },
  { value: '60', label: '1H' },
  { value: '240', label: '4H' },
  { value: 'D', label: '1D' },
  { value: 'W', label: '1W' },
];

const POPULAR_SYMBOLS = {
  stock: ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'NVDA', 'META', 'AMZN'],
  crypto: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT'],
  forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'],
  futures: ['ES1!', 'NQ1!', 'GC1!', 'CL1!', 'ZB1!'],
};

const TradingViewChartAI = () => {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [searchQuery, setSearchQuery] = useState('');
  const [assetType, setAssetType] = useState('crypto');
  const [timeframe, setTimeframe] = useState('D');
  const [isExpanded, setIsExpanded] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [showSymbolSearch, setShowSymbolSearch] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Get exchange based on asset type
  const getExchange = () => {
    const asset = ASSET_TYPES.find(a => a.value === assetType);
    return asset?.exchange || 'BINANCE';
  };

  // Build TradingView widget symbol
  const getTradingViewSymbol = () => {
    const exchange = getExchange();
    if (assetType === 'crypto') {
      return `BINANCE:${symbol}`;
    } else if (assetType === 'forex') {
      return `FX:${symbol}`;
    } else if (assetType === 'futures') {
      return `CME_MINI:${symbol}`;
    }
    return `NASDAQ:${symbol}`;
  };

  // Initialize TradingView widget
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clear previous widget
    chartContainerRef.current.innerHTML = '';

    // Create TradingView widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined') {
        new (window as any).TradingView.widget({
          container_id: 'tradingview_chart',
          symbol: getTradingViewSymbol(),
          interval: timeframe,
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#0a0a0a',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          save_image: true,
          studies: ['RSI@tv-basicstudies', 'MACD@tv-basicstudies'],
          width: '100%',
          height: 400,
        });
      }
    };

    // Create container for widget
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'tradingview_chart';
    widgetContainer.style.height = '400px';
    chartContainerRef.current.appendChild(widgetContainer);
    chartContainerRef.current.appendChild(script);

    return () => {
      if (chartContainerRef.current) {
        chartContainerRef.current.innerHTML = '';
      }
    };
  }, [symbol, assetType, timeframe]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSymbolChange = (newSymbol: string) => {
    setSymbol(newSymbol.toUpperCase());
    setShowSymbolSearch(false);
    setSearchQuery('');
    // Clear chat when changing symbols
    setMessages([]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSymbolChange(searchQuery.trim());
    }
  };

  const streamChat = async (userMessage: string) => {
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage, timestamp: new Date() }
    ];
    setMessages(newMessages);
    setIsLoading(true);
    setStreamingContent('');

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          symbol,
          assetType,
          chartTimeframe: TIMEFRAMES.find(t => t.value === timeframe)?.label || '1D',
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get prediction');
      }

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
            if (content) {
              fullContent += content;
              setStreamingContent(fullContent);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Add the complete message
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: fullContent, timestamp: new Date() }
      ]);
      setStreamingContent('');
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get AI prediction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isLoading) return;
    streamChat(inputMessage);
    setInputMessage('');
  };

  const handleQuickPrompt = (prompt: string) => {
    streamChat(prompt);
  };

  const quickPrompts = [
    { label: '📈 Predict Next Move', prompt: `Analyze the ${symbol} chart and predict the next price movement. What's your Buy/Sell/Hold recommendation?` },
    { label: '🎯 Entry & Exit Points', prompt: `What are the best entry and exit points for ${symbol} right now? Include stop-loss levels.` },
    { label: '📊 Pattern Analysis', prompt: `What chart patterns do you see forming on ${symbol}? Explain their implications.` },
    { label: '💪 Support & Resistance', prompt: `Identify key support and resistance levels for ${symbol}.` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <BarChart3 className="w-5 h-5 text-primary" />
            <motion.span
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full"
            />
          </div>
          <h2 className="font-display text-lg font-bold">AI Chart Analysis</h2>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
            {symbol}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {/* Symbol Search & Controls */}
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="flex flex-wrap gap-3 items-center">
                {/* Asset Type Tabs */}
                <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
                  {ASSET_TYPES.map(asset => (
                    <button
                      key={asset.value}
                      onClick={() => {
                        setAssetType(asset.value);
                        const popular = POPULAR_SYMBOLS[asset.value as keyof typeof POPULAR_SYMBOLS];
                        if (popular?.length) setSymbol(popular[0]);
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        assetType === asset.value
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {asset.label}
                    </button>
                  ))}
                </div>

                {/* Symbol Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <form onSubmit={handleSearch}>
                    <Input
                      placeholder="Search symbol..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSymbolSearch(true);
                      }}
                      onFocus={() => setShowSymbolSearch(true)}
                      className="pl-9 bg-background/50"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </form>
                  
                  {/* Symbol Dropdown */}
                  <AnimatePresence>
                    {showSymbolSearch && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg shadow-lg p-2 max-h-48 overflow-y-auto"
                      >
                        <p className="text-xs text-muted-foreground px-2 mb-2">Popular {ASSET_TYPES.find(a => a.value === assetType)?.label}</p>
                        <div className="flex flex-wrap gap-1">
                          {POPULAR_SYMBOLS[assetType as keyof typeof POPULAR_SYMBOLS]?.map(sym => (
                            <button
                              key={sym}
                              onClick={() => handleSymbolChange(sym)}
                              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                symbol === sym
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted/50 hover:bg-muted text-foreground'
                              }`}
                            >
                              {sym}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Timeframe */}
                <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
                  {TIMEFRAMES.map(tf => (
                    <button
                      key={tf.value}
                      onClick={() => setTimeframe(tf.value)}
                      className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                        timeframe === tf.value
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* TradingView Chart */}
            <div 
              ref={chartContainerRef} 
              className="w-full bg-background"
              onClick={() => setShowSymbolSearch(false)}
            />

            {/* AI Chat Section */}
            <div className="border-t border-border">
              <div className="p-4 border-b border-border bg-gradient-to-r from-accent/5 to-primary/5">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-5 h-5 text-accent" />
                  <span className="font-medium">AI Trading Assistant</span>
                  <Sparkles className="w-4 h-4 text-gold" />
                </div>
                
                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((qp, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickPrompt(qp.prompt)}
                      disabled={isLoading}
                      className="px-3 py-1.5 text-xs bg-muted/50 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
                    >
                      {qp.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-64 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !streamingContent && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Ask me to analyze the {symbol} chart!</p>
                    <p className="text-xs mt-1">I can predict moves, identify patterns, and suggest trade setups.</p>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                      <p className="text-xs opacity-50 mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white">You</span>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Streaming message */}
                {streamingContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted/50">
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>{streamingContent}</ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                )}

                {isLoading && !streamingContent && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-muted/50 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Analyzing chart...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border bg-muted/20">
                <div className="flex gap-2">
                  <Input
                    placeholder={`Ask about ${symbol} chart patterns, predictions...`}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    disabled={isLoading}
                    className="flex-1 bg-background/50"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isLoading || !inputMessage.trim()}
                    size="sm"
                    className="gap-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Tip: Challenge the AI's predictions or share your own analysis to have a discussion!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TradingViewChartAI;
