"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  MarketAsset,
  ForexPair,
  CommodityAsset,
  PayoutAsset,
} from "@/types/market";
import {
  MOCK_STOCKS,
  MOCK_MUTUAL_FUNDS,
  MOCK_FOREX,
  MOCK_COMMODITIES,
  MOCK_PAYOUTS,
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
}

interface UseMarketDataReturn {
  data: MarketDataPayload;
  isLoading: boolean;
  isConnected: boolean;
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
 * Falls back to existing mock data if the payload is empty.
 */
function transformStocks(
  raw: Record<string, { value: number; volume: number; change_percentage: number }> | undefined,
  fallback: MarketAsset[]
): MarketAsset[] {
  if (!raw || Object.keys(raw).length === 0) return fallback;
  return Object.entries(raw).map(([symbol, data]) => ({
    symbol,
    name: symbol, // Backend doesn't send names yet; use symbol as placeholder
    price: data.value,
    change: data.change_percentage,
    absChange: data.value * (data.change_percentage / 100),
    volume: data.volume?.toLocaleString(),
    sparkline: fallback.find((s) => s.symbol === symbol)?.sparkline,
  }));
}

function transformForex(
  raw: Record<string, { value: number; volume: number; change_percentage: number }> | undefined,
  fallback: ForexPair[]
): ForexPair[] {
  if (!raw || Object.keys(raw).length === 0) return fallback;
  return Object.entries(raw).map(([pair, data]) => {
    // Parse pair like EURUSDT
    let base = pair;
    let quote = "USDT";
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
      sparkline: fallback.find((f) => f.base === pair)?.sparkline,
    };
  });
}

function transformCommodities(
  raw: Record<string, { value: number; volume: number; change_percentage: number }> | undefined,
  fallback: CommodityAsset[]
): CommodityAsset[] {
  if (!raw || Object.keys(raw).length === 0) return fallback;
  return Object.entries(raw).map(([name, data]) => ({
    id: name.toLowerCase(),
    name: name.replace("USDT", ""),
    price: data.value,
    change: data.change_percentage,
    unit: "USDT",
    icon: name.startsWith("BTC") ? "₿" : name.startsWith("ETH") ? "Ξ" : "🪙",
    sparkline: fallback.find((c) => c.id === name.toLowerCase())?.sparkline,
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
 * - Fallback to mock data when backend is unavailable
 * - Clean socket close on unmount to prevent memory leaks
 */
export function useMarketData(): UseMarketDataReturn {
  const [data, setData] = useState<MarketDataPayload>({
    stocks: MOCK_STOCKS,
    mutualFunds: MOCK_MUTUAL_FUNDS,
    forex: MOCK_FOREX,
    commodities: MOCK_COMMODITIES,
    payouts: MOCK_PAYOUTS,
    lastUpdated: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
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
        reconnectCountRef.current = 0; // Reset on successful connect
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const payload = JSON.parse(event.data);

          setData((prev) => ({
            stocks: transformStocks(payload.stocks, prev.stocks),
            mutualFunds: prev.mutualFunds, // Backend doesn't send MF data yet
            forex: transformForex(payload.forex, prev.forex),
            commodities: transformCommodities(payload.crypto, prev.commodities),
            payouts: prev.payouts, // Backend doesn't send payout data yet
            lastUpdated: payload.timestamp ?? new Date().toISOString(),
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
        wsRef.current = null;

        // Auto-reconnect with delay
        reconnectCountRef.current += 1;
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, RECONNECT_DELAY_MS);
      };
    } catch {
      setError("Failed to create WebSocket connection");
      setIsLoading(false);
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
    // Small delay to let the close propagate before reconnecting
    await new Promise((resolve) => setTimeout(resolve, 100));
    connect();
  }, [connect]);

  return { data, isLoading, isConnected, error, refetch };
}
