"""Shared portfolio / transaction helpers used by API routes."""

from __future__ import annotations

import logging

from fastapi import HTTPException, status

logger = logging.getLogger("cortif_backend.portfolio")

VALID_ASSET_TYPES = {"stock", "crypto", "commodity"}
VALID_TRANSACTION_TYPES = {"BUY", "SELL"}


def normalize_asset_type(value: str) -> str:
    normalized = value.strip().lower()
    if normalized not in VALID_ASSET_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"asset_type must be one of: {', '.join(sorted(VALID_ASSET_TYPES))}",
        )
    return normalized


def normalize_transaction_type(value: str) -> str:
    normalized = value.strip().upper()
    if normalized not in VALID_TRANSACTION_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"transaction_type must be one of: {', '.join(sorted(VALID_TRANSACTION_TYPES))}",
        )
    return normalized


def ensure_portfolio(supabase, user_id: str) -> str:
    """Return the user's portfolio ID, creating a default one if necessary."""
    result = (
        supabase.table("portfolios")
        .select("id")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if result.data:
        return result.data[0]["id"]

    insert = (
        supabase.table("portfolios")
        .insert({"user_id": user_id, "name": "Main Portfolio"})
        .execute()
    )
    if not insert.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create default portfolio",
        )
    logger.info("Created default portfolio for user %s", user_id)
    return insert.data[0]["id"]


def resolve_portfolio_id(supabase, user_id: str, portfolio_id: str | None) -> str:
    """Validate an explicit portfolio_id or auto-resolve the user's default."""
    if not portfolio_id:
        return ensure_portfolio(supabase, user_id)

    result = (
        supabase.table("portfolios")
        .select("id")
        .eq("id", portfolio_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found",
        )
    return portfolio_id


def ensure_asset(supabase, ticker: str, asset_name: str, asset_type: str) -> str:
    """Return the asset ID, creating it if necessary (lookup by ticker)."""
    result = (
        supabase.table("assets")
        .select("id")
        .eq("ticker", ticker)
        .limit(1)
        .execute()
    )
    if result.data:
        return result.data[0]["id"]

    insert = (
        supabase.table("assets")
        .insert(
            {
                "ticker": ticker,
                "name": asset_name,
                "asset_type": asset_type,
            }
        )
        .execute()
    )
    if not insert.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create asset record for {ticker}",
        )
    logger.info("Created asset record: %s (%s)", ticker, asset_type)
    return insert.data[0]["id"]


def validate_sell(
    supabase, portfolio_id: str, asset_id: str, sell_qty: float
) -> None:
    """Raise HTTP 400 if holdings are insufficient for the sale."""
    result = (
        supabase.table("portfolio_holdings_summary")
        .select("net_quantity")
        .eq("portfolio_id", portfolio_id)
        .eq("asset_id", asset_id)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient holdings for this sale — you do not own this asset",
        )

    current_qty = float(result.data[0]["net_quantity"])
    if current_qty < sell_qty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Insufficient holdings for this sale. "
                f"You hold {current_qty}, attempted to sell {sell_qty}"
            ),
        )
