import asyncio
import random
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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