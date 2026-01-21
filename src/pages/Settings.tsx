import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Zap, 
  Bot, 
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  LineChart,
  PieChart,
  User,
  Bell,
  Shield,
  CreditCard,
  Link2,
  Key,
  Moon,
  Sun,
  Globe,
  Smartphone,
  Mail,
  Save,
  Trash2,
  ChevronRight
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  trading_experience: string | null;
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    email: '',
    phone: '',
    trading_experience: 'beginner',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    tradeAlerts: true,
    priceAlerts: true,
    weeklyReport: true,
    marketNews: false,
  });

  const [connectedBrokers] = useState([
    { name: 'Interactive Brokers', status: 'connected', lastSync: '2 min ago' },
  ]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, email, phone, trading_experience')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        trading_experience: profile.trading_experience,
      })
      .eq('user_id', user.id);

    setIsLoading(false);

    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile saved successfully');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'brokers', label: 'Brokers', icon: Link2 },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'api', label: 'API Keys', icon: Key },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border p-6 flex flex-col z-50">
        <Link to="/" className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">QuantMentor</span>
        </Link>

        <nav className="flex-1 space-y-2">
          {[
            { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
            { icon: Bot, label: 'AI Strategies', href: '/ai-strategies' },
            { icon: LineChart, label: 'Live Trading', href: '/live-trading' },
            { icon: PieChart, label: 'Analytics', href: '/analytics' },
            { icon: SettingsIcon, label: 'Settings', active: true, href: '/settings' },
          ].map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                item.active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="pt-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-1 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account, preferences, and integrations.
          </p>
        </div>

        <div className="flex gap-8">
          {/* Settings Tabs */}
          <div className="w-56 shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <h2 className="font-display text-xl font-bold mb-6">Profile Information</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Full Name</label>
                      <input
                        type="text"
                        value={profile.full_name || ''}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:border-primary focus:outline-none transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <input
                        type="email"
                        value={profile.email || user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 rounded-lg bg-muted/30 border border-border text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone</label>
                      <input
                        type="tel"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:border-primary focus:outline-none transition-colors"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Trading Experience</label>
                      <select
                        value={profile.trading_experience || 'beginner'}
                        onChange={(e) => setProfile({ ...profile, trading_experience: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:border-primary focus:outline-none transition-colors"
                      >
                        <option value="beginner">Beginner (0-1 years)</option>
                        <option value="intermediate">Intermediate (1-3 years)</option>
                        <option value="advanced">Advanced (3-5 years)</option>
                        <option value="expert">Expert (5+ years)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline">Cancel</Button>
                    <Button variant="hero" onClick={handleSaveProfile} disabled={isLoading} className="gap-2">
                      <Save className="w-4 h-4" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <h2 className="font-display text-xl font-bold mb-6">Notification Preferences</h2>
                
                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email', icon: Mail },
                    { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications', icon: Smartphone },
                    { key: 'tradeAlerts', label: 'Trade Alerts', desc: 'Get notified when trades execute', icon: Bell },
                    { key: 'priceAlerts', label: 'Price Alerts', desc: 'Alerts when prices hit targets', icon: LineChart },
                    { key: 'weeklyReport', label: 'Weekly Reports', desc: 'Performance summary emails', icon: BarChart3 },
                    { key: 'marketNews', label: 'Market News', desc: 'Breaking market updates', icon: Globe },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          notifications[item.key as keyof typeof notifications] ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-display text-xl font-bold mb-6">Security Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                      <div>
                        <p className="font-medium">Change Password</p>
                        <p className="text-sm text-muted-foreground">Update your password regularly</p>
                      </div>
                      <Button variant="outline" size="sm">Update</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                      <div>
                        <p className="font-medium">Active Sessions</p>
                        <p className="text-sm text-muted-foreground">Manage your active sessions</p>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-2xl border border-destructive/30 p-6">
                  <h2 className="font-display text-xl font-bold mb-2 text-destructive">Danger Zone</h2>
                  <p className="text-sm text-muted-foreground mb-4">Irreversible account actions</p>
                  
                  <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === 'brokers' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold">Connected Brokers</h2>
                  <Button variant="hero" size="sm" className="gap-2">
                    <Link2 className="w-4 h-4" />
                    Connect New
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {connectedBrokers.map((broker, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                          <Link2 className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium">{broker.name}</p>
                          <p className="text-sm text-muted-foreground">Last synced: {broker.lastSync}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
                          Connected
                        </span>
                        <Button variant="outline" size="sm">Disconnect</Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-dashed border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    Connect more brokers to trade across multiple accounts
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <h2 className="font-display text-xl font-bold mb-6">Billing & Subscription</h2>
                
                <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Plan</p>
                      <p className="font-display text-2xl font-bold">Pro Plan</p>
                      <p className="text-sm text-muted-foreground mt-1">$49/month • Renews Jan 21, 2026</p>
                    </div>
                    <Button variant="outline">Upgrade</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-4">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 12/26</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>

                  <Button variant="outline" className="w-full gap-2">
                    <ChevronRight className="w-4 h-4" />
                    View Billing History
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === 'api' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold">API Keys</h2>
                  <Button variant="hero" size="sm" className="gap-2">
                    <Key className="w-4 h-4" />
                    Generate New Key
                  </Button>
                </div>
                
                <div className="p-4 rounded-xl bg-muted/30 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Production API Key</p>
                    <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs">Active</span>
                  </div>
                  <code className="text-sm text-muted-foreground font-mono">
                    qm_live_••••••••••••••••••••••••••••
                  </code>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm">Copy</Button>
                    <Button variant="outline" size="sm" className="text-destructive">Revoke</Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-sm text-yellow-400">
                    ⚠️ Keep your API keys secure. Never share them publicly or commit them to version control.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
