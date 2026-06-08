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
}

/* ------------------------------------------------------------------ */
/*  Sparkline Generator                                                */
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
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

/** Mock PSX stocks for development. */
export const MOCK_STOCKS: MarketAsset[] = [
  { symbol: "LUCK",  name: "Lucky Cement",       price: 842.50,  change:  1.45, absChange: 12.05, volume: "1.2M", high52w: 920.00, low52w: 680.30, sparkline: generateSparkline(1)  },
  { symbol: "ENGRO", name: "Engro Corporation",   price: 265.75,  change: -0.68, absChange: -1.82, volume: "890K", high52w: 310.50, low52w: 215.20, sparkline: generateSparkline(-1) },
  { symbol: "HBL",   name: "Habib Bank Ltd",      price: 135.60,  change:  2.31, absChange:  3.06, volume: "2.1M", high52w: 155.00, low52w: 98.40,  sparkline: generateSparkline(1)  },
  { symbol: "PPL",   name: "Pakistan Petroleum",   price: 78.10,   change:  3.15, absChange:  2.38, volume: "1.5M", high52w: 95.80,  low52w: 58.20,  sparkline: generateSparkline(1)  },
  { symbol: "OGDC",  name: "Oil & Gas Dev Co",    price: 92.45,   change: -1.87, absChange: -1.76, volume: "3.4M", high52w: 118.90, low52w: 72.10,  sparkline: generateSparkline(-1) },
  { symbol: "PSO",   name: "Pakistan State Oil",   price: 192.30,  change:  0.93, absChange:  1.77, volume: "780K", high52w: 225.40, low52w: 148.60, sparkline: generateSparkline(1)  },
  { symbol: "UBL",   name: "United Bank Ltd",      price: 178.25,  change: -2.14, absChange: -3.90, volume: "1.1M", high52w: 210.00, low52w: 142.80, sparkline: generateSparkline(-1) },
  { symbol: "FFC",   name: "Fauji Fertilizer",     price: 115.90,  change:  1.56, absChange:  1.78, volume: "650K", high52w: 138.50, low52w: 89.30,  sparkline: generateSparkline(1)  },
  { symbol: "MCB",   name: "MCB Bank Ltd",         price: 215.80,  change: -0.42, absChange: -0.91, volume: "920K", high52w: 248.70, low52w: 175.20, sparkline: generateSparkline(-1) },
  { symbol: "MEBL",  name: "Meezan Bank Ltd",      price: 87.40,   change:  4.21, absChange:  3.53, volume: "2.8M", high52w: 102.30, low52w: 62.50,  sparkline: generateSparkline(1)  },
];

/** Mock mutual fund data for development. */
export const MOCK_MUTUAL_FUNDS: MarketAsset[] = [
  { symbol: "JSKLF",  name: "JS KSE-100 Fund",      price: 28.45,  change:  1.12, absChange:  0.32, volume: "450K", aum: "8.2B", sparkline: generateSparkline(1)  },
  { symbol: "AKDEQ",  name: "AKD Equity Fund",       price: 42.80,  change: -0.34, absChange: -0.15, volume: "320K", aum: "3.1B", sparkline: generateSparkline(-1) },
  { symbol: "NBPIF",  name: "NBP Islamic Fund",      price: 15.60,  change:  2.67, absChange:  0.41, volume: "180K", aum: "12.4B", sparkline: generateSparkline(1)  },
  { symbol: "HBLMF",  name: "HBL Multi Asset",       price: 33.20,  change:  0.89, absChange:  0.29, volume: "290K", aum: "5.7B", sparkline: generateSparkline(1)  },
  { symbol: "MCBCF",  name: "MCB Cash Fund",         price: 10.15,  change: -1.45, absChange: -0.15, volume: "560K", aum: "18.9B", sparkline: generateSparkline(-1) },
  { symbol: "UBLFM",  name: "UBL Fund Managers",     price: 55.90,  change:  3.01, absChange:  1.63, volume: "210K", aum: "6.3B", sparkline: generateSparkline(1)  },
  { symbol: "ALKIF",  name: "Al-Karam Islamic",      price: 22.30,  change: -0.78, absChange: -0.18, volume: "140K", aum: "2.8B", sparkline: generateSparkline(-1) },
  { symbol: "FHGF",   name: "Faysal Growth Fund",    price: 18.75,  change:  1.94, absChange:  0.36, volume: "380K", aum: "4.5B", sparkline: generateSparkline(1)  },
];

