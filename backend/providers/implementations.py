import os
import httpx
from .base import BaseMarketProvider, MarketProviderException, RateLimitException

class AlpacaProvider(BaseMarketProvider):
    """Market data provider using Alpaca's Market Data API."""
    
    def __init__(self):
        self.api_key = os.getenv("ALPACA_API_KEY", "")
        self.secret_key = os.getenv("ALPACA_SECRET_KEY", "")
        self.base_url = os.getenv("ALPACA_DATA_ENDPOINT", "https://data.alpaca.markets/v2")
        
        if not self.api_key or not self.secret_key:
            import logging
            logging.getLogger("cortif_backend.providers").warning("Alpaca API credentials not fully configured.")

    async def fetch_price(self, symbol: str, asset_type: str) -> float:
        if asset_type == "crypto":
            url = f"{self.base_url}/crypto/latest/trades?symbols={symbol}"
        else:
            # Default to stocks snapshot
            url = f"{self.base_url}/stocks/{symbol}/snapshot"
            
        headers = {
            "APCA-API-KEY-ID": self.api_key,
            "APCA-API-SECRET-KEY": self.secret_key,
            "accept": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=headers, timeout=5.0)
                
                if response.status_code == 429:
                    raise RateLimitException(f"Alpaca rate limited for {symbol}")
                elif response.status_code != 200:
                    raise MarketProviderException(f"Alpaca API error: {response.status_code} - {response.text}")
                
                data = response.json()
                
                if asset_type == "crypto":
                    # Parse crypto trade response
                    trades = data.get("trades", {})
                    symbol_data = trades.get(symbol, {})
                    if not symbol_data:
                        raise MarketProviderException(f"No price data found for {symbol}")
                    return float(symbol_data.get("p", 0.0))
                else:
                    # Parse stock snapshot response
                    latest_trade = data.get("latestTrade", {})
                    if not latest_trade:
                        raise MarketProviderException(f"No trade data in snapshot for {symbol}")
                    return float(latest_trade.get("p", 0.0))
                    
            except httpx.RequestError as exc:
                raise MarketProviderException(f"Alpaca connection error: {str(exc)}")


class TwelveDataProvider(BaseMarketProvider):
    """Market data provider using Twelve Data API as a fallback."""
    
    def __init__(self):
        self.api_key = os.getenv("TWELVEDATA_API_KEY", "")
        self.base_url = os.getenv("TWELVEDATA_API_ENDPOINT", "https://api.twelvedata.com")
        
        if not self.api_key:
            import logging
            logging.getLogger("cortif_backend.providers").warning("Twelve Data API key not configured.")

    async def fetch_price(self, symbol: str, asset_type: str) -> float:
        url = f"{self.base_url}/price"
        params = {
            "symbol": symbol,
            "apikey": self.api_key
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params, timeout=5.0)
                
                if response.status_code == 429:
                    raise RateLimitException(f"TwelveData rate limited for {symbol}")
                elif response.status_code != 200:
                    raise MarketProviderException(f"TwelveData HTTP error: {response.status_code}")
                
                data = response.json()
                
                # Twelve Data sometimes returns 200 with an error object inside
                if "status" in data and data["status"] == "error":
                    if data.get("code") == 429:
                        raise RateLimitException(f"TwelveData API rate limit: {data.get('message')}")
                    raise MarketProviderException(f"TwelveData API error: {data.get('message')}")
                
                if "price" not in data:
                    raise MarketProviderException(f"No price field in response for {symbol}")
                    
                return float(data["price"])
                
            except httpx.RequestError as exc:
                raise MarketProviderException(f"TwelveData connection error: {str(exc)}")
