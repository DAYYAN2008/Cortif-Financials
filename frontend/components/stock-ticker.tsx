"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { StockData } from "@/types/stock";
import { MOCK_STOCKS } from "@/types/stock";

/* ------------------------------------------------------------------ */
/*  StockCard — a single ticker item inside the marquee               */
/* ------------------------------------------------------------------ */
function StockCard({ stock }: { stock: StockData }) {
  const isPositive = stock.change > 0;
  const isNeutral = stock.change === 0;

  return (
    <div className="flex items-center gap-2.5 rounded-md border border-border/60 bg-white/70 px-3.5 py-1.5 backdrop-blur-sm select-none shrink-0">
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
            ? "bg-emerald-50 text-emerald-700"
            : "bg-red-50 text-red-700"
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StockTicker — infinite scrolling marquee                          */
/* ------------------------------------------------------------------ */
interface StockTickerProps {
  /** Pass live stock data here; falls back to mock data. */
  stocks?: StockData[];
}

export function StockTicker({ stocks = MOCK_STOCKS }: StockTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(40);

  // Adjust scroll speed based on content width for consistent perceived speed
  useEffect(() => {
    if (containerRef.current) {
      const contentWidth = containerRef.current.scrollWidth / 2;
      // ~60px per second
      setDuration(Math.max(25, contentWidth / 60));
    }
  }, [stocks]);

  // Duplicate the list for seamless looping
  const tickerItems = [...stocks, ...stocks];

  return (
    <div
      id="stock-ticker"
      className="relative w-full overflow-hidden border-b border-border/40 bg-[#f8f9fa]"
      aria-label="Live stock ticker"
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#f8f9fa] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#f8f9fa] to-transparent" />

      <motion.div
        ref={containerRef}
        className="flex items-center gap-3 py-2 px-4 will-change-transform"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration,
            ease: "linear",
          },
        }}
      >
        {tickerItems.map((stock, i) => (
          <StockCard key={`${stock.symbol}-${i}`} stock={stock} />
        ))}
      </motion.div>
    </div>
  );
}
