"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Layers,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface Holding {
  portfolio_id: string;
  asset_id: string;
  ticker: string;
  asset_name: string;
  asset_type: string;
  net_quantity: number;
  average_cost_basis: number;
  total_cost: number;
  last_transacted_at: string;
}

interface Transaction {
  id: string;
  portfolio_id: string;
  asset_id: string;
  ticker: string | null;
  asset_name: string | null;
  transaction_type: string;
  quantity: number;
  execution_price: number;
  executed_at: string;
  created_at: string;
}

/** Live price map: { "AAPL": 175.20, "BTCUSDT": 64000 } */
type LivePrices = Record<string, number>;

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://127.0.0.1:8000";

/* ================================================================== */
/*  Easing                                                             */
/* ================================================================== */
const EASE = [0.22, 1, 0.36, 1] as const;

/* ================================================================== */
/*  Stat Card                                                          */
/* ================================================================== */
function StatCard({
  label,
  value,
  currency,
  change,
  changeLabel,
  icon: Icon,
  delay = 0,
  raw,
}: {
  label: string;
  value: number;
  currency: string;
  change?: string;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  delay?: number;
  raw?: boolean;
}) {
  const isPositive = change?.startsWith("+");
  const isNeutral = change === "0.00%";
  const formattedValue = raw ? value.toString() : formatCurrency(value, currency);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      className={cn(
        "rounded-xl border p-5",
        "border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/80"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[12px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </span>
        <div className="flex items-center justify-center size-8 rounded-lg bg-slate-50 dark:bg-slate-800">
          <Icon className="size-4 text-slate-400 dark:text-slate-500" />
        </div>
      </div>
      <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white font-mono">
        {formattedValue}
      </p>
      {change && (
        <div className="flex items-center gap-1 mt-1.5">
          {isNeutral ? (
            <span className="text-[12px] text-slate-400">—</span>
          ) : isPositive ? (
            <ArrowUpRight className="size-3 text-emerald-500" />
          ) : (
            <ArrowDownRight className="size-3 text-red-500" />
          )}
          <span
            className={cn(
              "text-[12px] font-medium",
              isNeutral
                ? "text-slate-400 dark:text-slate-500"
                : isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
            )}
          >
            {change}
          </span>
          {changeLabel && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-0.5">
              {changeLabel}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ================================================================== */
/*  Skeleton Loader                                                    */
/* ================================================================== */
function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800/80",
        className
      )}
    />
  );
}

function StatCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      className={cn(
        "rounded-xl border p-5 space-y-3",
        "border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/80"
      )}
    >
      <div className="flex items-start justify-between">
        <SkeletonPulse className="h-3 w-20" />
        <SkeletonPulse className="size-8 rounded-lg" />
      </div>
      <SkeletonPulse className="h-7 w-32" />
      <SkeletonPulse className="h-3 w-16" />
    </motion.div>
  );
}

/* ================================================================== */
/*  Chart Placeholder                                                  */
/* ================================================================== */
function ChartPlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: EASE }}
      className={cn(
        "rounded-xl border overflow-hidden",
        "border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/80"
      )}
    >
      {/* Chart Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60">
        <div>
          <h2 className="text-[14px] font-semibold text-slate-900 dark:text-white">
            Portfolio Performance
          </h2>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">
            Historical net worth over time
          </p>
        </div>
        <div className="flex items-center gap-1">
          {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((period, i) => (
            <button
              key={period}
              className={cn(
                "tailwind-style px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer",
                i === 0
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Body — Empty State SVG */}
      <div className="relative h-[280px] flex items-center justify-center">
        {/* Flat line placeholder */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 800 280"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              y1={280 * ratio}
              x2="800"
              y2={280 * ratio}
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800/50"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Flat line at center representing $0 */}
          <motion.line
            x1="40"
            y1="140"
            x2="760"
            y2="140"
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-600"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }}
          />

          {/* Start dot */}
          <motion.circle
            cx="40"
            cy="140"
            r="4"
            fill="currentColor"
            className="text-slate-400 dark:text-slate-500"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          />
        </svg>

        {/* Center label */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <div className="flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-slate-800">
            <BarChart3 className="size-5 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
            No data to display yet
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  Custom Hook: usePortfolioData                                      */
/* ================================================================== */
function usePortfolioData() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setHoldings([]);
        setTransactions([]);
        setIsLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };

      const [holdingsRes, txRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/v1/portfolio/holdings`, { headers }),
        fetch(`${BACKEND_URL}/api/v1/portfolio/transactions?limit=50`, {
          headers,
        }),
      ]);

      if (holdingsRes.ok) {
        const h: Holding[] = await holdingsRes.json();
        setHoldings(h);
      }

      if (txRes.ok) {
        const t: Transaction[] = await txRes.json();
        setTransactions(t);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load data";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* Listen for the custom event dispatched by the add-asset modal */
  useEffect(() => {
    const handleUpdate = () => fetchData();
    window.addEventListener("portfolio-updated", handleUpdate);
    return () => window.removeEventListener("portfolio-updated", handleUpdate);
  }, [fetchData]);

  return { holdings, transactions, isLoading, error, refetch: fetchData };
}

/* ================================================================== */
/*  Custom Hook: useLivePrices (WebSocket)                             */
/* ================================================================== */
function useLivePrices(tickers: string[]) {
  const [prices, setPrices] = useState<LivePrices>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef(0);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    if (reconnectRef.current >= 10) return;

    try {
      const ws = new WebSocket(`${WS_BASE_URL}/ws/markets`);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectRef.current = 0;
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const payload = JSON.parse(event.data);

          const newPrices: LivePrices = {};

          /* stocks: { "AAPL": { value: 175, ... } } */
          if (payload.stocks) {
            for (const [sym, d] of Object.entries(payload.stocks)) {
              newPrices[sym] = (d as { value: number }).value;
            }
          }

          /* crypto / commodities: { "BTCUSDT": { value: 64000, ... } } */
          if (payload.crypto) {
            for (const [sym, d] of Object.entries(payload.crypto)) {
              newPrices[sym] = (d as { value: number }).value;
            }
          }

          /* forex */
          if (payload.forex) {
            for (const [sym, d] of Object.entries(payload.forex)) {
              newPrices[sym] = (d as { value: number }).value;
            }
          }

          setPrices((prev) => ({ ...prev, ...newPrices }));
        } catch {
          /* ignore */
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        wsRef.current = null;
        reconnectRef.current += 1;
        setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        /* onclose will fire next */
      };
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  return prices;
}

/* ================================================================== */
/*  Dashboard Content Shell                                            */
/* ================================================================== */
export function DashboardContent({ baseCurrency }: { baseCurrency: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* ── Data fetching ── */
  const { holdings, transactions, isLoading } = usePortfolioData();

  /* ── WebSocket live prices ── */
  const holdingTickers = holdings.map((h) => h.ticker);
  const livePrices = useLivePrices(holdingTickers);

  /* ── Financial math ── */
  const totalInvested = holdings.reduce((sum, h) => sum + h.total_cost, 0);

  const totalMarketValue = holdings.reduce((sum, h) => {
    const price = livePrices[h.ticker] ?? livePrices[`${h.ticker}USDT`];
    return sum + (price !== undefined ? h.net_quantity * price : h.total_cost);
  }, 0);

  const totalReturn = totalMarketValue - totalInvested;
  const totalReturnPct =
    totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  const formatChange = (v: number): string =>
    `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;

  /* ── Modal helper ── */
  const openAddAssetModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", "add-asset");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="mb-8"
        >
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
            Welcome to your financial workspace
          </p>
        </motion.div>

        {/* ── Stat Cards Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[0, 0.05, 0.1, 0.15].map((d, i) => (
              <StatCardSkeleton key={i} delay={d} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Net Worth"
              value={totalMarketValue}
              currency={baseCurrency}
              change={formatChange(totalReturnPct)}
              changeLabel="all time"
              icon={Wallet}
              delay={0}
            />
            <StatCard
              label="Total Return"
              value={totalReturn}
              currency={baseCurrency}
              change={formatChange(totalReturnPct)}
              changeLabel="all time"
              icon={totalReturn >= 0 ? TrendingUp : TrendingDown}
              delay={0.05}
            />
            <StatCard
              label="Total Invested"
              value={totalInvested}
              currency={baseCurrency}
              icon={BarChart3}
              delay={0.1}
            />
            <StatCard
              label="Active Positions"
              value={holdings.length}
              currency={baseCurrency}
              icon={Layers}
              delay={0.15}
              raw
            />
          </div>
        )}

        {/* ── Chart ── */}
        <div className="mb-6">
          <ChartPlaceholder />
        </div>
      </div>
    </>
  );
}
