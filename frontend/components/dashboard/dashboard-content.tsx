"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  BarChart3,
  Layers,
  Clock,
  Package,
  X,
  Loader2,
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
/*  Empty State for Holdings Table                                     */
/* ================================================================== */
function EmptyHoldingsTable({ onAddAssetClick }: { onAddAssetClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: EASE }}
      className={cn(
        "rounded-xl border overflow-hidden",
        "border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/80"
      )}
    >
      {/* Table Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-semibold text-slate-900 dark:text-white">
            Holdings
          </h2>
          <span className="flex items-center justify-center h-5 px-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            0
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <Clock className="size-3.5" />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40 hidden sm:grid">
        <span>Asset</span>
        <span className="text-right">Price</span>
        <span className="text-right">Holdings</span>
        <span className="text-right">Value</span>
        <span className="text-right">Change</span>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-16 px-6">
        {/* Illustration — Layered card stack */}
        <div className="relative mb-6">
          {/* Back layer */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-14 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40"
          />
          {/* Middle layer */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-[88px] h-14 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60"
          />
          {/* Front layer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 300, damping: 20 }}
            className="relative flex items-center justify-center w-24 h-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <Package className="size-7 text-slate-300 dark:text-slate-600" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center max-w-xs"
        >
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white mb-1.5">
            Your portfolio is currently blank
          </h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            Ready to build your asset tracking ledger? Add your first holding to start
            monitoring your investments in real time.
          </p>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAddAssetClick}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-5 py-2.5",
              "text-[14px] font-medium transition-all cursor-pointer",
              "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20",
              "dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:shadow-emerald-500/15",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            )}
          >
            <Plus className="size-4" />
            <span>Add First Asset</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  Populated Holdings Table                                           */
/* ================================================================== */
function HoldingsTable({
  holdings,
  livePrices,
  baseCurrency,
  onAddAssetClick,
}: {
  holdings: Holding[];
  livePrices: LivePrices;
  baseCurrency: string;
  onAddAssetClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: EASE }}
      className={cn(
        "rounded-xl border overflow-hidden",
        "border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/80"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-semibold text-slate-900 dark:text-white">
            Holdings
          </h2>
          <span className="flex items-center justify-center h-5 px-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {holdings.length}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddAssetClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
        >
          <Plus className="size-3.5" />
          <span>Add Asset</span>
        </motion.button>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40 hidden sm:grid">
        <span>Asset</span>
        <span className="text-right">Price</span>
        <span className="text-right">Holdings</span>
        <span className="text-right">Value</span>
        <span className="text-right">P&L</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
        {holdings.map((h, idx) => {
          const livePrice = livePrices[h.ticker] ?? livePrices[`${h.ticker}USDT`];
          const hasPrice = livePrice !== undefined;
          const marketValue = hasPrice ? h.net_quantity * livePrice : null;
          const pnl = marketValue !== null ? marketValue - h.total_cost : null;
          const pnlPct =
            pnl !== null && h.total_cost > 0
              ? (pnl / h.total_cost) * 100
              : null;

          return (
            <motion.div
              key={h.asset_id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.35 + idx * 0.05, ease: EASE }}
              className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center px-6 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              {/* Asset */}
              <div className="flex items-center gap-3 mb-2 sm:mb-0">
                <div className="flex items-center justify-center size-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-[13px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
                  {h.ticker.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                    {h.ticker}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                    {h.asset_name}
                  </p>
                </div>
              </div>

              {/* Live Price */}
              <div className="text-right">
                {hasPrice ? (
                  <span className="text-[13px] font-mono text-slate-900 dark:text-white">
                    {formatCurrency(livePrice, baseCurrency)}
                  </span>
                ) : (
                  <span className="text-[12px] text-slate-400 dark:text-slate-500 italic">
                    —
                  </span>
                )}
              </div>

              {/* Quantity */}
              <div className="text-right">
                <span className="text-[13px] font-mono text-slate-700 dark:text-slate-300">
                  {h.net_quantity.toLocaleString(undefined, {
                    maximumFractionDigits: 8,
                  })}
                </span>
              </div>

              {/* Market Value */}
              <div className="text-right">
                {marketValue !== null ? (
                  <span className="text-[13px] font-mono font-medium text-slate-900 dark:text-white">
                    {formatCurrency(marketValue, baseCurrency)}
                  </span>
                ) : (
                  <span className="text-[12px] text-slate-400 italic">—</span>
                )}
              </div>

              {/* P&L */}
              <div className="text-right">
                {pnl !== null && pnlPct !== null ? (
                  <div className="flex flex-col items-end">
                    <span
                      className={cn(
                        "text-[13px] font-mono font-medium",
                        pnl >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                    >
                      {pnl >= 0 ? "+" : ""}
                      {formatCurrency(pnl, baseCurrency)}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-medium",
                        pnl >= 0
                          ? "text-emerald-500/70 dark:text-emerald-400/60"
                          : "text-red-500/70 dark:text-red-400/60"
                      )}
                    >
                      {pnl >= 0 ? "+" : ""}
                      {pnlPct.toFixed(2)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-[12px] text-slate-400 italic">—</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  Recent Activity — Empty                                            */
/* ================================================================== */
function EmptyRecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4, ease: EASE }}
      className={cn(
        "rounded-xl border",
        "border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/80"
      )}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60">
        <h2 className="text-[14px] font-semibold text-slate-900 dark:text-white">
          Recent Activity
        </h2>
      </div>
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
          <Layers className="size-5 text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-[13px] text-slate-400 dark:text-slate-500 text-center">
          No transactions yet
        </p>
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  Recent Activity — Populated                                        */
/* ================================================================== */
function RecentActivityList({
  transactions,
  baseCurrency,
}: {
  transactions: Transaction[];
  baseCurrency: string;
}) {
  const displayed = transactions.slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4, ease: EASE }}
      className={cn(
        "rounded-xl border",
        "border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/80"
      )}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-semibold text-slate-900 dark:text-white">
            Recent Activity
          </h2>
          <span className="flex items-center justify-center h-5 px-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {transactions.length}
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
        {displayed.map((tx, idx) => {
          const isBuy = tx.transaction_type === "BUY";
          const txDate = new Date(tx.executed_at);
          const formattedDate = txDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          const formattedTime = txDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.45 + idx * 0.04, ease: EASE }}
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              {/* Badge */}
              <div
                className={cn(
                  "flex items-center justify-center shrink-0 size-8 rounded-lg text-[11px] font-bold",
                  isBuy
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                )}
              >
                {isBuy ? (
                  <ArrowUpRight className="size-4" />
                ) : (
                  <ArrowDownRight className="size-4" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                      isBuy
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                    )}
                  >
                    {tx.transaction_type}
                  </span>
                  <span className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                    {tx.ticker ?? "—"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {tx.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}{" "}
                  × {formatCurrency(tx.execution_price, baseCurrency)} ·{" "}
                  {formattedDate} {formattedTime}
                </p>
              </div>

              {/* Total */}
              <span className="text-[13px] font-mono font-medium text-slate-900 dark:text-white shrink-0">
                {formatCurrency(tx.quantity * tx.execution_price, baseCurrency)}
              </span>
            </motion.div>
          );
        })}
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

        {/* ── Holdings + Activity Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: EASE }}
                className={cn(
                  "rounded-xl border overflow-hidden p-6",
                  "border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/80"
                )}
              >
                <div className="flex items-center justify-center py-12 gap-2 text-slate-400 dark:text-slate-500">
                  <Loader2 className="size-5 animate-spin" />
                  <span className="text-[13px]">Loading holdings…</span>
                </div>
              </motion.div>
            ) : holdings.length > 0 ? (
              <HoldingsTable
                holdings={holdings}
                livePrices={livePrices}
                baseCurrency={baseCurrency}
                onAddAssetClick={openAddAssetModal}
              />
            ) : (
              <EmptyHoldingsTable onAddAssetClick={openAddAssetModal} />
            )}
          </div>
          <div>
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4, ease: EASE }}
                className={cn(
                  "rounded-xl border p-6",
                  "border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/80"
                )}
              >
                <div className="flex items-center justify-center py-12 gap-2 text-slate-400 dark:text-slate-500">
                  <Loader2 className="size-5 animate-spin" />
                  <span className="text-[13px]">Loading activity…</span>
                </div>
              </motion.div>
            ) : transactions.length > 0 ? (
              <RecentActivityList
                transactions={transactions}
                baseCurrency={baseCurrency}
              />
            ) : (
              <EmptyRecentActivity />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
