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
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  StockTicker — infinite scrolling marquee                          */
/* ------------------------------------------------------------------ */
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000";

interface StockTickerProps {
  /** Pass live stock data here; falls back to mock data. */
  stocks?: StockData[];
}

export function StockTicker({ stocks: initialStocks = MOCK_STOCKS }: StockTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stocks, setStocks] = useState<StockData[]>(initialStocks);
  const [isConnected, setIsConnected] = useState(false);

  // Refs for reconnection lifecycle
  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(true);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MAX_RECONNECT_ATTEMPTS = 10;
  const RECONNECT_DELAY_MS = 3000;

  // WebSocket connection with auto-reconnect
  useEffect(() => {
    mountedRef.current = true;

    function connect() {
      if (!mountedRef.current) return;
      if (reconnectCountRef.current >= MAX_RECONNECT_ATTEMPTS) return;

      const ws = new WebSocket(`${WS_BASE_URL}/ws/ticker`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setIsConnected(true);
        reconnectCountRef.current = 0;
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data) && data.length > 0) {
            let liveStocks = [...data];
            // Virtual Looper: If less than 20 symbols, pad the array to > 25 to prevent marquee gaps
            if (liveStocks.length < 20) {
              while (liveStocks.length <= 25) {
                liveStocks = [...liveStocks, ...data];
              }
            }
            setStocks(liveStocks);
          }
        } catch (error) {
          console.error("Error parsing WebSocket data:", error);
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setIsConnected(false);
        wsRef.current = null;

        // Auto-reconnect with delay
        reconnectCountRef.current += 1;
        if (reconnectCountRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY_MS);
        }
      };

      ws.onerror = () => {
        if (!mountedRef.current) return;
        // onerror is always followed by onclose, which handles reconnection
      };
    }

    connect();

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);



  // Duplicate the list for seamless looping
  const tickerItems = [...stocks, ...stocks];

  return (
    <div
      id="stock-ticker"
      className="relative w-full overflow-hidden border-b border-border/40 bg-[#f8f9fa] dark:bg-[#020617] flex items-center"
      aria-label="Live stock ticker"
    >
      {/* Live Indicator inside the fade edge */}
      <div className="absolute left-0 z-20 flex items-center h-full px-4 bg-gradient-to-r from-[#f8f9fa] via-[#f8f9fa] to-transparent dark:from-[#020617] dark:via-[#020617]">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <span className="relative flex size-2">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full size-2 ${
                isConnected ? "bg-red-500" : "bg-slate-400"
              }`}
            ></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
            {isConnected ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#f8f9fa] to-transparent dark:from-[#020617]" />

      <div
        ref={containerRef}
        className="flex items-center gap-3 py-2 px-4 will-change-transform transform-gpu animate-marquee hover:[animation-play-state:paused] ml-24"
      >
        {tickerItems.map((stock, i) => (
          <StockCard key={`${stock.symbol}-${i}`} stock={stock} />
        ))}
      </div>
    </div>
  );
}
