import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot,
  Loader2,
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  Trash2,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  imagePreview?: string;
  timestamp: Date;
}

const TradingViewChartAI = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

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
      // Extract base64 without the data URL prefix
      const base64 = dataUrl.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleFileSelect(file);
            e.preventDefault();
          }
        }
      }
    }
  }, [handleFileSelect]);

  const removeImage = () => {
    setUploadedImage(null);
    setImageBase64(null);
  };

  const streamChat = async (userMessage: string, userImageBase64?: string | null) => {
    const newMsg: ChatMessage = {
      role: 'user',
      content: userMessage,
      imagePreview: userImageBase64 ? uploadedImage || undefined : undefined,
      timestamp: new Date(),
    };
    
    const newMessages = [...messages, newMsg];
    setMessages(newMessages);
    setIsLoading(true);
    setStreamingContent('');

    // Build messages for API - include image data in the user message
    const apiMessages = newMessages.map(m => {
      if (m.role === 'user' && m.imagePreview) {
        // Find the base64 from the data URL  
        const base64 = m.imagePreview.split(',')[1];
        return { role: m.role, content: m.content, imageBase64: base64 };
      }
      return { role: m.role, content: m.content };
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get analysis');
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

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: fullContent, timestamp: new Date() }
      ]);
      setStreamingContent('');
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze chart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if ((!inputMessage.trim() && !imageBase64) || isLoading) return;
    const message = inputMessage.trim() || 'Please analyze this chart screenshot.';
    streamChat(message, imageBase64);
    setInputMessage('');
    removeImage();
  };

  const handleQuickPrompt = (prompt: string) => {
    if (isLoading) return;
    streamChat(prompt, imageBase64);
    removeImage();
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingContent('');
    removeImage();
  };

  const quickPrompts = [
    { label: '📈 Predict Next Move', prompt: 'Analyze this chart and predict the next price movement. What\'s your Buy/Sell/Hold recommendation?' },
    { label: '🎯 Entry & Exit', prompt: 'What are the best entry and exit points based on this chart? Include stop-loss levels.' },
    { label: '📊 Pattern Analysis', prompt: 'What chart patterns do you see forming? Explain their implications and probability.' },
    { label: '💪 Support & Resistance', prompt: 'Identify all key support and resistance levels visible on this chart.' },
  ];

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 240px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 via-transparent to-accent/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="w-5 h-5 text-primary" />
            <motion.span
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full"
            />
          </div>
          <h2 className="font-display text-lg font-bold">AI Chart Analyzer</h2>
          <Sparkles className="w-4 h-4 text-gold" />
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat} className="gap-1 text-xs text-muted-foreground">
              <Trash2 className="w-3 h-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingContent && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
              <ImageIcon className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">Upload a Chart Screenshot</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Take a screenshot of any TradingView chart and the AI will analyze patterns, indicators, 
              support/resistance levels, and provide actionable trade setups.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm mb-6">
              <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                📸 Screenshot or paste chart
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                🔍 AI reads patterns & indicators
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                🎯 Get entry/exit + stop loss
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                💬 Ask follow-up questions
              </div>
            </div>
            <Button
              variant="heroOutline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Chart Screenshot
            </Button>
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
              {msg.imagePreview && (
                <div className="mb-2 rounded-lg overflow-hidden border border-border/50">
                  <img src={msg.imagePreview} alt="Chart" className="max-h-48 w-auto object-contain" />
                </div>
              )}
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
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </motion.div>
        ))}

        {/* Streaming */}
        {streamingContent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-muted/50">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Analyzing chart...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
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
      )}

      {/* Image Preview */}
      <AnimatePresence>
        {uploadedImage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-2 shrink-0"
          >
            <div className="relative inline-block">
              <img src={uploadedImage} alt="Chart preview" className="h-24 rounded-lg border border-border object-contain" />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:scale-110 transition-transform"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop Zone Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary rounded-2xl flex items-center justify-center z-10"
          >
            <div className="text-center">
              <Upload className="w-12 h-12 text-primary mx-auto mb-2" />
              <p className="font-medium text-primary">Drop chart screenshot here</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div
        className="p-4 border-t border-border bg-background/50 shrink-0"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
              e.target.value = '';
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0"
            title="Upload chart screenshot"
          >
            <Upload className="w-5 h-5" />
          </Button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              onPaste={handlePaste}
              placeholder={uploadedImage ? "Ask about this chart..." : "Upload a chart screenshot or ask a trading question..."}
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:outline-none transition-colors text-sm"
              disabled={isLoading}
            />
          </div>
          <Button
            variant="hero"
            size="icon"
            onClick={handleSendMessage}
            disabled={isLoading || (!inputMessage.trim() && !imageBase64)}
            className="shrink-0"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          📸 Paste, drag & drop, or upload a TradingView chart screenshot • Ctrl+V to paste
        </p>
      </div>
    </div>
  );
};

export default TradingViewChartAI;
