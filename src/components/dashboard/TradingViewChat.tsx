import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  timestamp: Date;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  symbol?: string;
}

const TradingViewChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      user: 'CryptoTrader_X',
      avatar: 'CT',
      message: '🚀 BTC breaking resistance at 42.5k! Next stop 45k?',
      timestamp: new Date(Date.now() - 120000),
      sentiment: 'bullish',
      symbol: 'BTC'
    },
    {
      id: '2',
      user: 'ETH_Whale',
      avatar: 'EW',
      message: 'ETH looking strong above 2300. Accumulating here.',
      timestamp: new Date(Date.now() - 90000),
      sentiment: 'bullish',
      symbol: 'ETH'
    },
    {
      id: '3',
      user: 'QuantAnalyst',
      avatar: 'QA',
      message: 'Market sentiment shifting positive. Volume increasing.',
      timestamp: new Date(Date.now() - 60000),
      sentiment: 'neutral'
    },
    {
      id: '4',
      user: 'DeFi_King',
      avatar: 'DK',
      message: 'SOL ecosystem growing fast! BONK pumping 🔥',
      timestamp: new Date(Date.now() - 30000),
      sentiment: 'bullish',
      symbol: 'SOL'
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [onlineUsers] = useState(1284);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate incoming messages
  useEffect(() => {
    const mockMessages = [
      { user: 'Whale_Alert', avatar: 'WA', message: '🐋 Large BTC transfer detected: 500 BTC moved to exchange', sentiment: 'bearish' as const, symbol: 'BTC' },
      { user: 'TechAnalyst', avatar: 'TA', message: 'MACD crossover on 4H chart for AVAX. Bullish signal!', sentiment: 'bullish' as const, symbol: 'AVAX' },
      { user: 'DayTrader_Pro', avatar: 'DP', message: 'Taking profits on LINK. Great run from $14', sentiment: 'neutral' as const, symbol: 'LINK' },
      { user: 'CryptoNews', avatar: 'CN', message: '📰 SEC postpones decision on ETF again...', sentiment: 'bearish' as const },
      { user: 'AI_Signals', avatar: 'AS', message: '🤖 AI model predicts 72% probability of uptrend continuation', sentiment: 'bullish' as const },
      { user: 'NFT_Collector', avatar: 'NC', message: 'Blue chip NFTs holding strong despite market volatility', sentiment: 'neutral' as const },
    ];

    const interval = setInterval(() => {
      const randomMsg = mockMessages[Math.floor(Math.random() * mockMessages.length)];
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        ...randomMsg,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev.slice(-15), newMsg]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    const msg: ChatMessage = {
      id: Date.now().toString(),
      user: 'You',
      avatar: 'YU',
      message: newMessage,
      timestamp: new Date(),
      sentiment: 'neutral'
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'bearish': return <TrendingDown className="w-3 h-3 text-red-400" />;
      default: return null;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 via-transparent to-accent/5"
        whileHover={{ backgroundColor: 'rgba(var(--primary), 0.05)' }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="relative"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <MessageCircle className="w-5 h-5 text-primary" />
            <motion.span
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"
            />
          </motion.div>
          <h2 className="font-display text-lg font-bold">TradingView Chat</h2>
          <motion.div 
            className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <Users className="w-3 h-3" />
            <span>{onlineUsers.toLocaleString()} online</span>
          </motion.div>
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
      </motion.div>

      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              <AnimatePresence mode="popLayout">
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: -20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                    transition={{ 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                    layout
                    className="flex items-start gap-2 group"
                  >
                    <motion.div 
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xs font-bold shrink-0"
                      whileHover={{ scale: 1.1 }}
                    >
                      {msg.avatar}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-foreground">{msg.user}</span>
                        {msg.symbol && (
                          <motion.span 
                            className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                            whileHover={{ scale: 1.05 }}
                          >
                            ${msg.symbol}
                          </motion.span>
                        )}
                        {getSentimentIcon(msg.sentiment)}
                        <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p className={`text-sm ${getSentimentColor(msg.sentiment)}`}>
                        {msg.message}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-muted/20">
              <div className="flex gap-2">
                <Input
                  placeholder="Share your market insight..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-background/50"
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={handleSend} size="sm" className="gap-2">
                    <Send className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <motion.button 
                  className="text-xs text-muted-foreground hover:text-green-400 flex items-center gap-1 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TrendingUp className="w-3 h-3" /> Bullish
                </motion.button>
                <motion.button 
                  className="text-xs text-muted-foreground hover:text-red-400 flex items-center gap-1 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TrendingDown className="w-3 h-3" /> Bearish
                </motion.button>
                <motion.button 
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-3 h-3" /> AI Insight
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TradingViewChat;
