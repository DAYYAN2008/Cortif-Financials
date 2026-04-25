import asyncio
import random
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services.news_service import sync_external_news, get_latest_news

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cortif_backend")

# ── Sync interval (seconds) ────────────────────────────────────────────────
NEWS_SYNC_INTERVAL = 30 * 60  # 30 minutes


async def _news_sync_loop() -> None:
    """Background loop: sync RSS feeds on startup, then every 30 minutes."""
    while True:
        logger.info("⏳ Running scheduled news sync …")
        try:
            result = await asyncio.to_thread(sync_external_news)
            logger.info(
                "✅ News sync complete — fetched=%d  inserted=%d  errors=%d",
                result["fetched"],
                result["inserted"],
                len(result["errors"]),
            )
        except Exception as exc:
            logger.error("❌ Scheduled news sync failed: %s", exc)
        await asyncio.sleep(NEWS_SYNC_INTERVAL)


@asynccontextmanager
async def lifespan(application: FastAPI):
    """
    Modern FastAPI lifespan handler.
    Spawns the news-sync background task on startup and
    cancels it on shutdown.
    """
    task = asyncio.create_task(_news_sync_loop())
    logger.info("🚀 News sync background task started (interval=%ds)", NEWS_SYNC_INTERVAL)
    yield
    task.cancel()
    logger.info("🛑 News sync background task stopped")


app = FastAPI(
    title="Cortif AI Backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Your Next.js URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
   return {"status": "AI Backend is running!"}

# Mock initial stock data
mock_stocks = [
    {"symbol": "AAPL", "price": 173.50, "change": 1.25},
    {"symbol": "MSFT", "price": 415.30, "change": -0.80},
    {"symbol": "GOOGL", "price": 142.10, "change": 2.10},
    {"symbol": "AMZN", "price": 178.20, "change": 0.50},
    {"symbol": "NVDA", "price": 875.40, "change": 5.20},
    {"symbol": "TSLA", "price": 202.50, "change": -1.50},
    {"symbol": "META", "price": 505.20, "change": 3.40},
]

def generate_mock_updates():
    """Simulate live price updates."""
    updated_stocks = []
    for stock in mock_stocks:
        # Simulate a small price movement (-1% to 1%)
        change_percent = random.uniform(-0.01, 0.01)
        new_price = stock["price"] * (1 + change_percent)
        
        # Simulate change value
        new_change = stock["change"] + random.uniform(-0.5, 0.5)
        
        # Update mock stocks for continuous simulation
        stock["price"] = new_price
        stock["change"] = new_change
        
        updated_stocks.append({
            "symbol": stock["symbol"],
            "price": round(new_price, 2),
            "change": round(new_change, 2)
        })
    return updated_stocks

@app.websocket("/ws/ticker")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Generate new data
            data = generate_mock_updates()
            # Send data to client
            await websocket.send_json(data)
            # Broadcast every 2-5 seconds
            await asyncio.sleep(random.uniform(2, 5))
    except WebSocketDisconnect:
        print("Client disconnected")


# ── News Hub Routes ─────────────────────────────────────────────────────────

@app.get("/api/news/latest")
async def get_latest_articles(limit: int = Query(default=8, ge=1, le=50)):
    """
    Return the most recent articles from the external_news table.
    Defaults to 8 articles, max 50.
    """
    try:
        articles = get_latest_news(limit=limit)
        return {"articles": articles, "count": len(articles)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/news/sync")
async def trigger_news_sync():
    """
    Manually trigger an RSS feed sync.
    Fetches articles from all configured feeds and upserts into Supabase.
    """
    try:
        result = sync_external_news()
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))