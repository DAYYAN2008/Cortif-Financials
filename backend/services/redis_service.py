import os
import asyncio
import json
import logging
from datetime import datetime, timezone
import redis.asyncio as redis
import yfinance as yf
import websockets

logger = logging.getLogger("cortif_backend.redis")

# Connection pool setup
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

# ── Live Data Integration ──────────────────────────────────────────────────

def fetch_yahoo_finance_sync():
    """Fetch real market price updates from Yahoo Finance synchronously."""
    tickers = ["LUCK.KA", "ENGRO.KA", "OGDC.KA", "PTC.KA"]
    data = {}
    for ticker_symbol in tickers:
        try:
            ticker = yf.Ticker(ticker_symbol)
            fast_info = ticker.fast_info
            
            # Using fast_info for quickest access
            current_price = fast_info.last_price
            prev_price = fast_info.previous_close
            change_pct = ((current_price - prev_price) / prev_price) * 100 if prev_price else 0
            volume = fast_info.last_volume

            symbol = ticker_symbol.replace(".KA", "")
            data[symbol] = {
                "value": float(current_price) if current_price else 0.0,
                "volume": int(volume) if volume else 0,
                "change_percentage": float(change_pct)
            }
        except Exception as exc:
            logger.error("❌ Error fetching %s from yfinance: %s", ticker_symbol, exc)
    return data

async def poll_yahoo_finance():
    """Background loop to periodically fetch stock prices and save to Redis."""
    return # TODO: Partner API Hook
    logger.info("📡 Yahoo Finance polling loop started (interval=15s)")
    while True:
        try:
            stock_data = await asyncio.to_thread(fetch_yahoo_finance_sync)
            if stock_data:
                async with redis_client.pipeline(transaction=True) as pipe:
                    for ticker, data in stock_data.items():
                        pipe.hset("market:stocks", ticker, json.dumps(data))
                    pipe.expire("market:stocks", 120)  # 2-min TTL: auto-expire if poller crashes
                    await pipe.execute()
                logger.info("📈 Stock market data updated from Yahoo Finance")
        except redis.ConnectionError:
            logger.error("❌ Redis connection failed. Is Redis running?")
        except Exception as exc:
            logger.error("❌ Stock market data sync failed: %s", exc)
        await asyncio.sleep(15)

async def listen_binance_ws():
    """Background loop connecting to Binance WebSocket for Crypto/Forex prices."""
    return # TODO: Partner API Hook
    url = "wss://stream.binance.com:9443/ws/!ticker@arr"
    logger.info("📡 Binance WebSocket listener started")
    
    target_crypto = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"]
    target_forex = ["EURUSDT", "GBPUSDT"] # Simulating Forex with fiat-pegged pairs
    
    while True:
        try:
            async with websockets.connect(url) as ws:
                logger.info("✅ Connected to Binance WebSocket")
                while True:
                    message = await ws.recv()
                    data = json.loads(message)
                    
                    crypto_data = {}
                    forex_data = {}
                    
                    for item in data:
                        symbol = item['s']
                        if symbol in target_crypto:
                            crypto_data[symbol] = {
                                "value": float(item['c']),
                                "volume": float(item['v']),
                                "change_percentage": float(item['P'])
                            }
                        elif symbol in target_forex:
                            forex_data[symbol] = {
                                "value": float(item['c']),
                                "volume": float(item['v']),
                                "change_percentage": float(item['P'])
                            }
                            
                    if crypto_data or forex_data:
                        async with redis_client.pipeline(transaction=True) as pipe:
                            for sym, d in crypto_data.items():
                                pipe.hset("market:crypto", sym, json.dumps(d))
                            for sym, d in forex_data.items():
                                pipe.hset("market:forex", sym, json.dumps(d))
                            pipe.expire("market:crypto", 30)  # 30s TTL: real-time source
                            pipe.expire("market:forex", 30)
                            await pipe.execute()
        except websockets.ConnectionClosed:
            logger.warning("⚠️ Binance WebSocket connection closed, reconnecting in 5s...")
        except Exception as exc:
            logger.error("❌ Binance WS error: %s", exc)
        await asyncio.sleep(5)

async def market_data_sync_loop():
    """Background manager that runs the different polling/streaming tasks."""
    return # TODO: Partner API Hook
    # Run the Yahoo Finance poller and Binance listener concurrently
    try:
        await asyncio.gather(
            poll_yahoo_finance(),
            listen_binance_ws()
        )
    except asyncio.CancelledError:
        logger.info("🛑 market_data_sync_loop cancelled")


# ── Redis → WebSocket Broadcast ──────────────────────────────────────────────

async def get_market_snapshot() -> dict:
    """
    Read the latest market data from all Redis hashes and keys
    and format into a clean JSON payload for WebSocket clients.
    """
    from services.stock_service import DEFAULT_SYMBOLS
    
    # 1. Dynamically merge default symbols with any active tracked tickers from Redis
    tracked_tickers = await redis_client.smembers("market:tracked_tickers")
    if not tracked_tickers:
        tracked_tickers = set()
    all_symbols = list(set(DEFAULT_SYMBOLS).union(tracked_tickers))
    
    # For stocks, use mget on individual keys
    stock_keys = [f"market:stock:{sym}" for sym in all_symbols]
    
    # mget returns a list of values (or None) corresponding to the keys
    stocks_mget = []
    if stock_keys:
        stocks_mget = await redis_client.mget(*stock_keys)
        
    forex_raw = await redis_client.hgetall("market:forex")
    crypto_raw = await redis_client.hgetall("market:crypto")
    
    stocks = {}
    for sym, data in zip(all_symbols, stocks_mget):
        if data:
            stocks[sym] = json.loads(data)

    # Parse each hash entry from JSON string → dict
    forex = {
        pair: json.loads(data)
        for pair, data in forex_raw.items()
    }
    crypto = {
        name: json.loads(data)
        for name, data in crypto_raw.items()
    }

    # Return structure expected by the frontend
    return {
        "stocks": stocks,
        "forex": forex,
        "commodities": crypto, # Map crypto to commodities key for now
        "crypto": crypto,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


async def market_broadcast_loop():
    """
    Background loop that reads from Redis every 1 second
    and broadcasts the snapshot to all connected WebSocket clients.
    
    Import ConnectionManager here (not at module level) to
    prevent circular imports.
    """
    return # TODO: Partner API Hook
    from services.websocket_manager import manager

    logger.info("📡 Market broadcast loop started (interval=1s)")
    
    _last_known_good_snapshot = {
        "stocks": {},
        "forex": {},
        "commodities": {},
        "crypto": {},
        "status": "connecting",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    while True:
        try:
            if manager.client_count > 0:
                snapshot = await get_market_snapshot()
                if snapshot:
                    _last_known_good_snapshot = snapshot
                    _last_known_good_snapshot["status"] = "connected"
                    await manager.broadcast(snapshot)
        except (redis.ConnectionError, redis.TimeoutError, redis.RedisError) as exc:
            logger.error(f"🚨 [SYSTEM ALERT] Redis connection failed during broadcast: {exc}")
            # Fallback to last known good snapshot, keep connections alive
            _last_known_good_snapshot["timestamp"] = datetime.now(timezone.utc).isoformat()
            
            # If we were previously connected, switch to stale. If we were connecting, stay connecting.
            if _last_known_good_snapshot.get("status") == "connected":
                _last_known_good_snapshot["status"] = "stale"
                
            if manager.client_count > 0:
                await manager.broadcast(_last_known_good_snapshot)
        except Exception as exc:
            logger.error("❌ Broadcast loop error: %s", exc)
        await asyncio.sleep(1)
