"use client";

import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */
function StatCard({
  label,
  value,
  currency,
  change,
  changeLabel,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: number;
  currency: string;
  change?: string;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  delay?: number;
}) {
  const isPositive = change?.startsWith("+");
  const isNeutral = change === "0.00%";
  const formattedValue = formatCurrency(value, currency);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
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

/* ------------------------------------------------------------------ */
/*  Chart Placeholder                                                  */
/* ------------------------------------------------------------------ */
function ChartPlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
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

/* ------------------------------------------------------------------ */
/*  Empty State for Holdings Table                                     */
/* ------------------------------------------------------------------ */
function EmptyHoldingsTable({ onAddAssetClick }: { onAddAssetClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
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

/* ------------------------------------------------------------------ */
/*  Recent Activity (Empty)                                            */
/* ------------------------------------------------------------------ */
function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
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

/* ------------------------------------------------------------------ */
/*  Dashboard Content Shell                                            */
/* ------------------------------------------------------------------ */
export function DashboardContent({ baseCurrency }: { baseCurrency: string }) {
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Net Worth"
            value={0}
            currency={baseCurrency}
            change="0.00%"
            changeLabel="all time"
            icon={Wallet}
            delay={0}
          />
          <StatCard
            label="Today's P&L"
            value={0}
            currency={baseCurrency}
            change="0.00%"
            changeLabel="today"
            icon={TrendingUp}
            delay={0.05}
          />
          <StatCard
            label="Total Invested"
            value={0}
            currency={baseCurrency}
            icon={BarChart3}
            delay={0.1}
          />
          <StatCard
            label="Total Return"
            value={0}
            currency={baseCurrency}
            change="0.00%"
            changeLabel="all time"
            icon={TrendingDown}
            delay={0.15}
          />
        </div>

        {/* ── Chart ── */}
        <div className="mb-6">
          <ChartPlaceholder />
        </div>

        {/* ── Holdings + Activity Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EmptyHoldingsTable onAddAssetClick={() => setIsAddAssetOpen(true)} />
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>

      {/* ── Add Asset Modal Overlay ── */}
      <AnimatePresence>
        {isAddAssetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddAssetOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm dark:bg-black/80"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Add Transaction Ledger Entry
                </h3>
                <button
                  onClick={() => setIsAddAssetOpen(false)}
                  className="flex items-center justify-center size-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Form Body Placeholder */}
              <div className="min-h-[120px] flex items-center justify-center text-slate-400 dark:text-slate-500">
                <p className="text-[13px]">Transaction entry fields will be rendered here.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
