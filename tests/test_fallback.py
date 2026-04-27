import yfinance as yf
import math

symbols = ["AAPL", "BTC-USD", "ENGRO.KA"]
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

for symbol in symbols:
    ticker_df = data[symbol] if len(symbols) > 1 else data
    
    price = None
    if ticker_df is not None and not ticker_df.empty:
        price_val = ticker_df.iloc[-1]['Close']
        if price_val is not None and not math.isnan(price_val):
            price = float(price_val)
            print(f"[{symbol}] Got price from df: {price}")
            
    if price is None:
        print(f"[{symbol}] DF was empty or NaN, falling back to fast_info")
        ticker = yf.Ticker(symbol)
        price = ticker.fast_info.last_price
        print(f"[{symbol}] Got price from fast_info: {price}")
