"use client";

import { motion } from "framer-motion";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Clock,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
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
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    type: "BUY",
    assetName: "Tesla Inc.",
    ticker: "TSLA",
    date: "May 28, 2026",
    quantity: 8,
    price: 348.60,
    total: 2788.80,
  },
  {
    id: "t2",
    type: "BUY",
    assetName: "Bitcoin",
    ticker: "BTC",
    date: "May 15, 2026",
    quantity: 0.045,
    price: 67210.00,
    total: 3024.45,
  },
  {
    id: "t3",
    type: "SELL",
    assetName: "Apple Inc.",
    ticker: "AAPL",
    date: "Apr 30, 2026",
    quantity: 12,
    price: 208.40,
    total: 2500.80,
  },
  {
    id: "t4",
    type: "BUY",
    assetName: "Gold (XAU)",
    ticker: "GOLD",
    date: "Apr 12, 2026",
    quantity: 0.75,
    price: 2048.30,
    total: 1536.23,
  },
  {
    id: "t5",
    type: "BUY",
    assetName: "Apple Inc.",
    ticker: "AAPL",
    date: "Mar 22, 2026",
    quantity: 20,
    price: 182.15,
    total: 3643.00,
  },
];

/* ------------------------------------------------------------------ */
/*  Transaction Row                                                    */
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
        delay: 0.15 + index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "group flex items-center gap-4 px-5 py-4",
        "border-b border-slate-100/80 dark:border-slate-800/40 last:border-b-0",
        "transition-colors duration-200",
        "hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
      )}
    >
      {/* ── Type Icon ── */}
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

      {/* ── Asset + Type Label ── */}
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
            {tx.assetName}
          </span>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            •
          </span>
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

      {/* ── Quantity & Price (hidden on smallest screens) ── */}
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

      {/* ── Total Volume ── */}
      <div className="flex flex-col items-end shrink-0 min-w-[90px]">
        <span
          className={cn(
            "text-[13px] font-semibold font-mono tabular-nums",
            isBuy
              ? "text-slate-900 dark:text-white"
              : "text-slate-900 dark:text-white"
          )}
        >
          {isBuy ? "−" : "+"}{formatCurrency(tx.total, currency)}
        </span>
        <span
          className={cn(
            "text-[10px] font-medium mt-0.5",
            isBuy
              ? "text-emerald-500 dark:text-emerald-400/70"
              : "text-red-500 dark:text-red-400/70"
          )}
        >
          {isBuy ? "Invested" : "Received"}
        </span>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported Transaction History Component                             */
/* ------------------------------------------------------------------ */
export function TransactionHistory({
  baseCurrency,
  onLogTransaction,
}: {
  baseCurrency: string;
  onLogTransaction: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-xl border overflow-hidden",
        "border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/80",
        "shadow-sm dark:shadow-none"
      )}
    >
      {/* ── Section Header ── */}
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
            {MOCK_TRANSACTIONS.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Filter button */}
          <button
            className={cn(
              "flex items-center justify-center size-8 rounded-lg",
              "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
              "dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800",
              "transition-colors cursor-pointer"
            )}
            aria-label="Filter transactions"
          >
            <Filter className="size-3.5" />
          </button>

          {/* Log New Transaction button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLogTransaction}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
              "text-[12px] font-medium transition-all cursor-pointer",
              "bg-emerald-600 text-white hover:bg-emerald-500",
              "dark:bg-emerald-500 dark:hover:bg-emerald-400",
              "shadow-sm shadow-emerald-600/20 dark:shadow-emerald-500/15",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            )}
          >
            <Plus className="size-3.5" />
            <span>Log Transaction</span>
          </motion.button>
        </div>
      </div>

      {/* ── Timeline / Feed ── */}
      <div className="relative">
        {/* Left timeline accent line */}
        <div className="absolute left-[37px] top-4 bottom-4 w-px bg-gradient-to-b from-slate-200 via-slate-200/60 to-transparent dark:from-slate-700 dark:via-slate-700/40 hidden sm:block" />

        {MOCK_TRANSACTIONS.map((tx, i) => (
          <TransactionRow
            key={tx.id}
            tx={tx}
            currency={baseCurrency}
            index={i}
          />
        ))}
      </div>

      {/* ── Footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center px-6 py-3 border-t border-slate-100 dark:border-slate-800/40"
      >
        <button
          className={cn(
            "text-[12px] font-medium",
            "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300",
            "transition-colors cursor-pointer"
          )}
        >
          View all transactions →
        </button>
      </motion.div>
    </motion.div>
  );
}
