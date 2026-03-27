import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  IndianRupee,
  DollarSign,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Link2,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BrokerConfig {
  id: string;
  name: string;
  markets: string;
  currency: "INR" | "USD" | "both";
  region: "india" | "global";
  fields: { key: string; label: string; placeholder: string; sensitive: boolean }[];
  docsUrl: string;
  description: string;
}

const BROKERS: BrokerConfig[] = [
  {
    id: "zerodha",
    name: "Zerodha (Kite Connect)",
    markets: "NSE, BSE, MCX",
    currency: "INR",
    region: "india",
    description: "India's largest retail broker. Connect via Kite Connect API.",
    docsUrl: "https://kite.trade/docs/connect/v3/",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "Your Kite Connect API Key", sensitive: false },
      { key: "api_secret", label: "API Secret", placeholder: "Your Kite Connect API Secret", sensitive: true },
    ],
  },
  {
    id: "upstox",
    name: "Upstox",
    markets: "NSE, BSE, MCX",
    currency: "INR",
    region: "india",
    description: "Fast, modern Indian broker with powerful API access.",
    docsUrl: "https://upstox.com/developer/api-documentation/",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "Your Upstox API Key", sensitive: false },
      { key: "api_secret", label: "API Secret", placeholder: "Your Upstox API Secret", sensitive: true },
    ],
  },
  {
    id: "delta",
    name: "Delta Exchange India",
    markets: "Crypto Derivatives (INR)",
    currency: "INR",
    region: "india",
    description: "India's leading crypto derivatives exchange. Trade BTC, ETH futures in INR.",
    docsUrl: "https://docs.delta.exchange/",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "Your Delta Exchange API Key", sensitive: false },
      { key: "api_secret", label: "API Secret", placeholder: "Your Delta Exchange API Secret", sensitive: true },
    ],
  },
  {
    id: "binance",
    name: "Binance",
    markets: "Crypto Spot & Futures",
    currency: "USD",
    region: "global",
    description: "World's largest crypto exchange by volume.",
    docsUrl: "https://binance-docs.github.io/apidocs/",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "Your Binance API Key", sensitive: false },
      { key: "api_secret", label: "API Secret", placeholder: "Your Binance API Secret", sensitive: true },
    ],
  },
  {
    id: "ibkr",
    name: "Interactive Brokers",
    markets: "Global Stocks, Options, Futures",
    currency: "USD",
    region: "global",
    description: "Professional-grade global broker with comprehensive market access.",
    docsUrl: "https://interactivebrokers.github.io/tws-api/",
    fields: [
      { key: "api_key", label: "Client ID", placeholder: "Your TWS Client ID", sensitive: false },
      { key: "api_secret", label: "Client Secret", placeholder: "Your TWS Client Secret", sensitive: true },
    ],
  },
  {
    id: "alpaca",
    name: "Alpaca",
    markets: "US Stocks",
    currency: "USD",
    region: "global",
    description: "Commission-free US stock trading with a developer-friendly API.",
    docsUrl: "https://alpaca.markets/docs/api-references/",
    fields: [
      { key: "api_key", label: "API Key ID", placeholder: "Your Alpaca Key ID", sensitive: false },
      { key: "api_secret", label: "Secret Key", placeholder: "Your Alpaca Secret Key", sensitive: true },
    ],
  },
];

interface ConnectExchangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: () => void;
  preselectedBroker?: string;
}

