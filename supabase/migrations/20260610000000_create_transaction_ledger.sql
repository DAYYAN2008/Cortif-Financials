-- 1. Create Custom Enums
CREATE TYPE public.asset_type_enum AS ENUM ('stock', 'crypto', 'commodity');
CREATE TYPE public.transaction_type_enum AS ENUM ('BUY', 'SELL');

-- 2. Create Tables
CREATE TABLE public.portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Assuming auth.users is the target, otherwise replace with profiles(id) if needed later
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    base_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker VARCHAR(10) NOT NULL UNIQUE,
    asset_type public.asset_type_enum NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.assets(id),
    transaction_type public.transaction_type_enum NOT NULL,
    quantity NUMERIC(20, 8) NOT NULL CHECK (quantity > 0),
    execution_price NUMERIC(20, 4) NOT NULL CHECK (execution_price > 0),
    executed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add Performance Indexes
CREATE INDEX idx_transactions_portfolio_id ON public.transactions(portfolio_id);
CREATE INDEX idx_transactions_asset_id ON public.transactions(asset_id);
CREATE INDEX idx_transactions_portfolio_asset ON public.transactions(portfolio_id, asset_id);
