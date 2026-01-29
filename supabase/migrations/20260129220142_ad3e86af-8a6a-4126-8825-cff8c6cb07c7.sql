-- Create enum for risk profiles
CREATE TYPE risk_profile AS ENUM ('conservative', 'balanced', 'aggressive');

-- Create enum for allocation status
CREATE TYPE allocation_status AS ENUM ('pending', 'active', 'paused', 'withdrawn');

-- User capital allocations - main table for user investments
CREATE TABLE public.capital_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  risk_profile risk_profile NOT NULL DEFAULT 'balanced',
  capital_amount NUMERIC NOT NULL CHECK (capital_amount > 0),
  current_value NUMERIC NOT NULL DEFAULT 0,
  lock_in_days INTEGER DEFAULT NULL,
  lock_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  status allocation_status NOT NULL DEFAULT 'pending',
  platform_fee_rate NUMERIC NOT NULL DEFAULT 0.01, -- 1% default
  performance_fee_rate NUMERIC NOT NULL DEFAULT 0.15, -- 15% of profits
  high_water_mark NUMERIC NOT NULL DEFAULT 0,
  total_fees_paid NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Qualified strategies - only strategies that meet criteria
CREATE TABLE public.qualified_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  strategy_type TEXT NOT NULL,
  markets TEXT[] NOT NULL,
  live_trading_days INTEGER NOT NULL DEFAULT 0,
  max_drawdown NUMERIC NOT NULL DEFAULT 0,
  sharpe_ratio NUMERIC NOT NULL DEFAULT 0,
  sortino_ratio NUMERIC NOT NULL DEFAULT 0,
  execution_quality_score NUMERIC NOT NULL DEFAULT 0 CHECK (execution_quality_score >= 0 AND execution_quality_score <= 100),
  slippage_score NUMERIC NOT NULL DEFAULT 0 CHECK (slippage_score >= 0 AND slippage_score <= 100),
  correlation_factor NUMERIC NOT NULL DEFAULT 0,
  is_qualified BOOLEAN NOT NULL DEFAULT false,
  qualification_date TIMESTAMP WITH TIME ZONE,
  disqualification_reason TEXT,
  risk_score NUMERIC NOT NULL DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Strategy allocations - how capital is distributed across strategies
CREATE TABLE public.strategy_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  allocation_id UUID NOT NULL REFERENCES public.capital_allocations(id) ON DELETE CASCADE,
  qualified_strategy_id UUID NOT NULL REFERENCES public.qualified_strategies(id) ON DELETE CASCADE,
  allocation_percentage NUMERIC NOT NULL DEFAULT 0 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  allocated_capital NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC NOT NULL DEFAULT 0,
  profit_loss NUMERIC NOT NULL DEFAULT 0,
  profit_loss_percentage NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Allocation history - track changes over time
CREATE TABLE public.allocation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  allocation_id UUID NOT NULL REFERENCES public.capital_allocations(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_value NUMERIC NOT NULL,
  daily_pnl NUMERIC NOT NULL DEFAULT 0,
  daily_pnl_percentage NUMERIC NOT NULL DEFAULT 0,
  cumulative_pnl NUMERIC NOT NULL DEFAULT 0,
  cumulative_pnl_percentage NUMERIC NOT NULL DEFAULT 0,
  drawdown NUMERIC NOT NULL DEFAULT 0,
  max_drawdown NUMERIC NOT NULL DEFAULT 0,
  volatility_index NUMERIC NOT NULL DEFAULT 0,
  strategy_distribution JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Risk control events - log risk management actions
CREATE TABLE public.risk_control_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  allocation_id UUID NOT NULL REFERENCES public.capital_allocations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_description TEXT NOT NULL,
  previous_exposure NUMERIC,
  new_exposure NUMERIC,
  triggered_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.capital_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualified_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_control_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for capital_allocations
CREATE POLICY "Users can view their own allocations" 
ON public.capital_allocations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own allocations" 
ON public.capital_allocations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own allocations" 
ON public.capital_allocations FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for qualified_strategies (public read for qualified strategies)
CREATE POLICY "Everyone can view qualified strategies" 
ON public.qualified_strategies FOR SELECT 
USING (is_qualified = true);

-- RLS policies for strategy_allocations (via allocation ownership)
CREATE POLICY "Users can view their strategy allocations" 
ON public.strategy_allocations FOR SELECT 
USING (allocation_id IN (SELECT id FROM public.capital_allocations WHERE user_id = auth.uid()));

-- RLS policies for allocation_history
CREATE POLICY "Users can view their allocation history" 
ON public.allocation_history FOR SELECT 
USING (allocation_id IN (SELECT id FROM public.capital_allocations WHERE user_id = auth.uid()));

-- RLS policies for risk_control_events
CREATE POLICY "Users can view their risk events" 
ON public.risk_control_events FOR SELECT 
USING (allocation_id IN (SELECT id FROM public.capital_allocations WHERE user_id = auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_capital_allocations_updated_at
BEFORE UPDATE ON public.capital_allocations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_qualified_strategies_updated_at
BEFORE UPDATE ON public.qualified_strategies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategy_allocations_updated_at
BEFORE UPDATE ON public.strategy_allocations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();