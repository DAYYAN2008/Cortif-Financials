"use client";

import { Suspense } from "react";
import { MarketTerminal } from "@/components/dashboard/market-terminal";

/**
 * /dashboard/markets — Master Market Data Terminal.
 *
 * Full-width dashboard view with tabbed data tables for
 * Stocks, Mutual Funds, Forex, Commodities, and Dividends.
 *
 * Wrapped in Suspense for useSearchParams compatibility.
 */
export default function MarketsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-600 border-t-slate-900 dark:border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <MarketTerminal />
    </Suspense>
  );
}
