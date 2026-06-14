"""
Portfolio Router — Transaction Ledger & Holdings Hydration
──────────────────────────────────────────────────────────
Endpoints:
  GET  /api/v1/portfolio              → resolve user's portfolio
  GET  /api/v1/portfolio/transactions → full transaction history
  GET  /api/v1/portfolio/holdings     → live holdings from DB view

POST /api/transactions lives in routes/transactions.py
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from dependencies import get_authenticated_context
from services.portfolio_service import ensure_portfolio

logger = logging.getLogger("cortif_backend.portfolio")

router = APIRouter(prefix="/api/v1/portfolio", tags=["Portfolio"])


class PortfolioResponse(BaseModel):
    id: str
    name: str


class TransactionResponse(BaseModel):
    id: str
    portfolio_id: str
    asset_id: str
    ticker: Optional[str] = None
    asset_name: Optional[str] = None
    transaction_type: str
    quantity: float
    execution_price: float
    executed_at: str
    created_at: str


class HoldingResponse(BaseModel):
    portfolio_id: str
    asset_id: str
    ticker: str
    asset_name: str
    asset_type: str
    net_quantity: float
    average_cost_basis: float
    total_cost: float
    last_transacted_at: str


@router.get(
    "",
    response_model=PortfolioResponse,
    summary="Get or create the user's default portfolio",
)
def get_portfolio(
    auth: tuple[str, object] = Depends(get_authenticated_context),
):
    user_id, supabase = auth
    try:
        portfolio_id = ensure_portfolio(supabase, user_id)
        result = (
            supabase.table("portfolios")
            .select("id, name")
            .eq("id", portfolio_id)
            .limit(1)
            .execute()
        )
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Portfolio lookup failed",
            )
        row = result.data[0]
        return PortfolioResponse(id=row["id"], name=row["name"] or "Main Portfolio")
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to resolve portfolio")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error: {exc}",
        ) from exc


@router.get(
    "/transactions",
    response_model=list[TransactionResponse],
    summary="Get full transaction history",
)
def list_transactions(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    auth: tuple[str, object] = Depends(get_authenticated_context),
):
    """Returns the user's transaction history, newest first."""
    user_id, supabase = auth

    try:
        portfolio_id = ensure_portfolio(supabase, user_id)

        result = (
            supabase.table("transactions")
            .select("*, assets(ticker, name)")
            .eq("portfolio_id", portfolio_id)
            .order("executed_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        transactions = []
        for row in result.data or []:
            asset_info = row.get("assets") or {}
            transactions.append(
                TransactionResponse(
                    id=row["id"],
                    portfolio_id=row["portfolio_id"],
                    asset_id=row["asset_id"],
                    ticker=asset_info.get("ticker"),
                    asset_name=asset_info.get("name"),
                    transaction_type=row["transaction_type"],
                    quantity=float(row["quantity"]),
                    execution_price=float(row["execution_price"]),
                    executed_at=row["executed_at"],
                    created_at=row["created_at"],
                )
            )
        return transactions

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch transaction history")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error: {exc}",
        ) from exc


@router.get(
    "/holdings",
    response_model=list[HoldingResponse],
    summary="Get active holdings from the portfolio summary view",
)
def get_holdings(
    auth: tuple[str, object] = Depends(get_authenticated_context),
):
    """
    Queries `portfolio_holdings_summary` for net_quantity and average_cost_basis.
    Only returns positions with net_quantity > 0.
    """
    user_id, supabase = auth

    try:
        portfolio_id = ensure_portfolio(supabase, user_id)

        result = (
            supabase.table("portfolio_holdings_summary")
            .select("*")
            .eq("portfolio_id", portfolio_id)
            .gt("net_quantity", 0)
            .execute()
        )

        holdings = []
        for row in result.data or []:
            holdings.append(
                HoldingResponse(
                    portfolio_id=row["portfolio_id"],
                    asset_id=row["asset_id"],
                    ticker=row["ticker"],
                    asset_name=row["asset_name"],
                    asset_type=row["asset_type"],
                    net_quantity=float(row["net_quantity"]),
                    average_cost_basis=float(row["average_cost_basis"]),
                    total_cost=float(row["total_cost"]),
                    last_transacted_at=row["last_transacted_at"],
                )
            )
        return holdings

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch holdings")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error: {exc}",
        ) from exc
