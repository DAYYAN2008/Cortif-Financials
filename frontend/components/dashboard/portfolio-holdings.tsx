"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Briefcase,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Holding {
  id: string;
  name: string;
  ticker: string;
  type: "stock" | "crypto" | "commodity";
  allocation: number;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  pnlAbsolute: number;
  pnlPercent: number;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_HOLDINGS: Holding[] = [
  {
    id: "1",
    name: "Apple Inc.",
    ticker: "AAPL",
    type: "stock",
    allocation: 34.2,
    quantity: 45,
    avgBuyPrice: 178.25,
    currentPrice: 213.07,
    totalValue: 9588.15,
    pnlAbsolute: 1566.90,
    pnlPercent: 19.53,
  },
  {
    id: "2",
    name: "Tesla Inc.",
    ticker: "TSLA",
    type: "stock",
    allocation: 22.8,
    quantity: 18,
    avgBuyPrice: 242.50,
    currentPrice: 355.18,
    totalValue: 6393.24,
    pnlAbsolute: 2028.24,
    pnlPercent: 46.46,
  },
  {
    id: "3",
    name: "Bitcoin",
    ticker: "BTC",
    type: "crypto",
    allocation: 31.5,
    quantity: 0.128,
    avgBuyPrice: 52340.00,
    currentPrice: 68942.35,
    totalValue: 8824.62,
    pnlAbsolute: 2125.11,
    pnlPercent: 31.73,
  },
  {
    id: "4",
    name: "Gold (XAU)",
    ticker: "GOLD",
    type: "commodity",
    allocation: 11.5,
    quantity: 1.65,
    avgBuyPrice: 2048.30,
    currentPrice: 1954.10,
    totalValue: 3224.27,
    pnlAbsolute: -155.43,
    pnlPercent: -4.60,
  },
];

