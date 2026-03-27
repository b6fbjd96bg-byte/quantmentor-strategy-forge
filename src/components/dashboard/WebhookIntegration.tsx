import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Webhook, Copy, CheckCircle2, ExternalLink, AlertTriangle,
  ChevronDown, ChevronUp, Zap, Server, Code2, Bell
} from 'lucide-react';
import { toast } from 'sonner';

interface WebhookIntegrationProps {
  strategyId: string;
  strategyName: string;
  onClose?: () => void;
}

const WebhookIntegration = ({ strategyId, strategyName, onClose }: WebhookIntegrationProps) => {
  const [copied, setCopied] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tradingview-webhook?strategy=${strategyId}`;
  const secretToken = `qm_${strategyId.slice(0, 8)}_${Date.now().toString(36)}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const alertPayloadExample = JSON.stringify({
    strategy: strategyName,
    action: "{{strategy.order.action}}",
    ticker: "{{ticker}}",
    price: "{{close}}",
    time: "{{timenow}}",
    volume: "{{volume}}",
    secret: secretToken
  }, null, 2);

  const steps = [
    {
      title: 'Copy Your Webhook URL',
      icon: Copy,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This is your unique webhook URL. Every time a TradingView alert fires, it will hit this endpoint and execute your strategy.
          </p>
          <div className="flex gap-2">
            <Input
              readOnly
              value={webhookUrl}
              className="bg-background border-border font-mono text-xs"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(webhookUrl, 'Webhook URL')}
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: 'Open TradingView & Create Alert',
      icon: Bell,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            In TradingView, open the chart for your instrument and click the <strong>Alert</strong> button (clock icon) in the toolbar.
          </p>
          <div className="bg-muted/30 rounded-lg p-3 space-y-2 text-sm">
            <p className="font-medium text-foreground">Steps:</p>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>Go to <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">tradingview.com <ExternalLink className="w-3 h-3" /></a></li>
              <li>Open a chart and add your indicator/strategy</li>
              <li>Click the <strong>"Alert"</strong> button (⏰) in the right toolbar</li>
              <li>Set your condition (e.g., strategy order fills, indicator crosses)</li>
              <li>Scroll down to <strong>"Notifications"</strong></li>
              <li>Enable <strong>"Webhook URL"</strong> and paste the URL from Step 1</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      title: 'Set Alert Message (JSON Payload)',
      icon: Code2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            In the <strong>"Message"</strong> field of your TradingView alert, paste the following JSON payload. This tells QuantMentor what action to take.
          </p>
          <div className="relative">
            <pre className="bg-background border border-border rounded-lg p-3 text-xs font-mono text-foreground overflow-x-auto">
              {alertPayloadExample}
            </pre>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(alertPayloadExample, 'Alert payload')}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Important:</strong> The <code className="bg-muted px-1 rounded text-primary">secret</code> field authenticates your webhook. Keep it private.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Activate & Test',
      icon: Zap,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Save the alert in TradingView. When the condition triggers, QuantMentor will automatically execute your strategy on the connected exchange.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <Server className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs font-medium text-foreground">Alert Fires</p>
              <p className="text-[10px] text-muted-foreground">TradingView sends webhook</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <Zap className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-xs font-medium text-foreground">QuantMentor Receives</p>
              <p className="text-[10px] text-muted-foreground">Validates & processes signal</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <CheckCircle2 className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-xs font-medium text-foreground">Trade Executed</p>
              <p className="text-[10px] text-muted-foreground">Order placed on exchange</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => toast.success('Test webhook sent! Check your Trade Journal for the result.')}>
            <Zap className="w-4 h-4" />
            Send Test Webhook
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Webhook className="w-5 h-5 text-primary" />
            TradingView Webhook
          </CardTitle>
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Active
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Connect TradingView alerts to auto-execute <strong>{strategyName}</strong>
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-border rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedStep(expandedStep === i + 1 ? null : i + 1)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  expandedStep === i + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {i + 1}
                </div>
                <step.icon className={`w-4 h-4 ${expandedStep === i + 1 ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-medium ${expandedStep === i + 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
              </div>
              {expandedStep === i + 1 ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {expandedStep === i + 1 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="px-4 pb-4 pt-1"
              >
                {step.content}
              </motion.div>
            )}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};

export default WebhookIntegration;
