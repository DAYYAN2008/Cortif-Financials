import yfinance as yf
import logging

logging.basicConfig(level=logging.INFO)

symbols = ["SYS.KA", "SYS.PSX", "HUBC.KA", "HUBC.PSX"]
print(f"Testing symbols: {symbols}")

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

for sym in symbols:
    if sym in data.columns.levels[0] if len(symbols) > 1 else True:
        ticker_df = data[sym] if len(symbols) > 1 else data
        if ticker_df.empty:
            print(f"{sym}: EMPTY")
        else:
            print(f"{sym}: SUCCESS (Price: {ticker_df.iloc[-1]['Close']})")
    else:
        print(f"{sym}: MISSING FROM DATA")
