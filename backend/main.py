import asyncio

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

from dependencies import get_current_user, get_supabase_client
from routers.portfolio import router as portfolio_router

from services.news_service import sync_external_news, get_latest_news

from services.redis_service import market_data_sync_loop, market_broadcast_loop, redis_client
from services.websocket_manager import manager

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
    Spawns background tasks on startup and cancels on shutdown.
    """
    news_task = asyncio.create_task(_news_sync_loop())
    logger.info("🚀 News sync background task started (interval=%ds)", NEWS_SYNC_INTERVAL)
    
    # TODO: Partner API Hook
    # market_data_task = asyncio.create_task(market_data_sync_loop())
    # logger.info("🚀 Market data sync background task started (interval=5s)")
    
    # broadcast_task = asyncio.create_task(market_broadcast_loop())
    # logger.info("🚀 Market broadcast loop started (interval=1s)")
    
    yield
    
    news_task.cancel()
    logger.info("🛑 News sync background task stopped")
    
    # TODO: Partner API Hook
    # market_data_task.cancel()
    # logger.info("🛑 Market data sync background task stopped")
    
    # broadcast_task.cancel()
    # logger.info("🛑 Market broadcast loop stopped")
    
    await redis_client.aclose()
    logger.info("🛑 Redis connection closed")


app = FastAPI(
    title="Cortif AI Backend",
    version="1.0.0",
    lifespan=lifespan,
)

import os
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000")
origins = [origin.strip() for origin in origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(portfolio_router)

@app.get("/")
def read_root():
   return {"status": "AI Backend is running!"}






# ── Market Data WebSocket (Redis → Frontend) ────────────────────────────────

@app.websocket("/ws/markets")
async def websocket_markets(websocket: WebSocket):
    """
    WebSocket endpoint for real-time market data.
    
    Clients connect here and receive automatic broadcasts
    every 1 second from the market_broadcast_loop which
    reads directly from the Redis cache.
    """
    await manager.connect(websocket)
    try:
        # Keep connection alive — listen for client pings/messages
        while True:
            # TODO: Partner API Hook
            # Wait for any message (ping/pong keepalive)
            # await websocket.receive_text()
            await asyncio.sleep(1) # Silent idle loop to prevent loud disconnection errors
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


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


@app.post("/api/news/sync", status_code=202)
async def trigger_news_sync(background_tasks: BackgroundTasks):
    """
    Manually trigger an RSS feed sync in the background.
    """
    try:
        background_tasks.add_task(sync_external_news)
        return {"status": "Sync triggered in background"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ── Auth Routes ──────────────────────────────────────────────────────────────

@app.get("/api/v1/auth/me")
async def get_my_profile(user_id: str = Depends(get_current_user)):
    """
    Returns the current authenticated user's profile from the database.
    """
    supabase = get_supabase_client()
    try:
        result = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return {"user_id": user_id, "profile": result.data[0]}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
