"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import type { StockData } from "@/types/stock";
import { useMarketData } from "@/lib/use-market-data";
import type { FeedStatus } from "@/types/market";

/* ------------------------------------------------------------------ */
/* StockCard — a single ticker item inside the marquee               */
/* ------------------------------------------------------------------ */
function StockCard({ stock }: { stock: StockData }) {
  const isPositive = stock.change > 0;
  const isNeutral = stock.change === 0;

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="flex items-center gap-2.5 rounded-md border border-border/60 bg-white/70 px-3.5 py-1.5 backdrop-blur-sm select-none shrink-0 dark:bg-slate-900/70 dark:border-slate-700/60"
    >
      {/* Symbol */}
      <span className="text-[11px] font-semibold tracking-wide text-foreground/90 uppercase">
        {stock.symbol}
      </span>

      {/* Divider */}
      <span className="h-3.5 w-px bg-border/80" />

      {/* Price */}
      <span className="text-[11px] font-medium tabular-nums text-foreground/80">
        {stock.price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>

      {/* Change Badge */}
      <span
        className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
          isNeutral
            ? "bg-muted text-muted-foreground"
            : isPositive
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
            : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400"
        }`}
      >
        {isNeutral ? (
          <Minus className="size-2.5" />
        ) : isPositive ? (
          <TrendingUp className="size-2.5" />
        ) : (
          <TrendingDown className="size-2.5" />
        )}
        {isPositive ? "+" : ""}
        {stock.change.toFixed(2)}%
      </span>

      {/* Stale indicator */}
      {stock.stale && (
        <span className="ml-0.5" title="Cached data — feed updating">
          <AlertTriangle className="size-2.5 text-amber-500" />
        </span>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* StockTicker — infinite scrolling marquee                          */
/* ------------------------------------------------------------------ */
export function StockTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isConnected, feedStatus } = useMarketData();

  // Transform MarketAsset[] → StockData[] for rendering
  const stocks: StockData[] = data.stocks.map((asset) => ({
    symbol: asset.symbol,
    price: asset.price,
    change: asset.change,
    stale: asset.stale,
  }));

  // Pad for seamless marquee if fewer than 20 items
  let tickerStocks = [...stocks];
  if (tickerStocks.length > 0 && tickerStocks.length < 20) {
    while (tickerStocks.length <= 25) {
      tickerStocks = [...tickerStocks, ...stocks];
    }
  }

  // Duplicate the list for seamless looping
  const tickerItems = tickerStocks.length > 0
    ? [...tickerStocks, ...tickerStocks]
    : [];

  // Determine indicator color based on feedStatus
  const indicatorConfig = getIndicatorConfig(feedStatus, isConnected);

  return (
    <div
      id="stock-ticker"
      className="relative w-full overflow-hidden border-b border-border/40 bg-[#f8f9fa] dark:bg-[#020617] flex items-center"
      aria-label="Live stock ticker"
    >
      {/* Live / Stale / Offline Indicator */}
      <div className="absolute left-0 z-20 flex items-center h-full px-4 bg-gradient-to-r from-[#f8f9fa] via-[#f8f9fa] to-transparent dark:from-[#020617] dark:via-[#020617]">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <span className="relative flex size-2">
            {(isConnected || feedStatus === "stale" || feedStatus === "connecting") && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${indicatorConfig.pingColor} opacity-75`}></span>
            )}
            <span
              className={`relative inline-flex rounded-full size-2 ${indicatorConfig.dotColor}`}
            ></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
            {indicatorConfig.label}
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#f8f9fa] to-transparent dark:from-[#020617]" />

      {tickerItems.length > 0 ? (
        <div
          ref={containerRef}
          className="flex items-center gap-3 py-2 px-4 will-change-transform transform-gpu animate-marquee hover:[animation-play-state:paused] ml-24"
        >
          {tickerItems.map((stock, i) => (
            <StockCard key={`${stock.symbol}-${i}`} stock={stock} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center w-full py-2 ml-24">
          <span className="text-[11px] text-muted-foreground animate-pulse">
            Loading live market data…
          </span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Indicator Config Helper                                             */
/* ------------------------------------------------------------------ */
function getIndicatorConfig(feedStatus: FeedStatus, isConnected: boolean) {
  if (feedStatus === "stale") {
    return {
      dotColor: "bg-amber-500",
      pingColor: "bg-amber-400",
      label: "Stale",
    };
  }
  if (feedStatus === "connecting") {
    return {
      dotColor: "bg-amber-500",
      pingColor: "bg-amber-400",
      label: "Updating",
    };
  }
  if (isConnected) {
    return {
      dotColor: "bg-red-500",
      pingColor: "bg-red-400",
      label: "Live",
    };
  }
  return {
    dotColor: "bg-slate-400",
    pingColor: "bg-slate-400",
    label: "Offline",
  };
}