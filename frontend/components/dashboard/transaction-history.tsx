"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  Filter,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://dayyanyasir-cortif-backend.hf.space";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
interface Transaction {
  id: string;
  type: "BUY" | "SELL";
  assetName: string;
  ticker: string;
  date: string;
  quantity: number;
  price: number;
  total: number;
  fee: number | null;
  notes: string | null;
}

/* ------------------------------------------------------------------ */
/* Transaction Row                                                   */
/* ------------------------------------------------------------------ */
function TransactionRow({
  tx,
  currency,
  index,
}: {
  tx: Transaction;
  currency: string;
  index: number;
}) {
  const isBuy = tx.type === "BUY";

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
        "hover:bg-slate-50/80 dark:hover:bg-neutral-900/50"
      )}
    >
      {/* 1. Type */}
      <td className="px-5 py-4 whitespace-nowrap">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider",
            isBuy
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
          )}
        >
          {isBuy ? (
            <ArrowUpCircle className="size-3.5" />
          ) : (
            <ArrowDownCircle className="size-3.5" />
          )}
          {tx.type}
        </span>
      </td>

      {/* 2. Date */}
      <td className="px-5 py-4 whitespace-nowrap">
        <span className="text-[12px] text-slate-500 dark:text-slate-400">
          {tx.date}
        </span>
      </td>

      {/* 3. Assets */}
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-8 rounded-lg shrink-0 bg-slate-100 dark:bg-slate-800">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 tracking-wider">
              {tx.ticker.slice(0, 3)}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
              {tx.assetName}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              {tx.ticker}
            </span>
          </div>
        </div>
      </td>

      {/* 4. Price */}
      <td className="px-5 py-4 whitespace-nowrap text-right">
        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 font-mono tabular-nums">
          {formatCurrency(tx.price, currency)}
        </span>
      </td>

      {/* 5. Amount */}
      <td className="px-5 py-4 whitespace-nowrap text-right">
        <div className="flex flex-col items-end gap-0.5">
          <span
            className={cn(
              "text-[13px] font-semibold font-mono tabular-nums",
              isBuy ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}
          >
            {isBuy ? "+" : "-"}{tx.ticker === "BTC" ? tx.quantity.toFixed(4) : tx.quantity.toLocaleString()} {tx.ticker}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono tabular-nums">
            {formatCurrency(tx.total, currency)}
          </span>
        </div>
      </td>

      {/* 6. Fees */}
      <td className="px-5 py-4 whitespace-nowrap text-right">
        <span className="text-[12px] font-medium text-slate-600 dark:text-slate-400 font-mono tabular-nums">
          {tx.fee ? formatCurrency(tx.fee, currency) : "--"}
        </span>
      </td>

      {/* 7. Notes */}
      <td className="px-5 py-4">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 max-w-[120px] truncate block">
          {tx.notes && tx.notes.trim() !== "" ? tx.notes : "--"}
        </span>
      </td>

      {/* 8. Actions */}
      <td className="px-5 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button className="flex items-center justify-center size-7 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 transition-colors">
            <Pencil className="size-3.5" />
          </button>
          <button className="flex items-center justify-center size-7 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

/* ------------------------------------------------------------------ */
/* Exported Transaction History Component                             */
/* ------------------------------------------------------------------ */
export function TransactionHistory({
  baseCurrency,
}: {
  baseCurrency: string;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchLiveTransactions = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/portfolio/transactions`);

      if (!res.ok) {
        console.error(`Transaction history fetch failed (${res.status})`);
        return;
      }

      const rawData = await res.json();
      const parsedRows = Array.isArray(rawData) ? rawData : rawData?.transactions ?? [];

      const formatted: Transaction[] = parsedRows.map((row: any) => {
        const qty = parseFloat(row.quantity) || 0;
        const prc = parseFloat(row.execution_price) || 0;
        const fee = parseFloat(row.fee) || 0;
        
        const txDate = row.executed_at 
          ? new Date(row.executed_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Recent Date";

        return {
          id: row.id || Math.random().toString(),
          type: (row.transaction_type || "BUY").toUpperCase() as "BUY" | "SELL",
          assetName: row.asset_name || "Asset Registered",
          ticker: row.ticker || "???",
          date: txDate,
          quantity: qty,
          price: prc,
          total: qty * prc,
          fee: fee,
          notes: row.notes || null,
        };
      });

      setTransactions(formatted);
    } catch (err) {
      console.error("Failed to sync transaction history:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveTransactions();

    window.addEventListener("portfolio-updated", fetchLiveTransactions);
    return () => window.removeEventListener("portfolio-updated", fetchLiveTransactions);
  }, [fetchLiveTransactions]);

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
      {/* Section Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center size-7 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Clock className="size-3.5 text-slate-500 dark:text-slate-400" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-slate-900 dark:text-white">
              Transaction History
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">
              Recent buy & sell activity
            </p>
          </div>
          <span className="flex items-center justify-center h-5 px-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-1">
            {transactions.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button className="flex items-center justify-center size-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <Filter className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Tabular Data / Feed */}
      <div className="overflow-x-auto min-h-[160px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 w-full">
            <Loader2 className="size-5 animate-spin text-slate-400" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-400 dark:text-slate-500">
            No logged transaction history found.
          </div>
        ) : (
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/40">
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">Type</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">Date</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">Assets</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap text-right">Price</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap text-right">Amount / Value</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap text-right">Fees</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">Notes</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  currency={baseCurrency}
                  index={i}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center px-6 py-3 border-t border-slate-100 dark:border-slate-800/40"
      >
        <button className="text-[12px] font-medium text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer">
          View all transactions →
        </button>
      </motion.div>
    </motion.div>
  );
}