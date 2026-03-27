import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert, Shield, AlertTriangle, Activity, Percent,
  Hash, Ban, DollarSign, Save, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

interface RiskSettings {
  id?: string;
  max_daily_loss_pct: number;
  max_loss_per_trade_pct: number;
  max_consecutive_losses: number;
  position_size_pct: number;
  daily_trade_limit: number;
  is_active: boolean;
  trades_today: number;
  daily_loss_today: number;
  consecutive_losses_today: number;
}

const defaultSettings: RiskSettings = {
  max_daily_loss_pct: 3,
  max_loss_per_trade_pct: 1,
  max_consecutive_losses: 3,
  position_size_pct: 2,
  daily_trade_limit: 10,
  is_active: true,
  trades_today: 0,
  daily_loss_today: 0,
  consecutive_losses_today: 0,
};

const RiskManager = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settings, setSettings] = useState<RiskSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    fetchSettings(session.user.id);
  };

  const fetchSettings = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("risk_settings")
      .select("*")
      .eq("user_id", uid)
      .maybeSingle();

    if (data) {
      setSettings(data as unknown as RiskSettings);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const payload = {
      user_id: session.user.id,
      max_daily_loss_pct: settings.max_daily_loss_pct,
      max_loss_per_trade_pct: settings.max_loss_per_trade_pct,
      max_consecutive_losses: settings.max_consecutive_losses,
      position_size_pct: settings.position_size_pct,
      daily_trade_limit: settings.daily_trade_limit,
      is_active: settings.is_active,
    };

    const { error } = settings.id
      ? await supabase.from("risk_settings").update(payload).eq("id", settings.id)
      : await supabase.from("risk_settings").insert(payload);

    if (error) {
      toast({ title: "Error saving settings", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Risk settings saved!", description: "Your risk limits are now active." });
      fetchSettings(session.user.id);
    }
    setSaving(false);
  };

  const dailyLossPct = settings.max_daily_loss_pct > 0
    ? Math.min(100, (Math.abs(settings.daily_loss_today) / settings.max_daily_loss_pct) * 100)
    : 0;
  const tradesPct = settings.daily_trade_limit > 0
    ? Math.min(100, (settings.trades_today / settings.daily_trade_limit) * 100)
    : 0;
  const consLossesPct = settings.max_consecutive_losses > 0
    ? Math.min(100, (settings.consecutive_losses_today / settings.max_consecutive_losses) * 100)
    : 0;

  const getStatusColor = (pct: number) => {
    if (pct >= 90) return "text-destructive";
    if (pct >= 70) return "text-yellow-400";
    return "text-accent";
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 90) return "[&>div]:bg-destructive";
    if (pct >= 70) return "[&>div]:bg-yellow-400";
    return "[&>div]:bg-accent";
  };

  const overallStatus = dailyLossPct >= 90 || tradesPct >= 90 || consLossesPct >= 90
    ? "CRITICAL" : dailyLossPct >= 70 || tradesPct >= 70 || consLossesPct >= 70
    ? "WARNING" : "SAFE";

  return (
    <div className="min-h-screen bg-background flex w-full">
      <DashboardSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <ShieldAlert className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                Risk Manager
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                Protect your capital with automated risk controls
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="risk-active" className="text-sm text-muted-foreground">Risk Controls</Label>
                <Switch
                  id="risk-active"
                  checked={settings.is_active}
                  onCheckedChange={(v) => setSettings(p => ({ ...p, is_active: v }))}
                />
              </div>
              <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <Card key={i} className="bg-card border-border animate-pulse"><CardContent className="p-6 h-32" /></Card>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Risk Status */}
              <div className="lg:col-span-1 space-y-4">
                <Card className={`border ${overallStatus === "CRITICAL" ? "border-destructive/50 bg-destructive/5" : overallStatus === "WARNING" ? "border-yellow-500/50 bg-yellow-500/5" : "border-accent/50 bg-accent/5"}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Live Risk Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge className={`${overallStatus === "CRITICAL" ? "bg-destructive" : overallStatus === "WARNING" ? "bg-yellow-500 text-black" : "bg-accent text-accent-foreground"}`}>
                        {overallStatus === "CRITICAL" ? "⚠️ CRITICAL" : overallStatus === "WARNING" ? "⚡ WARNING" : "✅ SAFE"}
                      </Badge>
                      {!settings.is_active && <Badge variant="outline" className="border-destructive text-destructive">PAUSED</Badge>}
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Loss Status */}
                <Card className="bg-card border-border">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />Daily Loss
                      </span>
                      <span className={`text-sm font-bold ${getStatusColor(dailyLossPct)}`}>
                        {Math.abs(settings.daily_loss_today).toFixed(1)}% / {settings.max_daily_loss_pct}%
                      </span>
                    </div>
                    <Progress value={dailyLossPct} className={`h-2 ${getProgressColor(dailyLossPct)}`} />
                  </CardContent>
                </Card>

                {/* Trades Today */}
                <Card className="bg-card border-border">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Hash className="h-4 w-4" />Trades Today
                      </span>
                      <span className={`text-sm font-bold ${getStatusColor(tradesPct)}`}>
                        {settings.trades_today} / {settings.daily_trade_limit}
                      </span>
                    </div>
                    <Progress value={tradesPct} className={`h-2 ${getProgressColor(tradesPct)}`} />
                  </CardContent>
                </Card>

                {/* Consecutive Losses */}
                <Card className="bg-card border-border">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Ban className="h-4 w-4" />Consecutive Losses
                      </span>
                      <span className={`text-sm font-bold ${getStatusColor(consLossesPct)}`}>
                        {settings.consecutive_losses_today} / {settings.max_consecutive_losses}
                      </span>
                    </div>
                    <Progress value={consLossesPct} className={`h-2 ${getProgressColor(consLossesPct)}`} />
                  </CardContent>
                </Card>
              </div>

              {/* Settings Form */}
              <div className="lg:col-span-2">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Risk Limits Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-foreground flex items-center gap-2">
                          <Percent className="h-4 w-4 text-muted-foreground" />
                          Max Daily Loss (%)
                        </Label>
                        <Input
                          type="number"
                          value={settings.max_daily_loss_pct}
                          onChange={(e) => setSettings(p => ({ ...p, max_daily_loss_pct: +e.target.value }))}
                          className="bg-background border-border"
                          min={0.5} max={20} step={0.5}
                        />
                        <p className="text-xs text-muted-foreground">Bot pauses when daily loss exceeds this</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-foreground flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          Max Loss Per Trade (%)
                        </Label>
                        <Input
                          type="number"
                          value={settings.max_loss_per_trade_pct}
                          onChange={(e) => setSettings(p => ({ ...p, max_loss_per_trade_pct: +e.target.value }))}
                          className="bg-background border-border"
                          min={0.1} max={10} step={0.1}
                        />
                        <p className="text-xs text-muted-foreground">Max risk per individual trade</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-foreground flex items-center gap-2">
                          <Ban className="h-4 w-4 text-muted-foreground" />
                          Max Consecutive Losses
                        </Label>
                        <Input
                          type="number"
                          value={settings.max_consecutive_losses}
                          onChange={(e) => setSettings(p => ({ ...p, max_consecutive_losses: +e.target.value }))}
                          className="bg-background border-border"
                          min={1} max={20} step={1}
                        />
                        <p className="text-xs text-muted-foreground">Bot pauses after this many losses in a row</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-foreground flex items-center gap-2">
                          <Percent className="h-4 w-4 text-muted-foreground" />
                          Position Size (% of balance)
                        </Label>
                        <Input
                          type="number"
                          value={settings.position_size_pct}
                          onChange={(e) => setSettings(p => ({ ...p, position_size_pct: +e.target.value }))}
                          className="bg-background border-border"
                          min={0.5} max={25} step={0.5}
                        />
                        <p className="text-xs text-muted-foreground">Percentage of account balance per trade</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-foreground flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          Daily Trade Limit
                        </Label>
                        <Input
                          type="number"
                          value={settings.daily_trade_limit}
                          onChange={(e) => setSettings(p => ({ ...p, daily_trade_limit: +e.target.value }))}
                          className="bg-background border-border"
                          min={1} max={100} step={1}
                        />
                        <p className="text-xs text-muted-foreground">Max trades allowed per day</p>
                      </div>
                    </div>

                    {/* Risk Rules Summary */}
                    <div className="bg-background rounded-lg p-4 border border-border">
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Active Risk Rules
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Stop trading if daily loss exceeds <span className="text-foreground font-medium">{settings.max_daily_loss_pct}%</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Max risk per trade: <span className="text-foreground font-medium">{settings.max_loss_per_trade_pct}%</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Pause bot after <span className="text-foreground font-medium">{settings.max_consecutive_losses}</span> consecutive losses
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Position size: <span className="text-foreground font-medium">{settings.position_size_pct}%</span> of balance
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Max <span className="text-foreground font-medium">{settings.daily_trade_limit}</span> trades per day
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RiskManager;
