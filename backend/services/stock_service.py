import yfinance as yf
import logging
import math
import requests
from typing import List, Dict
import time
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger("stock_service")
_session = requests.Session()
METADATA_CACHE_TTL = 3600

# Minimum of 40 symbols: Mix of NASDAQ, Crypto, and KSE-100
# Updated list with .PSX suffixes and corrected POL symbol
DEFAULT_SYMBOLS = [
    # NASDAQ / NYSE
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "NFLX", "AMD", "INTC", 
    "CSCO", "PEP", "AVGO", "TXN", "QCOM", "COST", "SBUX", "AMGN", "DIS", "BA",
    # Crypto
    "BTC-USD", "ETH-USD", "SOL-USD", "XRP-USD", "ADA-USD", "DOGE-USD", "DOT-USD", "LINK-USD",
    # KSE-100 (Updated from .KA to .PSX)
    "EFERT.PSX", "HUBC.PSX", "LUCK.PSX", "OGDC.PSX", "PPL.PSX", "MCB.PSX", 
    "UBL.PSX", "HBL.PSX", "SYS.PSX", "TRG.PSX", "MEBL.PSX", "PSO.PSX", "POL.PSX",
    # ETFs
    "SPY", "QQQ"
]

class StockService:
    def __init__(self):
        self.cache = {}  # Last Known Good (LKG) cache: symbol -> dict
        self.metadata_cache = {}
        self.adaptive_state = {
            "last_updated": 0,
            "current_duration": 10,
            "fail_count": 0
        }

    def _sanitize_symbol(self, symbol: str) -> str:
        """Strip Cashtags, whitespace and normalize case."""
        if not symbol:
            return ""
        return symbol.lstrip('$').strip().upper()

    def _fetch_single_backup(self, symbol: str) -> Dict:
        """Helper for parallel backup fetching."""
        try:
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1m&range=1d"
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            response = _session.get(url, headers=headers, timeout=5)
            if response.status_code == 200:
                data = response.json()
                meta = data['chart']['result'][0]['meta']
                price = meta.get('regularMarketPrice')
                prev_close = meta.get('previousClose')
                
                if price is None or math.isnan(price):
                    return None

                change_pct = 0.0
                if prev_close and not math.isnan(prev_close) and prev_close != 0:
                    change_pct = ((price - prev_close) / prev_close) * 100
                
                return {
                    "symbol": symbol.split('-')[0] if '-' in symbol else symbol,
                    "price": round(price, 2),
                    "change": round(change_pct, 2),
                    "stale": False
                }
        except Exception as e:
            logger.error(f"Backup fetch failed for {symbol}: {e}")
        return None

    def _fetch_from_backup(self, symbols: List[str]) -> List[Dict]:
        """
        Backup source: Parallel hits to Yahoo Finance Query API.
        """
        results = []
        with ThreadPoolExecutor(max_workers=min(len(symbols), 10)) as executor:
            futures = [executor.submit(self._fetch_single_backup, s) for s in symbols]
            for f in futures:
                res = f.result()
                if res:
                    results.append(res)
        return results

    def get_authentic_stock_data(self, symbols: List[str] = None) -> List[Dict]:
        """
        Fetch real-time stock data with adaptive refresh rates and fallback sources.
        """
        current_time = time.time()
        is_default = symbols is None
        
        if is_default:
            symbols = DEFAULT_SYMBOLS
            # Check if cache is still valid based on adaptive duration
            if self.cache and (current_time - self.adaptive_state["last_updated"] < self.adaptive_state["current_duration"]):
                # Ensure we return a list of all cached symbols
                return list(self.cache.values())

        # Priority: Sanitize all input symbols immediately
        symbols = [self._sanitize_symbol(s) for s in symbols if s]

        results = []
        logger.info(f"Fetching market data (Refresh Rate: {self.adaptive_state['current_duration']}s)")
        
        try:
            # Primary Source: yfinance batch download
            data = yf.download(
                tickers=" ".join(symbols),
                period="1d",
                interval="1m",
                group_by='ticker',
                auto_adjust=True,
                prepost=True,
                threads=True,
                progress=False
            )
            
            if data.empty:
                # If entire batch is empty, it's likely a block/rate-limit
                raise ValueError("yfinance returned empty data (potential block/rate-limit)")

            missing_symbols = []

            for symbol in symbols:
                try:
                    # Handle single vs multi-ticker dataframe structure
                    ticker_df = data[symbol] if len(symbols) > 1 else data
                    
                    if ticker_df.empty:
                        if symbol in self.cache:
                            lkg = self.cache[symbol].copy()
                            lkg["stale"] = True
                            results.append(lkg)
                        else:
                            missing_symbols.append(symbol)
                        continue
                        
                    price_val = ticker_df.iloc[-1]['Close']
                    if price_val is None or math.isnan(price_val):
                        if symbol in self.cache:
                            lkg = self.cache[symbol].copy()
                            lkg["stale"] = True
                            results.append(lkg)
                        else:
                            missing_symbols.append(symbol)
                        continue
                    
                    price = float(price_val)
                    
                    # Use metadata cache for previous_close to avoid expensive Ticker() calls
                    now = time.time()
                    cache_entry = self.metadata_cache.get(symbol)
                    
                    if cache_entry and (now - cache_entry['timestamp'] < METADATA_CACHE_TTL):
                        prev_close = cache_entry['prev_close']
                    else:
                        ticker = yf.Ticker(symbol)
                        prev_close = ticker.fast_info.previous_close
                        if prev_close and not math.isnan(prev_close):
                            self.metadata_cache[symbol] = {
                                'prev_close': prev_close,
                                'timestamp': now
                            }
                    
                    change_pct = 0.0
                    if prev_close and not math.isnan(prev_close) and prev_close != 0:
                        change_pct = ((price - prev_close) / prev_close) * 100

                    stock_obj = {
                        "symbol": symbol.split('-')[0] if '-' in symbol else symbol,
                        "price": round(price, 2),
                        "change": round(change_pct, 2),
                        "stale": False
                    }
                    results.append(stock_obj)
                    self.cache[symbol] = stock_obj
                    
                except Exception as e:
                    # Look up self.cache on any other exception (e.g., symbol missing from dataframe)
                    if symbol in self.cache:
                        lkg = self.cache[symbol].copy()
                        lkg["stale"] = True
                        results.append(lkg)
                    else:
                        missing_symbols.append(symbol)
                    continue

            if missing_symbols:
                backup_results = self._fetch_from_backup(missing_symbols)
                backup_dict = {res["symbol"]: res for res in backup_results}
                for orig_sym in missing_symbols:
                    clean_sym = orig_sym.split('-')[0] if '-' in orig_sym else orig_sym
                    if clean_sym in backup_dict:
                        res = backup_dict[clean_sym].copy()
                        res["stale"] = True # Marking as stale because it came from fallback
                        results.append(res)
                        self.cache[orig_sym] = res

            # Success: Reset adaptive cooling
            if results:
                self.adaptive_state["fail_count"] = 0
                self.adaptive_state["current_duration"] = 10 # Reset to 10s
                if is_default:
                    self.adaptive_state["last_updated"] = current_time
                
        except Exception as e:
            error_str = str(e).lower()
            # Only trigger backoff if it's a known blocking error or total failure
            is_blocking = any(code in error_str for code in ["429", "403", "forbidden", "too many requests", "rate-limit"])
            
            if is_blocking or not results:
                logger.warning(f"Primary source blocked or failed: {e}. Incrementing adaptive backoff...")
                self.adaptive_state["fail_count"] += 1
                self.adaptive_state["current_duration"] = min(300, 10 * (2 ** self.adaptive_state["fail_count"]))
            else:
                logger.warning(f"Primary source had partial failure: {e}. Skipping backoff increase.")
            
            # Try Backup Source immediately for symbols not in results
            already_fetched = {res["symbol"] for res in results}
            remaining_symbols = [s for s in symbols if s.split('-')[0] not in already_fetched]
            
            if remaining_symbols:
                backup_results = self._fetch_from_backup(remaining_symbols)
                backup_dict = {res["symbol"]: res for res in backup_results}
                for symbol in remaining_symbols:
                    clean_symbol = symbol.split('-')[0] if '-' in symbol else symbol
                    if clean_symbol in backup_dict:
                        res = backup_dict[clean_symbol]
                        results.append(res)
                        self.cache[symbol] = res
                    elif symbol in self.cache:
                        lkg = self.cache[symbol].copy()
                        lkg["stale"] = True
                        results.append(lkg)
            
            if results and is_default:
                self.adaptive_state["last_updated"] = current_time

        return results

# Singleton instance to preserve old API footprint
_stock_service_instance = StockService()

def get_authentic_stock_data(symbols: List[str] = None) -> List[Dict]:
    return _stock_service_instance.get_authentic_stock_data(symbols)
