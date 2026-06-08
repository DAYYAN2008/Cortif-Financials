"""
WebSocket Connection Manager for real-time market data broadcasting.

Manages a pool of connected WebSocket clients and provides
methods to broadcast JSON payloads to all of them concurrently.
"""

import logging
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger("cortif_backend.ws")


class ConnectionManager:
    """
    Manages active WebSocket connections.

    Provides thread-safe methods to add/remove clients and
    broadcast messages to the entire pool.
    """

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accept and register a new WebSocket client."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(
            "🔌 WebSocket client connected (total: %d)",
            len(self.active_connections),
        )

    def disconnect(self, websocket: WebSocket):
        """Remove a disconnected WebSocket client."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(
            "🔌 WebSocket client disconnected (total: %d)",
            len(self.active_connections),
        )

    async def broadcast(self, payload: dict):
        """
        Send a JSON payload to all connected clients.
        Disconnected or errored clients are pruned automatically.
        """
        stale: list[WebSocket] = []
        for connection in self.active_connections:
            try:
                await connection.send_json(payload)
            except Exception:
                stale.append(connection)

        # Prune broken connections
        for ws in stale:
            self.disconnect(ws)

    @property
    def client_count(self) -> int:
        return len(self.active_connections)


# Singleton instance used across the application
manager = ConnectionManager()
