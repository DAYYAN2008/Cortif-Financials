"use client";

import { useEffect, useState, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import { createClient } from "@/utils/supabase/client";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://dayyanyasir-cortif-backend.hf.space";

/* ------------------------------------------------------------------ */
/* Types                                                              */
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
/* Asset Type Badge                                                   */
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

  const currentConfig = config[type] || config.stock;

  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
        currentConfig.bg,
        currentConfig.text
      )}
    >
      {currentConfig.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Allocation Bar                                                     */
/* ------------------------------------------------------------------ */
function AllocationBar({ percent }: { percent: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="hidden sm:block w-14 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 font-mono tabular-nums">
        {percent.toFixed(1)}%
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* P&L Cell                                                           */
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
/* Table Row                                                          */
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
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "group border-b border-slate-100/80 dark:border-slate-800/40 last:border-b-0",
        "transition-colors duration-200",
        "hover:bg-slate-50/80 dark:hover:bg-slate-800/30",
        "cursor-pointer"
      )}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center justify-center size-9 rounded-lg shrink-0 bg-slate-100 dark:bg-slate-800/80 group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700/60 transition-colors duration-200">
            <Briefcase className="size-4 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                {holding.name}
              </span>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">•</span>
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

      <td className="px-4 py-4">
        <AllocationBar percent={holding.allocation} />
      </td>

      <td className="px-4 py-4 text-right">
        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 font-mono tabular-nums">
          {holding.type === "crypto"
            ? holding.quantity.toFixed(4)
            : holding.quantity.toLocaleString()}
        </span>
      </td>

      <td className="px-4 py-4 text-right hidden lg:table-cell">
        <span className="text-[13px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
          {formatCurrency(holding.avgBuyPrice, currency)}
        </span>
      </td>

      <td className="px-4 py-4 text-right hidden md:table-cell">
        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 font-mono tabular-nums">
          {formatCurrency(holding.currentPrice, currency)}
        </span>
      </td>

      <td className="px-4 py-4 text-right">
        <span className="text-[13px] font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
          {formatCurrency(holding.totalValue, currency)}
        </span>
      </td>

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
/* Summary Footer                                                    */
/* ------------------------------------------------------------------ */
function TableFooter({ holdings, currency }: { holdings: Holding[]; currency: string }) {
  const totalValue = holdings.reduce((sum, item) => sum + item.totalValue, 0);
  const totalPnl = holdings.reduce((sum, item) => sum + item.pnlAbsolute, 0);
  const totalCost = holdings.reduce((sum, item) => sum + (item.avgBuyPrice * item.quantity), 0);
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  const isPositive = totalPnl >= 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between px-6 py-4 border-t border-slate-200/80 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50"
    >
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Total Portfolio
        </span>
        <span className="flex items-center justify-center h-5 px-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {holdings.length} assets
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
              isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}
          >
            {isPositive ? "+" : ""}
            {formatCurrency(totalPnl, currency)}
          </span>
          <span
            className={cn(
              "text-[11px] font-medium font-mono tabular-nums ml-0.5",
              isPositive ? "text-emerald-500/80 dark:text-emerald-400/60" : "text-red-500/80 dark:text-red-400/60"
            )}
          >
            ({isPositive ? "+" : ""}{totalPnlPercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Holdings Table Component                                      */
/* ------------------------------------------------------------------ */
export function PortfolioHoldings({ baseCurrency }: { baseCurrency: string }) {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchLiveHoldings = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch(`${BACKEND_URL}/api/v1/portfolio/holdings`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        throw new Error(`Holdings fetch failed (${res.status})`);
      }

      const data = await res.json();
      const rows = Array.isArray(data) ? data : data?.holdings ?? [];
      renderHoldingsRows(rows);
    } catch (err: any) {
      console.error("Holdings hydration error:", err);
      setError(err.message || "Data hydration failed.");
    } finally {
      setIsLoading(false);
    }
  }, [supabase.auth]);

  const renderHoldingsRows = (rawRows: any[]) => {
    const totalBookValue = rawRows.reduce((acc, r) => acc + (parseFloat(r.total_cost) || 0), 0);
    
    const formatted: Holding[] = rawRows.map((row: any) => {
      const totalCost = parseFloat(row.total_cost) || 0;
      const alloc = totalBookValue > 0 ? (totalCost / totalBookValue) * 100 : 0;
      const qty = parseFloat(row.net_quantity) || 0;
      const avgPrice = parseFloat(row.average_cost_basis) || 0;

      return {
        id: row.asset_id || Math.random().toString(),
        name: row.asset_name || "Unknown Asset",
        ticker: row.ticker || "???",
        type: (row.asset_type || "stock").toLowerCase() as Holding["type"],
        allocation: alloc,
        quantity: qty,
        avgBuyPrice: avgPrice,
        currentPrice: avgPrice, // Will be bound live via target WebSockets streaming ticker loops
        totalValue: totalCost,
        pnlAbsolute: 0, // Cold ledger baseline maps to uniform cost basis initially
        pnlPercent: 0,
      };
    });

    setHoldings(formatted);
  };

  useEffect(() => {
    fetchLiveHoldings();

    // Bind event hook triggered by modal transaction completions
    window.addEventListener("portfolio-updated", fetchLiveHoldings);
    return () => window.removeEventListener("portfolio-updated", fetchLiveHoldings);
  }, [fetchLiveHoldings]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/80">
        <Loader2 className="size-6 animate-spin text-slate-400 mb-2" />
        <p className="text-xs text-slate-500">Hydrating user transaction ledger...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-xl border overflow-hidden",
        "border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/80",
        "shadow-sm dark:shadow-none"
      )}
    >
      {/* Table Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[14px] font-semibold text-slate-900 dark:text-white">
            Holdings Ledger
          </h2>
          <span className="flex items-center justify-center h-5 px-1.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {holdings.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button className="flex items-center justify-center size-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <Search className="size-4" />
          </button>
          <button className="flex items-center justify-center size-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <SlidersHorizontal className="size-4" />
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/40">
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Asset</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Allocation</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Quantity</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 hidden lg:table-cell">Avg. Price</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 hidden md:table-cell">Current Price</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Value</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Unrealized P&L</th>
            </tr>
          </thead>
          <tbody>
            {holdings.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-sm text-slate-400 dark:text-slate-500">
                  No assets added to ledger. Click add asset above to initialize your holdings portfolio.
                </td>
              </tr>
            ) : (
              holdings.map((holding, i) => (
                <HoldingRow
                  key={holding.id}
                  holding={holding}
                  currency={baseCurrency}
                  index={i}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <TableFooter holdings={holdings} currency={baseCurrency} />
    </motion.div>
  );
}