from abc import ABC, abstractmethod

class MarketProviderException(Exception):
    """Base exception for all market provider errors."""
    pass

class RateLimitException(MarketProviderException):
    """Raised when an API rate limit (HTTP 429) is hit."""
    pass

class BaseMarketProvider(ABC):
    """Abstract base class for all market data providers."""

    @abstractmethod
    async def fetch_price(self, symbol: str, asset_type: str) -> float:
        """
        Fetch the current price of a given symbol.
        
        Args:
            symbol (str): The ticker symbol (e.g., 'AAPL', 'BTCUSDT').
            asset_type (str): The type of asset ('stock', 'crypto', 'commodity').
            
        Returns:
            float: The current price.
            
        Raises:
            RateLimitException: If the provider is rate limited (HTTP 429).
            MarketProviderException: For other API or network errors.
        """
        pass
