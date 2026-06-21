-- Fix missing RLS policies on transactions and view security invoker flag
-- These were defined in migration 20260614... but never applied to the live database.

-- 1. Add UPDATE policy for transactions (scoped to owned portfolios)
CREATE POLICY "Users can update their portfolio transactions"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = transactions.portfolio_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = transactions.portfolio_id AND p.user_id = auth.uid()
    )
  );

-- 2. Add DELETE policy for transactions (scoped to owned portfolios)
CREATE POLICY "Users can delete their portfolio transactions"
  ON public.transactions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = transactions.portfolio_id AND p.user_id = auth.uid()
    )
  );

-- 3. Recreate holdings view with security_invoker = true
--    Uses a CTE to compute net_quantity (BUY - SELL) and weighted avg cost basis,
--    then filters to only show assets with positive net_quantity.
CREATE OR REPLACE VIEW public.portfolio_holdings_summary
WITH (security_invoker = true) AS
WITH calculated_ledger AS (
    SELECT
        t.portfolio_id,
        t.asset_id,
        a.ticker,
        a.name AS asset_name,
        a.asset_type,
        SUM(CASE WHEN t.transaction_type = 'BUY' THEN t.quantity ELSE -t.quantity END) AS net_quantity,
        SUM(CASE WHEN t.transaction_type = 'BUY' THEN t.quantity * t.execution_price ELSE 0 END)
            / NULLIF(SUM(CASE WHEN t.transaction_type = 'BUY' THEN t.quantity ELSE 0 END), 0) AS average_cost_basis,
        MAX(t.executed_at) AS last_transacted_at
    FROM public.transactions t
    JOIN public.assets a ON t.asset_id = a.id
    GROUP BY t.portfolio_id, t.asset_id, a.ticker, a.name, a.asset_type
)
SELECT
    portfolio_id,
    asset_id,
    ticker,
    asset_name,
    asset_type,
    net_quantity,
    average_cost_basis,
    (net_quantity * average_cost_basis) AS total_cost,
    last_transacted_at
FROM calculated_ledger
WHERE net_quantity > 0;