/* ------------------------------------------------------------------ */
/*  Asset Type Badge                                                   */
/* ------------------------------------------------------------------ */
function AssetTypeBadge({ type }: { type: Holding["type"] }) {
  const config = {
    stock: {
      label: "Stock",
      bg: "bg-blue-500/10 dark:bg-blue-400/10",
      text: "text-blue-600 dark:text-blue-400",
    },
    crypto: {
      label: "Crypto",
      bg: "bg-amber-500/10 dark:bg-amber-400/10",
      text: "text-amber-600 dark:text-amber-400",
    },
    commodity: {
      label: "Cmdty",
      bg: "bg-violet-500/10 dark:bg-violet-400/10",
      text: "text-violet-600 dark:text-violet-400",
    },
  };

  const { label, bg, text } = config[type];

  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
        bg,
        text
      )}
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Allocation Bar                                                     */
/* ------------------------------------------------------------------ */
function AllocationBar({ percent }: { percent: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="hidden sm:block w-14 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 font-mono tabular-nums">
        {percent.toFixed(1)}%
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  P&L Cell                                                           */
/* ------------------------------------------------------------------ */
function PnlCell({
  absolute,
  percent,
  currency,
}: {
  absolute: number;
  percent: number;
  currency: string;
}) {
  const isPositive = absolute >= 0;

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex items-center gap-1">
        {isPositive ? (
          <ArrowUpRight className="size-3 text-emerald-500 dark:text-emerald-400" />
        ) : (
          <ArrowDownRight className="size-3 text-red-500 dark:text-red-400" />
        )}
        <span
          className={cn(
            "text-[13px] font-semibold font-mono tabular-nums",
            isPositive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          )}
        >
          {isPositive ? "+" : ""}
          {formatCurrency(Math.abs(absolute), currency)}
        </span>
      </div>
      <span
        className={cn(
          "text-[11px] font-medium font-mono tabular-nums",
          isPositive
            ? "text-emerald-500/80 dark:text-emerald-400/60"
            : "text-red-500/80 dark:text-red-400/60"
        )}
      >
        {isPositive ? "+" : ""}
        {percent.toFixed(2)}%
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Table Row                                                          */
/* ------------------------------------------------------------------ */
function HoldingRow({
  holding,
  currency,
  index,
}: {
  holding: Holding;
  currency: string;
  index: number;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: 0.15 + index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "group border-b border-slate-100/80 dark:border-slate-800/40 last:border-b-0",
        "transition-colors duration-200",
        "hover:bg-slate-50/80 dark:hover:bg-slate-800/30",
        "cursor-pointer"
      )}
    >
      {/* Asset Name & Ticker */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Icon circle */}
          <div
            className={cn(
              "hidden sm:flex items-center justify-center size-9 rounded-lg shrink-0",
              "bg-slate-100 dark:bg-slate-800/80",
              "group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700/60",
              "transition-colors duration-200"
            )}
          >
            <Briefcase className="size-4 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                {holding.name}
              </span>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                •
              </span>
              <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                {holding.ticker}
              </span>
            </div>
            <div className="mt-0.5">
              <AssetTypeBadge type={holding.type} />
            </div>
          </div>
        </div>
      </td>

      {/* Allocation */}
      <td className="px-4 py-4">
        <AllocationBar percent={holding.allocation} />
      </td>

      {/* Quantity */}
      <td className="px-4 py-4 text-right">
        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 font-mono tabular-nums">
          {holding.type === "crypto"
            ? holding.quantity.toFixed(4)
            : holding.quantity.toLocaleString()}
        </span>
      </td>

      {/* Avg. Buy Price — hidden on mobile */}
      <td className="px-4 py-4 text-right hidden lg:table-cell">
        <span className="text-[13px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
          {formatCurrency(holding.avgBuyPrice, currency)}
        </span>
      </td>

      {/* Current Price — hidden on small screens */}
      <td className="px-4 py-4 text-right hidden md:table-cell">
        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 font-mono tabular-nums">
          {formatCurrency(holding.currentPrice, currency)}
        </span>
      </td>

      {/* Total Value */}
      <td className="px-4 py-4 text-right">
        <span className="text-[13px] font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
          {formatCurrency(holding.totalValue, currency)}
        </span>
      </td>

      {/* Unrealized P&L */}
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <PnlCell
            absolute={holding.pnlAbsolute}
            percent={holding.pnlPercent}
            currency={currency}
          />
          <ChevronRight className="size-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      </td>
    </motion.tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Summary Footer                                                     */
/* ------------------------------------------------------------------ */
function TableFooter({ currency }: { currency: string }) {
  const totalValue = MOCK_HOLDINGS.reduce((s, h) => s + h.totalValue, 0);
  const totalPnl = MOCK_HOLDINGS.reduce((s, h) => s + h.pnlAbsolute, 0);
  const totalCost = MOCK_HOLDINGS.reduce(
    (s, h) => s + h.avgBuyPrice * h.quantity,
    0
  );
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  const isPositive = totalPnl >= 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="flex items-center justify-between px-6 py-4 border-t border-slate-200/80 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50"
    >
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Total Portfolio
        </span>
        <span className="flex items-center justify-center h-5 px-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {MOCK_HOLDINGS.length} assets
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-[14px] font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
            {formatCurrency(totalValue, currency)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="size-3.5 text-emerald-500" />
          ) : (
            <TrendingDown className="size-3.5 text-red-500" />
          )}
          <span
            className={cn(
              "text-[13px] font-semibold font-mono tabular-nums",
              isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {isPositive ? "+" : ""}
            {formatCurrency(totalPnl, currency)}
          </span>
          <span
            className={cn(
              "text-[11px] font-medium font-mono tabular-nums ml-0.5",
              isPositive
                ? "text-emerald-500/80 dark:text-emerald-400/60"
                : "text-red-500/80 dark:text-red-400/60"
            )}
          >
            ({isPositive ? "+" : ""}
            {totalPnlPercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Holdings Table Component                                      */
/* ------------------------------------------------------------------ */
export function PortfolioHoldings({ baseCurrency }: { baseCurrency: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-xl border overflow-hidden",
        "border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/80",
        "shadow-sm dark:shadow-none"
      )}
    >
      {/* ── Table Header Bar ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[14px] font-semibold text-slate-900 dark:text-white">
            Holdings Ledger
          </h2>
          <span className="flex items-center justify-center h-5 px-1.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {MOCK_HOLDINGS.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Search button */}
          <button
            className={cn(
              "flex items-center justify-center size-8 rounded-lg",
              "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
              "dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800",
              "transition-colors cursor-pointer"
            )}
            aria-label="Search holdings"
          >
            <Search className="size-4" />
          </button>
          {/* Filter button */}
          <button
            className={cn(
              "flex items-center justify-center size-8 rounded-lg",
              "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
              "dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800",
              "transition-colors cursor-pointer"
            )}
            aria-label="Filter holdings"
          >
            <SlidersHorizontal className="size-4" />
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          {/* Column Headers */}
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/40">
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Asset
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Allocation
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Quantity
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 hidden lg:table-cell">
                Avg. Price
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 hidden md:table-cell">
                Current Price
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Total Value
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Unrealized P&L
              </th>
            </tr>
          </thead>

          {/* Data Rows */}
          <tbody>
            {MOCK_HOLDINGS.map((holding, i) => (
              <HoldingRow
                key={holding.id}
                holding={holding}
                currency={baseCurrency}
                index={i}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Summary Footer ── */}
      <TableFooter currency={baseCurrency} />
    </motion.div>
  );
}
