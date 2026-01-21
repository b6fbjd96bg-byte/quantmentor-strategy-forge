import { motion } from 'framer-motion';
import { Link2, Server, Bot, Zap, CheckCircle2, ArrowRight, Shield } from 'lucide-react';

const BrokerConnection = () => {
  const connectedBroker = {
    name: 'Interactive Brokers',
    status: 'connected',
    lastSync: '2 min ago',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold">Broker Connection</h2>
        <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Connected
        </span>
      </div>

      {/* Connection Diagram */}
      <div className="relative bg-muted/30 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between gap-4">
          {/* QuantMentor */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-2">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <span className="text-xs font-medium">QuantMentor</span>
            <span className="text-[10px] text-muted-foreground">AI Trading</span>
          </motion.div>

          {/* Connection Line 1 */}
          <div className="flex-1 relative">
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="h-0.5 bg-gradient-to-r from-primary to-accent origin-left"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground bg-card px-2"
            >
              Signals
            </motion.div>
            <motion.div
              animate={{ x: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
            >
              <ArrowRight className="w-4 h-4 text-accent" />
            </motion.div>
          </div>

          {/* API Bridge */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center mb-2 relative">
              <Server className="w-8 h-8 text-accent" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
              >
                <Shield className="w-2.5 h-2.5 text-white" />
              </motion.div>
            </div>
            <span className="text-xs font-medium">Secure API</span>
            <span className="text-[10px] text-muted-foreground">Encrypted</span>
          </motion.div>

          {/* Connection Line 2 */}
          <div className="flex-1 relative">
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="h-0.5 bg-gradient-to-r from-accent to-green-500 origin-left"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground bg-card px-2"
            >
              Executes
            </motion.div>
            <motion.div
              animate={{ x: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
            >
              <ArrowRight className="w-4 h-4 text-green-500" />
            </motion.div>
          </div>

          {/* Broker */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-2">
              <Bot className="w-8 h-8 text-green-500" />
            </div>
            <span className="text-xs font-medium">{connectedBroker.name}</span>
            <span className="text-[10px] text-muted-foreground">Your Broker</span>
          </motion.div>
        </div>

        {/* Security Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] bg-card border border-border px-3 py-1 rounded-full text-muted-foreground flex items-center gap-1"
        >
          <Shield className="w-3 h-3 text-green-500" />
          Zero Capital Custody
        </motion.div>
      </div>

      {/* Broker Info */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground mb-1">Broker</p>
          <p className="text-sm font-medium truncate">{connectedBroker.name}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground mb-1">Last Sync</p>
          <p className="text-sm font-medium">{connectedBroker.lastSync}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground mb-1">Status</p>
          <p className="text-sm font-medium text-green-400">Active</p>
        </div>
      </div>
    </motion.div>
  );
};

export default BrokerConnection;
