import asyncio
import websockets
import json

async def test():
    async with websockets.connect('ws://localhost:8000/ws/ticker') as ws:
        msg = await ws.recv()
        data = json.loads(msg)
        print(f"Total symbols: {len(data)}")
        pos = sum(1 for d in data if d.get('change', 0) > 0)
        neg = sum(1 for d in data if d.get('change', 0) < 0)
        neu = sum(1 for d in data if d.get('change', 0) == 0)
        stale = sum(1 for d in data if d.get('stale', False))
        print(f"Positive: {pos}, Negative: {neg}, Neutral: {neu}")
        print(f"Stale count: {stale}")

asyncio.run(test())
