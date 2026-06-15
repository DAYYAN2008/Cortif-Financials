/** Stock data type used across the ticker and future WebSocket feeds. */
export interface StockData {
  /** Ticker symbol, e.g. "KSE100" */
  symbol: string;
  /** Current market price */
  price: number;
  /** Percentage change from previous close. Positive = gain, negative = loss. */
  change: number;
  /** True if the data is a cached value due to failure to fetch fresh data */
  stale?: boolean;
}

