"use client";

import { Navbar } from "@/components/navbar";
import { StockTicker } from "@/components/stock-ticker";
import type { StockData } from "@/types/stock";

interface HeaderProps {
  /** Live stock data from WebSocket — falls back to mock data. */
  stocks?: StockData[];
}

/**
 * Two-tier Header system:
 *   Tier 1 — Main Navbar (logo, nav links, auth buttons)
 *   Tier 2 — Live Stock Ticker (infinite scrolling marquee)
 */
export function Header({ stocks }: HeaderProps) {
  return (
    <div id="site-header" className="sticky top-0 z-50">
      <Navbar />
      <StockTicker stocks={stocks} />
    </div>
  );
}
