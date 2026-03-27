
-- Published strategies for marketplace
CREATE TABLE public.published_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  strategy_type TEXT NOT NULL,
  markets TEXT[] NOT NULL DEFAULT '{}',
  timeframe TEXT,
  win_rate NUMERIC DEFAULT 0,
  profit_factor NUMERIC DEFAULT 0,
  max_drawdown NUMERIC DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  paper_pnl NUMERIC DEFAULT 0,
  paper_win_rate NUMERIC DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  entry_rules TEXT,
  exit_rules TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.published_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published strategies" ON public.published_strategies
  FOR SELECT TO authenticated USING (is_published = true);

CREATE POLICY "Users can publish their own strategies" ON public.published_strategies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own published strategies" ON public.published_strategies
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own published strategies" ON public.published_strategies
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Strategy followers
CREATE TABLE public.strategy_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  strategy_id UUID REFERENCES public.published_strategies(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, strategy_id)
);

ALTER TABLE public.strategy_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view followers" ON public.strategy_followers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can follow strategies" ON public.strategy_followers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow strategies" ON public.strategy_followers
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Risk settings
CREATE TABLE public.risk_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  max_daily_loss_pct NUMERIC DEFAULT 3,
  max_loss_per_trade_pct NUMERIC DEFAULT 1,
  max_consecutive_losses INTEGER DEFAULT 3,
  position_size_pct NUMERIC DEFAULT 2,
  daily_trade_limit INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  trades_today INTEGER DEFAULT 0,
  daily_loss_today NUMERIC DEFAULT 0,
  consecutive_losses_today INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.risk_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own risk settings" ON public.risk_settings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own risk settings" ON public.risk_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own risk settings" ON public.risk_settings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
