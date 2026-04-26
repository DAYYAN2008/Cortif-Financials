import asyncio
import random
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services.news_service import sync_external_news, get_latest_news
from services.stock_service import get_authentic_stock_data

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

def fetch_real_updates():
    """Fetch real market price updates."""
    return get_authentic_stock_data()

@app.websocket("/ws/ticker")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Fetch real data (internally cached for 60s)
            data = await asyncio.to_thread(fetch_real_updates)
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