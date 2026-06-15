import json
import logging
from typing import Dict, List, Optional
import redis.asyncio as redis

# Using relative import if within backend or absolute depending on PYTHONPATH
from backend.providers.base import BaseMarketProvider, RateLimitException, MarketProviderException

logger = logging.getLogger("cortif_backend.market_router")

class MarketDataRouter:
    """Routes market data requests through cache and registered provider pools."""

    def __init__(self, redis_client: redis.Redis):
        self.redis_client = redis_client
        self.providers: Dict[str, List[BaseMarketProvider]] = {
            "stock": [],
            "crypto": [],
            "commodity": []
        }

    def register_provider(self, asset_type: str, provider: BaseMarketProvider):
        """Register a new provider for a specific asset type."""
        if asset_type not in self.providers:
            self.providers[asset_type] = []
        self.providers[asset_type].append(provider)
        logger.info(f"Registered {provider.__class__.__name__} for asset type '{asset_type}'")

    async def _check_cache(self, symbol: str, asset_type: str) -> Optional[float]:
        """Check Redis for the current price of the symbol."""
        try:
            # Map asset_type to the hash keys used in redis_service.py
            # stock -> market:stocks, crypto -> market:crypto, commodity -> market:crypto (temporarily)
            if asset_type == "stock":
                hash_key = "market:stocks"
            elif asset_type == "crypto":
                hash_key = "market:crypto"
            elif asset_type == "forex":
                hash_key = "market:forex"
            else:
                hash_key = f"market:{asset_type}"
                
            raw_data = await self.redis_client.hget(hash_key, symbol)
            if raw_data:
                data = json.loads(raw_data)
                if "value" in data:
                    return float(data["value"])
        except Exception as exc:
            logger.warning(f"Cache check failed for {symbol} ({asset_type}): {exc}")
        
        return None

    async def get_price(self, symbol: str, asset_type: str) -> float:
        """
        Get price by checking cache first, then sequentially querying providers.
        """
        # 1. Check Redis Cache
        cached_price = await self._check_cache(symbol, asset_type)
        if cached_price is not None:
            return cached_price
            
        # 2. Sequential fallback through providers
        registered_providers = self.providers.get(asset_type, [])
        if not registered_providers:
            raise MarketProviderException(f"No providers registered for asset type '{asset_type}'")

        for provider in registered_providers:
            try:
                price = await provider.fetch_price(symbol, asset_type)
                logger.info(f"Successfully fetched price for {symbol} from {provider.__class__.__name__}")
                return price
            except RateLimitException as exc:
                logger.warning(f"Rate limited by {provider.__class__.__name__} for {symbol}: {exc}. Trying next provider...")
                continue
            except MarketProviderException as exc:
                logger.warning(f"Provider {provider.__class__.__name__} failed for {symbol}: {exc}. Trying next provider...")
                continue
            except Exception as exc:
                logger.error(f"Unexpected error with {provider.__class__.__name__} for {symbol}: {exc}. Trying next provider...")
                continue

        raise MarketProviderException(f"All providers exhausted or failed for {symbol} ({asset_type})")
