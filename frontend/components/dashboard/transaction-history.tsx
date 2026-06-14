"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Clock,
  Filter,
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
interface Transaction {
  id: string;
  type: "BUY" | "SELL";
  assetName: string;
  ticker: string;
  date: string;
  quantity: number;
  price: number;
  total: number;
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "group flex items-center gap-4 px-5 py-4",
        "border-b border-slate-100/80 dark:border-slate-800/40 last:border-b-0",
        "transition-colors duration-200",
        "hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
      )}
    >
      {/* Type Icon */}
      <div
        className={cn(
          "flex items-center justify-center size-9 rounded-lg shrink-0",
          isBuy
            ? "bg-emerald-50 dark:bg-emerald-500/10"
            : "bg-red-50 dark:bg-red-500/10"
        )}
      >
        {isBuy ? (
          <ArrowUpCircle className="size-[18px] text-emerald-600 dark:text-emerald-400" />
        ) : (
          <ArrowDownCircle className="size-[18px] text-red-600 dark:text-red-400" />
        )}
      </div>

      {/* Asset + Type Label */}
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
            {tx.assetName}
          </span>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">•</span>
          <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
            {tx.ticker}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
              isBuy
                ? "bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 dark:bg-red-400/10 text-red-600 dark:text-red-400"
            )}
          >
            {tx.type}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {tx.date}
          </span>
        </div>
      </div>

      {/* Quantity & Price */}
      <div className="hidden sm:flex flex-col items-end shrink-0">
        <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300 font-mono tabular-nums">
          {tx.ticker === "BTC" ? tx.quantity.toFixed(4) : tx.quantity.toLocaleString()}{" "}
          <span className="text-slate-400 dark:text-slate-500">×</span>{" "}
          {formatCurrency(tx.price, currency)}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
          Qty × Price
        </span>
      </div>

      {/* Total Volume */}
      <div className="flex flex-col items-end shrink-0 min-w-[90px]">
        <span className="text-[13px] font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
          {isBuy ? "−" : "+"}{formatCurrency(tx.total, currency)}
        </span>
        <span
          className={cn(
            "text-[10px] font-medium mt-0.5",
            isBuy ? "text-emerald-500 dark:text-emerald-400/70" : "text-red-500 dark:text-red-400/70"
          )}
        >
          {isBuy ? "Invested" : "Received"}
        </span>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Exported Transaction History Component                             */
/* ------------------------------------------------------------------ */
export function TransactionHistory({
  baseCurrency,
  onLogTransaction,
}: {
  baseCurrency: string;
  onLogTransaction: () => void;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchLiveTransactions = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };

      // Query raw logging table entries
      const res = await fetch(`${BACKEND_URL}/api/transactions`, { headers });
      
      let rawData = [];
      if (res.ok) {
        rawData = await res.json();
      } else {
        // Fallback validation mapping path variant if needed
        const altRes = await fetch(`${BACKEND_URL}/api/v1/portfolio/transactions`, { headers });
        if (altRes.ok) {
          rawData = await altRes.json();
        }
      }

      // Handle raw array mapping configurations safely
      const parsedRows = Array.isArray(rawData) ? rawData : rawData?.transactions ?? [];

      const formatted: Transaction[] = parsedRows.map((row: any) => {
        const qty = parseFloat(row.quantity) || 0;
        const prc = parseFloat(row.execution_price) || 0;
        
        // Format native Postgres date stamp safely
        const txDate = row.executed_at 
          ? new Date(row.executed_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
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
        };
      });

      setTransactions(formatted);
    } catch (err) {
      console.error("Failed to sync structural ledger data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase.auth]);

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

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLogTransaction}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
              "text-[12px] font-medium transition-all cursor-pointer",
              "bg-emerald-600 text-white hover:bg-emerald-500",
              "dark:bg-emerald-500 dark:hover:bg-emerald-400",
              "shadow-sm shadow-emerald-600/20 dark:shadow-emerald-500/15"
            )}
          >
            <Plus className="size-3.5" />
            <span>Log Transaction</span>
          </motion.button>
        </div>
      </div>

      {/* Timeline / Feed */}
      <div className="relative min-h-[80px]">
        {/* Left timeline accent line */}
        <div className="absolute left-[37px] top-4 bottom-4 w-px bg-gradient-to-b from-slate-200 via-slate-200/60 to-transparent dark:from-slate-700 dark:via-slate-700/40 hidden sm:block" />

        {isLoading ? (
          <div className="flex items-center justify-center py-10 w-full">
            <Loader2 className="size-5 animate-spin text-slate-400" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-400 dark:text-slate-500">
            No logged transaction history found.
          </div>
        ) : (
          transactions.map((tx, i) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              currency={baseCurrency}
              index={i}
            />
          ))
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