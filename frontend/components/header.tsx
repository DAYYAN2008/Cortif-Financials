"use client";

import { Navbar } from "@/components/navbar";
import { StockTicker } from "@/components/stock-ticker";

/**
 * Two-tier Header system:
 *   Tier 1 — Main Navbar (logo, nav links, auth buttons)
 *   Tier 2 — Live Stock Ticker (infinite scrolling marquee, powered by useMarketData)
 */
export function Header() {
  return (
    <div id="site-header" className="sticky top-0 z-50">
      <Navbar />
      <StockTicker />
    </div>
  );
}
