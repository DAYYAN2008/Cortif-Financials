"""
Transaction routes — asset catalog upsert + ledger insert.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from dependencies import get_authenticated_context
from services.portfolio_service import (
    VALID_ASSET_TYPES,
    VALID_TRANSACTION_TYPES,
    ensure_asset,
    resolve_portfolio_id,
    validate_sell,
)

logger = logging.getLogger("cortif_backend.transactions")

router = APIRouter(prefix="/api", tags=["Transactions"])


class TransactionCreate(BaseModel):
    portfolio_id: Optional[str] = Field(
        None, description="Target portfolio; auto-resolved if omitted"
    )
    ticker: str = Field(..., min_length=1, max_length=10)
    asset_name: str = Field(..., min_length=1)
    asset_type: str
    transaction_type: str
    quantity: float = Field(..., gt=0)
    execution_price: float = Field(..., gt=0)
    executed_at: datetime

    @field_validator("ticker")
    @classmethod
    def ticker_uppercase(cls, value: str) -> str:
        return value.strip().upper()

    @field_validator("asset_type")
    @classmethod
    def asset_type_lower(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in VALID_ASSET_TYPES:
            raise ValueError(
                f"asset_type must be one of: {', '.join(sorted(VALID_ASSET_TYPES))}"
            )
        return normalized

    @field_validator("transaction_type")
    @classmethod
    def transaction_type_upper(cls, value: str) -> str:
        normalized = value.strip().upper()
        if normalized not in VALID_TRANSACTION_TYPES:
            raise ValueError(
                "transaction_type must be one of: "
                f"{', '.join(sorted(VALID_TRANSACTION_TYPES))}"
            )
        return normalized


class TransactionResponse(BaseModel):
    id: str
    portfolio_id: str
    asset_id: str
    ticker: str
    asset_name: str
    transaction_type: str
    quantity: float
    execution_price: float
    executed_at: str
    created_at: str


@router.post(
    "/transactions",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log a BUY or SELL trade",
)
def create_transaction(
    payload: TransactionCreate,
    auth: tuple[str, object] = Depends(get_authenticated_context),
):
    """
    Upsert asset by ticker, then insert a transaction row.

    Enum normalization:
      - asset_type  → lowercase (stock | crypto | commodity)
      - transaction_type → uppercase (BUY | SELL)
    """
    user_id, supabase = auth

    try:
        portfolio_id = resolve_portfolio_id(supabase, user_id, payload.portfolio_id)

        asset_id = ensure_asset(
            supabase,
            ticker=payload.ticker,
            asset_name=payload.asset_name.strip(),
            asset_type=payload.asset_type,
        )

        if payload.transaction_type == "SELL":
            validate_sell(supabase, portfolio_id, asset_id, payload.quantity)

        tx_data = {
            "portfolio_id": portfolio_id,
            "asset_id": asset_id,
            "transaction_type": payload.transaction_type,
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
            asset_name=payload.asset_name.strip(),
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
        ) from exc
