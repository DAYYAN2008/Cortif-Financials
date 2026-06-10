-- Portfolio Holdings Summary View
-- Aggregates transactions per (portfolio_id, asset_id) to compute
-- net_quantity and average_cost_basis for active holdings.
CREATE OR REPLACE VIEW public.portfolio_holdings_summary AS
SELECT
    t.portfolio_id,
    t.asset_id,
    a.ticker,
    a.name        AS asset_name,
    a.asset_type,
    -- Net quantity: sum of BUY quantities minus sum of SELL quantities
    COALESCE(SUM(CASE WHEN t.transaction_type = 'BUY'  THEN t.quantity ELSE 0 END), 0)
  - COALESCE(SUM(CASE WHEN t.transaction_type = 'SELL' THEN t.quantity ELSE 0 END), 0)
        AS net_quantity,
    -- Weighted average cost basis (BUY side only)
    CASE
        WHEN SUM(CASE WHEN t.transaction_type = 'BUY' THEN t.quantity ELSE 0 END) > 0
        THEN SUM(CASE WHEN t.transaction_type = 'BUY' THEN t.quantity * t.execution_price ELSE 0 END)
           / SUM(CASE WHEN t.transaction_type = 'BUY' THEN t.quantity ELSE 0 END)
        ELSE 0
    END AS average_cost_basis,
    -- Total invested (BUY side cost)
    COALESCE(SUM(CASE WHEN t.transaction_type = 'BUY' THEN t.quantity * t.execution_price ELSE 0 END), 0)
        AS total_cost,
    MAX(t.executed_at) AS last_transacted_at
FROM public.transactions t
JOIN public.assets a ON a.id = t.asset_id
GROUP BY t.portfolio_id, t.asset_id, a.ticker, a.name, a.asset_type;
