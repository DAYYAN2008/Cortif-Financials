"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  PieChart,
  Download,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PortfolioAnalytics } from "@/components/dashboard/portfolio-analytics";
import { PortfolioHoldings } from "@/components/dashboard/portfolio-holdings";
import { TransactionHistory } from "@/components/dashboard/transaction-history";

/* ------------------------------------------------------------------ */
/*  Portfolio Page Content Shell                                       */
/* ------------------------------------------------------------------ */
export function PortfolioPageContent({
  baseCurrency,
}: {
  baseCurrency: string;
}) {
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Accent icon */}
              <div
                className={cn(
                  "flex items-center justify-center size-10 rounded-xl",
                  "bg-emerald-50 dark:bg-emerald-500/10",
                  "ring-1 ring-emerald-200/60 dark:ring-emerald-500/20"
                )}
              >
                <Briefcase className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Portfolio Assets
                </h1>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage your current holdings and asset performance.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg",
                  "text-[12px] font-medium transition-all cursor-pointer",
                  "text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50",
                  "dark:text-slate-400 dark:hover:text-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800",
                  "border border-slate-200/80 dark:border-slate-800/60",
                  "shadow-sm dark:shadow-none"
                )}
              >
                <PieChart className="size-3.5" />
                <span>Allocation View</span>
              </button>
              <button
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg",
                  "text-[12px] font-medium transition-all cursor-pointer",
                  "text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50",
                  "dark:text-slate-400 dark:hover:text-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800",
                  "border border-slate-200/80 dark:border-slate-800/60",
                  "shadow-sm dark:shadow-none"
                )}
              >
                <Download className="size-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Analytics Panel (Donut + Quick Stats) ── */}
        <PortfolioAnalytics baseCurrency={baseCurrency} />

        {/* ── Holdings Ledger ── */}
        <div className="mb-6">
          <PortfolioHoldings baseCurrency={baseCurrency} />
        </div>

        {/* ── Transaction History Feed ── */}
        <TransactionHistory
          baseCurrency={baseCurrency}
          onLogTransaction={() => setIsAddAssetOpen(true)}
        />
      </div>

      {/* ── Add Asset / Log Transaction Modal ── */}
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
