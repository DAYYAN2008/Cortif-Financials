/** A stock or mutual fund displayed in the market overview grid. */
export interface MarketAsset {
  /** Ticker symbol, e.g. "LUCK" */
  symbol: string;
  /** Company or fund name */
  name: string;
  /** Current market price */
  price: number;
  /** Percentage change from previous close */
  change: number;
  /** Absolute change in price */
  absChange?: number;
  /** Formatted volume string, e.g. "2.3M" */
  volume?: string;
  /** Sector classification */
  sector?: string;
  /** 52-week high price */
  high52w?: number;
  /** 52-week low price */
  low52w?: number;
  /** Assets Under Management (for mutual funds) */
  aum?: string;
  /** 24h sparkline data points (normalized 0-1 range) */
  sparkline?: number[];
  /** Data provider source (e.g. "yfinance", "alpaca", "twelvedata") */
  source?: string;
  /** Whether this data is a stale cached value */
  stale?: boolean;
  /** ISO timestamp of when the backend last updated this record */
  updatedAt?: string;
  /** Asset type classification from backend */
  assetType?: string;
}

/** Dividend payout tracking entry for the Upcoming Payouts column. */
export interface PayoutAsset {
  /** Ticker symbol */
  symbol: string;
  /** Company name */
  name: string;
  /** ISO date string for the ex-dividend date */
  exDate: string;
  /** Dividend yield percentage */
  yieldPct: number;
  /** XD indicator badge */
  indicator: "XD";
}

/** A forex currency pair card. */
export interface ForexPair {
  /** Base currency code, e.g. "AED" */
  base: string;
  /** Quote currency code, e.g. "PKR" */
  quote: string;
  /** Current exchange rate */
  rate: number;
  /** Percentage change */
  change: number;
  /** Country flag emoji for base currency */
  flagBase: string;
  /** Country flag emoji for quote currency */
  flagQuote: string;
  /** 24h sparkline data points (normalized 0-1 range) */
  sparkline?: number[];
  /** Data provider source */
  source?: string;
  /** Whether this data is a stale cached value */
  stale?: boolean;
  /** ISO timestamp of when the backend last updated this record */
  updatedAt?: string;
}

/** A commodity asset card. */
export interface CommodityAsset {
  /** Unique identifier */
  id: string;
  /** Display name, e.g. "Gold" */
  name: string;
  /** Current price */
  price: number;
  /** Percentage change */
  change: number;
  /** Price unit, e.g. "per oz" */
  unit: string;
  /** Emoji or symbol for the commodity */
  icon: string;
  /** 24h sparkline data points (normalized 0-1 range) */
  sparkline?: number[];
  /** Data provider source */
  source?: string;
  /** Whether this data is a stale cached value */
  stale?: boolean;
  /** ISO timestamp of when the backend last updated this record */
  updatedAt?: string;
}

/** Backend feed connection status for circuit-breaker UI. */
export type FeedStatus = "connected" | "stale" | "connecting" | "disconnected";

/* ------------------------------------------------------------------ */
/*  Sparkline Generator (used by sample data below)                    */
/* ------------------------------------------------------------------ */

/** Generate a realistic-looking 24h sparkline with 24 data points. */
function generateSparkline(trend: number): number[] {
  const points: number[] = [];
  let value = 0.5;
  for (let i = 0; i < 24; i++) {
    const noise = (Math.random() - 0.5) * 0.15;
    const drift = trend * 0.02;
    value = Math.max(0.05, Math.min(0.95, value + noise + drift));
    points.push(value);
  }
  return points;
}

/* ------------------------------------------------------------------ */
/*  Sample Data (categories not yet served by the live backend)        */
/* ------------------------------------------------------------------ */

/** Sample mutual fund data — backend does not serve MF data yet. */
export const SAMPLE_MUTUAL_FUNDS: MarketAsset[] = [
  { symbol: "JSKLF",  name: "JS KSE-100 Fund",      price: 28.45,  change:  1.12, absChange:  0.32, volume: "450K", aum: "8.2B", sparkline: generateSparkline(1)  },
  { symbol: "AKDEQ",  name: "AKD Equity Fund",       price: 42.80,  change: -0.34, absChange: -0.15, volume: "320K", aum: "3.1B", sparkline: generateSparkline(-1) },
  { symbol: "NBPIF",  name: "NBP Islamic Fund",      price: 15.60,  change:  2.67, absChange:  0.41, volume: "180K", aum: "12.4B", sparkline: generateSparkline(1)  },
  { symbol: "HBLMF",  name: "HBL Multi Asset",       price: 33.20,  change:  0.89, absChange:  0.29, volume: "290K", aum: "5.7B", sparkline: generateSparkline(1)  },
  { symbol: "MCBCF",  name: "MCB Cash Fund",         price: 10.15,  change: -1.45, absChange: -0.15, volume: "560K", aum: "18.9B", sparkline: generateSparkline(-1) },
  { symbol: "UBLFM",  name: "UBL Fund Managers",     price: 55.90,  change:  3.01, absChange:  1.63, volume: "210K", aum: "6.3B", sparkline: generateSparkline(1)  },
  { symbol: "ALKIF",  name: "Al-Karam Islamic",      price: 22.30,  change: -0.78, absChange: -0.18, volume: "140K", aum: "2.8B", sparkline: generateSparkline(-1) },
  { symbol: "FHGF",   name: "Faysal Growth Fund",    price: 18.75,  change:  1.94, absChange:  0.36, volume: "380K", aum: "4.5B", sparkline: generateSparkline(1)  },
];

/** Sample upcoming dividend payout data — backend does not serve payout data yet. */
export const SAMPLE_PAYOUTS: PayoutAsset[] = [
  { symbol: "ATLH",  name: "Atlas Honda",        exDate: "2026-06-15", yieldPct: 4.82, indicator: "XD" },
  { symbol: "HCAR",  name: "Honda Cars Pakistan", exDate: "2026-06-18", yieldPct: 3.65, indicator: "XD" },
  { symbol: "LUCK",  name: "Lucky Cement",        exDate: "2026-06-22", yieldPct: 2.94, indicator: "XD" },
  { symbol: "ENGRO", name: "Engro Corporation",   exDate: "2026-06-25", yieldPct: 5.12, indicator: "XD" },
  { symbol: "FFC",   name: "Fauji Fertilizer",    exDate: "2026-06-28", yieldPct: 6.30, indicator: "XD" },
  { symbol: "PPL",   name: "Pakistan Petroleum",  exDate: "2026-07-02", yieldPct: 3.18, indicator: "XD" },
];
