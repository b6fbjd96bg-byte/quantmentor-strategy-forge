import { motion } from 'framer-motion';
import { 
  Wallet, 
  Settings, 
  FileText, 
  Bell, 
  HelpCircle, 
  Download,
  CreditCard,
  Link2,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

const actions = [
  { icon: Link2, label: 'Connect Broker', href: '/settings', color: 'primary' },
  { icon: TrendingUp, label: 'Chart Analysis', href: '/chart-analysis', color: 'accent' },
  { icon: BookOpen, label: 'Trade Journal', href: '/trade-journal', color: 'primary' },
  { icon: Download, label: 'Export Data', href: '/analytics', color: 'accent' },
  { icon: FileText, label: 'AI Strategies', href: '/ai-strategies', color: 'primary' },
  { icon: Bell, label: 'Notifications', href: '/settings', color: 'accent' },
  { icon: Settings, label: 'Settings', href: '/settings', color: 'primary' },
  { icon: HelpCircle, label: 'Get Help', href: '/help-center', color: 'accent' },
];

const QuickActions = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <h2 className="font-display text-xl font-bold mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.href}
            className="group flex flex-col items-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all hover:scale-105"
          >
            <div className={`w-10 h-10 rounded-xl ${action.color === 'primary' ? 'bg-primary/10 group-hover:bg-primary/20' : 'bg-accent/10 group-hover:bg-accent/20'} flex items-center justify-center mb-2 transition-colors`}>
              <action.icon className={`w-5 h-5 ${action.color === 'primary' ? 'text-primary' : 'text-accent'}`} />
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors text-center">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;
