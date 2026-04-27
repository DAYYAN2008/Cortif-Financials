import yfinance as yf
import logging

logging.basicConfig(level=logging.INFO)

symbols = ["AAPL", "BTC-USD", "SYS.KA", "SYS.PSX", "HUBC.KA"]
print(f"Testing symbols: {symbols}")

data = yf.download(
    tickers=" ".join(symbols),
    period="5d",
    interval="1d",
    group_by='ticker',
    auto_adjust=True,
    threads=True,
    progress=False
)

for sym in symbols:
    try:
        ticker_df = data[sym] if len(symbols) > 1 else data
        if ticker_df.empty:
            print(f"{sym}: EMPTY")
        else:
            last_price = ticker_df.iloc[-1]['Close']
            print(f"{sym}: SUCCESS (Last Close: {last_price})")
    except Exception as e:
        print(f"{sym}: ERROR ({e})")