/** Mock upcoming dividend payout data. */
export const MOCK_PAYOUTS: PayoutAsset[] = [
  { symbol: "ATLH",  name: "Atlas Honda",        exDate: "2026-06-15", yieldPct: 4.82, indicator: "XD" },
  { symbol: "HCAR",  name: "Honda Cars Pakistan", exDate: "2026-06-18", yieldPct: 3.65, indicator: "XD" },
  { symbol: "LUCK",  name: "Lucky Cement",        exDate: "2026-06-22", yieldPct: 2.94, indicator: "XD" },
  { symbol: "ENGRO", name: "Engro Corporation",   exDate: "2026-06-25", yieldPct: 5.12, indicator: "XD" },
  { symbol: "FFC",   name: "Fauji Fertilizer",    exDate: "2026-06-28", yieldPct: 6.30, indicator: "XD" },
  { symbol: "PPL",   name: "Pakistan Petroleum",  exDate: "2026-07-02", yieldPct: 3.18, indicator: "XD" },
];

/** Mock forex pairs. */
export const MOCK_FOREX: ForexPair[] = [
  { base: "AED", quote: "PKR", rate: 75.85,  change:  0.12, flagBase: "🇦🇪", flagQuote: "🇵🇰", sparkline: generateSparkline(1)  },
  { base: "AUD", quote: "PKR", rate: 183.42, change: -0.34, flagBase: "🇦🇺", flagQuote: "🇵🇰", sparkline: generateSparkline(-1) },
  { base: "USD", quote: "PKR", rate: 278.50, change:  0.08, flagBase: "🇺🇸", flagQuote: "🇵🇰", sparkline: generateSparkline(1)  },
  { base: "GBP", quote: "PKR", rate: 352.18, change:  0.45, flagBase: "🇬🇧", flagQuote: "🇵🇰", sparkline: generateSparkline(1)  },
  { base: "EUR", quote: "PKR", rate: 302.90, change: -0.21, flagBase: "🇪🇺", flagQuote: "🇵🇰", sparkline: generateSparkline(-1) },
  { base: "SAR", quote: "PKR", rate: 74.27,  change:  0.05, flagBase: "🇸🇦", flagQuote: "🇵🇰", sparkline: generateSparkline(1)  },
  { base: "CAD", quote: "PKR", rate: 204.55, change:  0.32, flagBase: "🇨🇦", flagQuote: "🇵🇰", sparkline: generateSparkline(1)  },
  { base: "CNY", quote: "PKR", rate: 38.62,  change: -0.15, flagBase: "🇨🇳", flagQuote: "🇵🇰", sparkline: generateSparkline(-1) },
  { base: "JPY", quote: "PKR", rate: 1.82,   change:  0.03, flagBase: "🇯🇵", flagQuote: "🇵🇰", sparkline: generateSparkline(1)  },
  { base: "CHF", quote: "PKR", rate: 318.40, change:  0.67, flagBase: "🇨🇭", flagQuote: "🇵🇰", sparkline: generateSparkline(1)  },
];

/** Mock commodity data. */
export const MOCK_COMMODITIES: CommodityAsset[] = [
  { id: "gold",    name: "Gold",         price: 2342.80, change:  0.85, unit: "per oz",   icon: "🥇", sparkline: generateSparkline(1)  },
  { id: "silver",  name: "Silver",       price: 29.45,   change: -1.23, unit: "per oz",   icon: "🥈", sparkline: generateSparkline(-1) },
  { id: "crude",   name: "Crude Oil",    price: 78.62,   change:  2.14, unit: "per bbl",  icon: "🛢️", sparkline: generateSparkline(1)  },
  { id: "natgas",  name: "Natural Gas",  price: 2.34,    change: -0.45, unit: "per MMBtu", icon: "🔥", sparkline: generateSparkline(-1) },
  { id: "copper",  name: "Copper",       price: 4.12,    change:  1.67, unit: "per lb",   icon: "🟤", sparkline: generateSparkline(1)  },
  { id: "plat",    name: "Platinum",     price: 985.30,  change:  0.32, unit: "per oz",   icon: "💎", sparkline: generateSparkline(1)  },
  { id: "wheat",   name: "Wheat",        price: 5.89,    change: -0.78, unit: "per bu",   icon: "🌾", sparkline: generateSparkline(-1) },
  { id: "cotton",  name: "Cotton",       price: 0.82,    change:  1.05, unit: "per lb",   icon: "☁️", sparkline: generateSparkline(1)  },
];
