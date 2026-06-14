-- RLS policies for assets (shared catalog)
CREATE POLICY "Authenticated users can read assets"
  ON public.assets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert assets"
  ON public.assets FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS policies for transactions (scoped to owned portfolios)
CREATE POLICY "Users can read their portfolio transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = transactions.portfolio_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their portfolio transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = transactions.portfolio_id AND p.user_id = auth.uid()
    )
  );

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

CREATE POLICY "Users can delete their portfolio transactions"
  ON public.transactions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = transactions.portfolio_id AND p.user_id = auth.uid()
    )
  );

-- Recreate holdings view with security_invoker so RLS applies per user
CREATE OR REPLACE VIEW public.portfolio_holdings_summary
WITH (security_invoker = true) AS
SELECT
    t.portfolio_id,
    t.asset_id,
    a.ticker,
    a.name        AS asset_name,
    a.asset_type,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'BUY'  THEN t.quantity ELSE 0 END), 0)
  - COALESCE(SUM(CASE WHEN t.transaction_type = 'SELL' THEN t.quantity ELSE 0 END), 0)
        AS net_quantity,
    CASE
        WHEN SUM(CASE WHEN t.transaction_type = 'BUY' THEN t.quantity ELSE 0 END) > 0
        THEN SUM(CASE WHEN t.transaction_type = 'BUY' THEN t.quantity * t.execution_price ELSE 0 END)
           / SUM(CASE WHEN t.transaction_type = 'BUY' THEN t.quantity ELSE 0 END)
        ELSE 0
    END AS average_cost_basis,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'BUY' THEN t.quantity * t.execution_price ELSE 0 END), 0)
        AS total_cost,
    MAX(t.executed_at) AS last_transacted_at
FROM public.transactions t
JOIN public.assets a ON a.id = t.asset_id
GROUP BY t.portfolio_id, t.asset_id, a.ticker, a.name, a.asset_type;
