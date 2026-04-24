/** Stock data type used across the ticker and future WebSocket feeds. */
export interface StockData {
  /** Ticker symbol, e.g. "KSE100" */
  symbol: string;
  /** Current market price */
  price: number;
  /** Percentage change from previous close. Positive = gain, negative = loss. */
  change: number;
}

/** Mock data for development — will be replaced by FastAPI WebSocket feed. */
export const MOCK_STOCKS: StockData[] = [
  { symbol: "KSE100", price: 78542.31, change: 1.24 },
  { symbol: "OGDC", price: 92.45, change: -0.87 },
  { symbol: "PPL", price: 78.10, change: 2.15 },
  { symbol: "HBL", price: 135.60, change: -1.32 },
  { symbol: "LUCK", price: 842.50, change: 0.45 },
  { symbol: "ENGRO", price: 265.75, change: -0.68 },
  { symbol: "PSO", price: 192.30, change: 1.87 },
  { symbol: "FFC", price: 115.90, change: 0.93 },
  { symbol: "UBL", price: 178.25, change: -2.14 },
  { symbol: "MEBL", price: 87.40, change: 3.21 },
  { symbol: "HUBC", price: 98.65, change: -0.42 },
  { symbol: "BAHL", price: 68.30, change: 1.56 },
  { symbol: "MCB", price: 215.80, change: -0.91 },
  { symbol: "NBP", price: 42.15, change: 0.78 },
  { symbol: "MARI", price: 1685.00, change: 2.43 },
];
