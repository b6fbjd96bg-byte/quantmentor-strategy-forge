-- Create strategy_bots table to track AI-generated bots
CREATE TABLE public.strategy_bots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'generating',
  broker TEXT NOT NULL DEFAULT 'paper',
  generated_code TEXT,
  bot_config JSONB DEFAULT '{}'::jsonb,
  indicators JSONB DEFAULT '[]'::jsonb,
  entry_logic TEXT,
  exit_logic TEXT,
  risk_params JSONB DEFAULT '{}'::jsonb,
  ai_analysis TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create backtest_results table
CREATE TABLE public.backtest_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES public.strategy_bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  initial_capital NUMERIC NOT NULL DEFAULT 10000,
  final_capital NUMERIC,
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  win_rate NUMERIC DEFAULT 0,
  profit_loss NUMERIC DEFAULT 0,
  profit_loss_percentage NUMERIC DEFAULT 0,
  max_drawdown NUMERIC DEFAULT 0,
  sharpe_ratio NUMERIC DEFAULT 0,
  trade_log JSONB DEFAULT '[]'::jsonb,
  equity_curve JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bot_trades table for live/paper trading
CREATE TABLE public.bot_trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES public.strategy_bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  trade_type TEXT NOT NULL,
  side TEXT NOT NULL,
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC,
  quantity NUMERIC NOT NULL,
  profit_loss NUMERIC DEFAULT 0,
  profit_loss_percentage NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  exit_time TIMESTAMP WITH TIME ZONE,
  broker TEXT NOT NULL,
  order_id TEXT,
  entry_reason TEXT,
  exit_reason TEXT,
  indicators_at_entry JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create broker_connections table
CREATE TABLE public.broker_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  broker TEXT NOT NULL,
  api_key_encrypted TEXT,
  api_secret_encrypted TEXT,
  is_connected BOOLEAN DEFAULT false,
  is_paper_trading BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  connection_status TEXT DEFAULT 'disconnected',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, broker)
);

-- Enable RLS
ALTER TABLE public.strategy_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backtest_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for strategy_bots
CREATE POLICY "Users can view their own bots" ON public.strategy_bots
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bots" ON public.strategy_bots
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bots" ON public.strategy_bots
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bots" ON public.strategy_bots
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for backtest_results
CREATE POLICY "Users can view their own backtests" ON public.backtest_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own backtests" ON public.backtest_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for bot_trades
CREATE POLICY "Users can view their own bot trades" ON public.bot_trades
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bot trades" ON public.bot_trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bot trades" ON public.bot_trades
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for broker_connections
CREATE POLICY "Users can view their own broker connections" ON public.broker_connections
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own broker connections" ON public.broker_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own broker connections" ON public.broker_connections
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own broker connections" ON public.broker_connections
  FOR DELETE USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_strategy_bots_updated_at
  BEFORE UPDATE ON public.strategy_bots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bot_trades_updated_at
  BEFORE UPDATE ON public.bot_trades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_broker_connections_updated_at
  BEFORE UPDATE ON public.broker_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();