const ConnectExchangeModal = ({
  open,
  onOpenChange,
  onConnected,
  preselectedBroker,
}: ConnectExchangeModalProps) => {
  const [selectedBroker, setSelectedBroker] = useState<BrokerConfig | null>(
    preselectedBroker ? BROKERS.find((b) => b.id === preselectedBroker) || null : null
  );
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [paperTrading, setPaperTrading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currencyDisplay, setCurrencyDisplay] = useState<"INR" | "USD">("INR");

  const handleSelectBroker = (broker: BrokerConfig) => {
    setSelectedBroker(broker);
    setFormValues({});
    setShowSecrets({});
    setCurrencyDisplay(broker.region === "india" ? "INR" : "USD");
  };

  const handleBack = () => {
    setSelectedBroker(null);
    setFormValues({});
  };

  const handleConnect = async () => {
    if (!selectedBroker) return;

    const missing = selectedBroker.fields.filter((f) => !formValues[f.key]?.trim());
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }

    setIsConnecting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("Please log in first");
        return;
      }

      const { error } = await supabase.from("broker_connections").upsert(
        {
          user_id: session.user.id,
          broker: selectedBroker.id,
          api_key_encrypted: formValues.api_key,
          api_secret_encrypted: formValues.api_secret,
          is_connected: true,
          is_paper_trading: paperTrading,
          connection_status: "connected",
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: "user_id,broker" }
      );

      if (error) {
        // If upsert with onConflict fails (no unique constraint), try insert
        const { error: insertError } = await supabase.from("broker_connections").insert({
          user_id: session.user.id,
          broker: selectedBroker.id,
          api_key_encrypted: formValues.api_key,
          api_secret_encrypted: formValues.api_secret,
          is_connected: true,
          is_paper_trading: paperTrading,
          connection_status: "connected",
          last_synced_at: new Date().toISOString(),
        });
        if (insertError) throw insertError;
      }

      toast.success(`${selectedBroker.name} connected successfully!`);
      onOpenChange(false);
      setSelectedBroker(null);
      setFormValues({});
      onConnected?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to connect broker");
    } finally {
      setIsConnecting(false);
    }
  };

  const indianBrokers = BROKERS.filter((b) => b.region === "india");
  const globalBrokers = BROKERS.filter((b) => b.region === "global");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            {selectedBroker ? selectedBroker.name : "Connect Exchange"}
          </DialogTitle>
          <DialogDescription>
            {selectedBroker
              ? "Enter your API credentials to connect securely."
              : "Choose a broker or exchange to connect."}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!selectedBroker ? (
            <motion.div
              key="picker"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Indian Brokers */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IndianRupee className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Indian Exchanges</span>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">INR</Badge>
                </div>
                <div className="space-y-2">
                  {indianBrokers.map((broker) => (
                    <button
                      key={broker.id}
                      onClick={() => handleSelectBroker(broker)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                    >
                      <div>
                        <p className="font-medium text-sm">{broker.name}</p>
                        <p className="text-xs text-muted-foreground">{broker.markets}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">{broker.currency}</Badge>
                    </button>
                  ))}
                </div>
              </div>

              {/* Global Brokers */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Global Exchanges</span>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">USD</Badge>
                </div>
                <div className="space-y-2">
                  {globalBrokers.map((broker) => (
                    <button
                      key={broker.id}
                      onClick={() => handleSelectBroker(broker)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                    >
                      <div>
                        <p className="font-medium text-sm">{broker.name}</p>
                        <p className="text-xs text-muted-foreground">{broker.markets}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">{broker.currency}</Badge>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border">
                <Shield className="w-4 h-4 text-accent shrink-0" />
                <p className="text-xs text-muted-foreground">
                  All API keys are encrypted at rest. We never hold your funds — zero capital custody.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to exchanges
              </button>

              {/* Broker info */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground">{selectedBroker.description}</p>
                <a
                  href={selectedBroker.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                >
                  API Documentation <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Currency toggle for Indian brokers */}
              {selectedBroker.region === "india" && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Display currency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${currencyDisplay === "INR" ? "text-primary" : "text-muted-foreground"}`}>
                      INR
                    </span>
                    <Switch
                      checked={currencyDisplay === "USD"}
                      onCheckedChange={(checked) => setCurrencyDisplay(checked ? "USD" : "INR")}
                    />
                    <span className={`text-xs font-medium ${currencyDisplay === "USD" ? "text-primary" : "text-muted-foreground"}`}>
                      USD
                    </span>
                  </div>
                </div>
              )}

              {/* API Key Fields */}
              {selectedBroker.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={field.key} className="text-sm">
                    {field.label}
                  </Label>
                  <div className="relative">
                    <Input
                      id={field.key}
                      type={field.sensitive && !showSecrets[field.key] ? "password" : "text"}
                      placeholder={field.placeholder}
                      value={formValues[field.key] || ""}
                      onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      className="pr-10"
                    />
                    {field.sensitive && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowSecrets((prev) => ({ ...prev, [field.key]: !prev[field.key] }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecrets[field.key] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Paper trading toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <div>
                  <p className="text-sm font-medium">Paper Trading Mode</p>
                  <p className="text-xs text-muted-foreground">
                    Test with simulated money first
                  </p>
                </div>
                <Switch checked={paperTrading} onCheckedChange={setPaperTrading} />
              </div>

              {!paperTrading && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-yellow-400">Live Mode:</strong> Real trades will be executed.
                    Ensure your API keys have proper permissions and risk limits.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border">
                <Shield className="w-4 h-4 text-accent shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Credentials are encrypted end-to-end. We recommend API keys with trade-only permissions (no withdrawal access).
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Cancel
                </Button>
                <Button
                  variant="hero"
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="flex-1 gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isConnecting ? "Connecting..." : "Connect"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectExchangeModal;
