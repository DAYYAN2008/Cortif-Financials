"""
Portfolio Router — Transaction Ledger & Holdings Hydration
──────────────────────────────────────────────────────────
Endpoints:
  POST /api/v1/portfolio/transactions   → log a BUY / SELL trade
  GET  /api/v1/portfolio/transactions   → full transaction history
  GET  /api/v1/portfolio/holdings       → live holdings from DB view
"""

from __future__ import annotations

import logging
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, field_validator
from supabase import Client

# Consume the request-scoped authorized token client context
from dependencies import get_authenticated_context

logger = logging.getLogger("cortif_backend.portfolio")

# ── Router ──────────────────────────────────────────────────────────────────
router = APIRouter(prefix="/api/v1/portfolio", tags=["Portfolio"])


# ── Enums ───────────────────────────────────────────────────────────────────
class AssetType(str, Enum):
    stock = "stock"
    crypto = "crypto"
    commodity = "commodity"


class TransactionType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


# ── Request / Response Models ───────────────────────────────────────────────
class TransactionCreate(BaseModel):
    """Payload for logging a new trade."""

    ticker: str = Field(..., min_length=1, max_length=10, description="Asset ticker symbol")
    asset_name: str = Field(..., min_length=1, description="Human-readable asset name")
    asset_type: AssetType
    transaction_type: TransactionType
    quantity: float = Field(..., gt=0, description="Must be > 0")
    execution_price: float = Field(..., gt=0, description="Price per unit, must be > 0")
    executed_at: datetime = Field(..., description="Timestamp of execution")

    @field_validator("ticker")
    @classmethod
    def ticker_uppercase(cls, v: str) -> str:
        return v.strip().upper()


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


# ── Helper: get-or-create portfolio ─────────────────────────────────────────
def _ensure_portfolio(supabase, user_id: str) -> str:
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

    # Auto-create default portfolio
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


# ── Helper: get-or-create asset ─────────────────────────────────────────────
def _ensure_asset(supabase, ticker: str, asset_name: str, asset_type: str) -> str:
    """Return the asset ID, creating it if necessary (upsert by ticker)."""
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
        .insert({
            "ticker": ticker,
            "name": asset_name,
            "asset_type": asset_type,
        })
        .execute()
    )
    if not insert.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create asset record for {ticker}",
        )
    logger.info("Created asset record: %s (%s)", ticker, asset_type)
    return insert.data[0]["id"]


# ── SELL validation against holdings view ───────────────────────────────────
def _validate_sell(supabase, portfolio_id: str, asset_id: str, sell_qty: float) -> None:
    """Raise HTTP 400 if the user does not have enough holdings to cover the sale."""
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


# ═════════════════════════════════════════════════════════════════════════════
#  ENDPOINTS
# ═════════════════════════════════════════════════════════════════════════════


@router.post(
    "/transactions",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log a BUY or SELL trade",
)
def create_transaction(
    payload: TransactionCreate,
    auth_context: tuple[str, Client] = Depends(get_authenticated_context),
):
    """Logs a new transaction to the ledger using fully authorized RLS clients."""
    user_id, supabase = auth_context

    try:
        # 1. Portfolio
        portfolio_id = _ensure_portfolio(supabase, user_id)

        # 2. Asset
        asset_id = _ensure_asset(
            supabase,
            ticker=payload.ticker,
            asset_name=payload.asset_name,
            asset_type=payload.asset_type.value,
        )

        # 3. SELL guard
        if payload.transaction_type == TransactionType.SELL:
            _validate_sell(supabase, portfolio_id, asset_id, payload.quantity)

        # 4. Insert transaction
        tx_data = {
            "portfolio_id": portfolio_id,
            "asset_id": asset_id,
            "transaction_type": payload.transaction_type.value,
            "quantity": payload.quantity,
            "execution_price": payload.execution_price,
            "executed_at": payload.executed_at.isoformat(),
        }
        result = supabase.table("transactions").insert(tx_data).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Transaction insert returned no data",
            )

        row = result.data[0]
        return TransactionResponse(
            id=row["id"],
            portfolio_id=row["portfolio_id"],
            asset_id=row["asset_id"],
            ticker=payload.ticker,
            asset_name=payload.asset_name,
            transaction_type=row["transaction_type"],
            quantity=float(row["quantity"]),
            execution_price=float(row["execution_price"]),
            executed_at=row["executed_at"],
            created_at=row["created_at"],
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Transaction creation failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error: {exc}",
        )


@router.get(
    "/transactions",
    response_model=list[TransactionResponse],
    summary="Get full transaction history",
)
def list_transactions(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    auth_context: tuple[str, Client] = Depends(get_authenticated_context),
):
    """Returns the user's transaction history via their authenticated account context."""
    user_id, supabase = auth_context

    try:
        portfolio_id = _ensure_portfolio(supabase, user_id)

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
        )


@router.get(
    "/holdings",
    response_model=list[HoldingResponse],
    summary="Get active holdings from the portfolio summary view",
)
def get_holdings(
    auth_context: tuple[str, Client] = Depends(get_authenticated_context),
):
    """Queries the summary view to return pre-calculated values using the user session token."""
    user_id, supabase = auth_context

    try:
        portfolio_id = _ensure_portfolio(supabase, user_id)

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
        )