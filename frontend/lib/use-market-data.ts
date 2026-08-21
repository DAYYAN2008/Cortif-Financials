"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  MarketAsset,
  ForexPair,
  CommodityAsset,
  PayoutAsset,
  FeedStatus,
} from "@/types/market";
import {
  SAMPLE_MUTUAL_FUNDS,
  SAMPLE_PAYOUTS,
  SAMPLE_STOCKS,
  SAMPLE_FOREX,
  SAMPLE_COMMODITIES,
} from "@/types/market";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

/** All market data in a single payload. */
export interface MarketDataPayload {
  stocks: MarketAsset[];
  mutualFunds: MarketAsset[];
  forex: ForexPair[];
  commodities: CommodityAsset[];
  payouts: PayoutAsset[];
  lastUpdated: string;
  feedStatus: FeedStatus;
}

interface UseMarketDataReturn {
  data: MarketDataPayload;
  isLoading: boolean;
  isConnected: boolean;
  feedStatus: FeedStatus;
  error: string | null;
  refetch: () => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  WebSocket Config                                                    */
/* ------------------------------------------------------------------ */
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000";
const WS_URL = `${WS_BASE_URL}/ws/markets`;
const RECONNECT_DELAY_MS = 3000; // 3 seconds between reconnection attempts
const MAX_RECONNECT_ATTEMPTS = 10;

/* ------------------------------------------------------------------ */
/*  Helpers: Transform Redis payload → Frontend types                   */
/* ------------------------------------------------------------------ */

/**
 * Transform the raw Redis stocks hash into MarketAsset[].
 * Keeps previous state if backend sends empty data for this category.
 */
function transformStocks(
  raw: Record<string, { value: number; volume: number; change_percentage: number; stale?: boolean }> | undefined,
  prev: MarketAsset[],
  timestamp?: string
): MarketAsset[] {
  if (!raw || Object.keys(raw).length === 0) return prev;
  return Object.entries(raw).map(([symbol, data]) => ({
    symbol,
    name: symbol, // Backend doesn't send names yet; use symbol as placeholder
    price: data.value,
    change: data.change_percentage,
    absChange: data.value * (data.change_percentage / 100),
    volume: data.volume?.toLocaleString(),
    stale: data.stale,
    updatedAt: timestamp,
    // Preserve sparkline from previous state if available
    sparkline: prev.find((s) => s.symbol === symbol)?.sparkline,
  }));
}

function transformForex(
  raw: Record<string, { value: number; volume: number; change_percentage: number }> | undefined,
  prev: ForexPair[],
  timestamp?: string
): ForexPair[] {
  if (!raw || Object.keys(raw).length === 0) return prev;
  return Object.entries(raw).map(([pair, data]) => {
    // Parse pair like EURUSDT
    let base = pair;
    const quote = "USDT";
    if (pair.endsWith("USDT")) {
        base = pair.replace("USDT", "");
    }
    
    return {
      base,
      quote,
      rate: data.value,
      change: data.change_percentage,
      flagBase: base === "EUR" ? "🇪🇺" : base === "GBP" ? "🇬🇧" : "🏳️",
      flagQuote: "🇺🇸",
      updatedAt: timestamp,
      // Preserve sparkline from previous state if available
      sparkline: prev.find((f) => f.base === base)?.sparkline,
    };
  });
}

function transformCommodities(
  raw: Record<string, { value: number; volume: number; change_percentage: number }> | undefined,
  prev: CommodityAsset[],
  timestamp?: string
): CommodityAsset[] {
  if (!raw || Object.keys(raw).length === 0) return prev;
  return Object.entries(raw).map(([name, data]) => ({
    id: name.toLowerCase(),
    name: name.replace("USDT", ""),
    price: data.value,
    change: data.change_percentage,
    unit: "USDT",
    icon: name.startsWith("BTC") ? "₿" : name.startsWith("ETH") ? "Ξ" : "🪙",
    updatedAt: timestamp,
    // Preserve sparkline from previous state if available
    sparkline: prev.find((c) => c.id === name.toLowerCase())?.sparkline,
  }));
}

/* ------------------------------------------------------------------ */
/*  Hook                                                                */
/* ------------------------------------------------------------------ */

/**
 * Real-time market data hook using WebSocket.
 *
 * Connects to `ws://127.0.0.1:8000/ws/markets` and receives
 * live Redis-cached snapshots every 1 second. Includes:
 * - Automatic reconnection on disconnect (up to 10 attempts)
 * - Empty initial state (shows loading until first data arrives)
 * - Circuit-breaker: reads `status` from backend payload
 * - Clean socket close on unmount to prevent memory leaks
 */
export function useMarketData(): UseMarketDataReturn {
  const [data, setData] = useState<MarketDataPayload>({
    stocks: SAMPLE_STOCKS,
    mutualFunds: SAMPLE_MUTUAL_FUNDS,
    forex: SAMPLE_FOREX,
    commodities: SAMPLE_COMMODITIES,
    payouts: SAMPLE_PAYOUTS,
    lastUpdated: new Date().toISOString(),
    feedStatus: "connecting",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [feedStatus, setFeedStatus] = useState<FeedStatus>("connecting");
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    // Don't reconnect if component is unmounted
    if (!mountedRef.current) return;

    // Don't exceed max reconnect attempts
    if (reconnectCountRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setError(`Failed to connect after ${MAX_RECONNECT_ATTEMPTS} attempts`);
      setIsLoading(false);
      setFeedStatus("disconnected");
      return;
    }

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setIsConnected(true);
        setIsLoading(false);
        setError(null);
        setFeedStatus("connected");
        reconnectCountRef.current = 0; // Reset on successful connect
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const payload = JSON.parse(event.data);

          // Circuit-breaker: read backend status flag
          const backendStatus = payload.status as string | undefined;
          let newFeedStatus: FeedStatus = "connected";
          if (backendStatus === "stale" || backendStatus === "stale_cache_connecting") {
            newFeedStatus = "stale";
          } else if (backendStatus === "connecting") {
            newFeedStatus = "connecting";
          }
          setFeedStatus(newFeedStatus);

          const timestamp = payload.timestamp ?? new Date().toISOString();

          setData((prev) => ({
            stocks: transformStocks(payload.stocks, prev.stocks, timestamp),
            mutualFunds: prev.mutualFunds, // Backend doesn't send MF data yet; keep sample
            forex: transformForex(payload.forex, prev.forex, timestamp),
            commodities: transformCommodities(payload.commodities, prev.commodities, timestamp),
            payouts: prev.payouts, // Backend doesn't send payout data yet; keep sample
            lastUpdated: timestamp,
            feedStatus: newFeedStatus,
          }));
        } catch {
          // Silently ignore malformed messages
        }
      };

      ws.onerror = () => {
        if (!mountedRef.current) return;
        setError("WebSocket connection error");
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setIsConnected(false);
        setFeedStatus("disconnected");
        wsRef.current = null;

        // Auto-reconnect with delay
        reconnectCountRef.current += 1;
        reconnectTimerRef.current = setTimeout(() => {
          setFeedStatus("connecting");
          connect();
        }, RECONNECT_DELAY_MS);
      };
    } catch {
      setError("Failed to create WebSocket connection");
      setIsLoading(false);
      setFeedStatus("disconnected");
    }
  }, []);

  // Initialize WebSocket connection on mount
  useEffect(() => {
    mountedRef.current = true;
    connect();

    // Cleanup: close socket and cancel reconnect on unmount
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
  }, [connect]);

  // Manual refetch: reconnect the WebSocket
  const refetch = useCallback(async () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    reconnectCountRef.current = 0;
    setError(null);
    setIsLoading(true);
    setFeedStatus("connecting");
    // Small delay to let the close propagate before reconnecting
    await new Promise((resolve) => setTimeout(resolve, 100));
    connect();
  }, [connect]);

  return { data, isLoading, isConnected, feedStatus, error, refetch };
}
