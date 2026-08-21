"use client";

import { useState } from "react";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCurrency, CURRENCY_GLYPHS } from "@/utils/currency";

export default function PositionRiskManagerPage() {
  const [capital, setCapital] = useState<string>("10000");
  const [riskTolerance, setRiskTolerance] = useState<string>("2");
  const [entryPrice, setEntryPrice] = useState<string>("150");
  const [stopLoss, setStopLoss] = useState<string>("140");
  const currency = "USD";

  const glyph = CURRENCY_GLYPHS[currency] || "$";

  const capitalVal = parseFloat(capital);
  const riskTolVal = parseFloat(riskTolerance);
  const entryVal = parseFloat(entryPrice);
  const stopLossVal = parseFloat(stopLoss);

  const isValid = !isNaN(capitalVal) && !isNaN(riskTolVal) && !isNaN(entryVal) && !isNaN(stopLossVal) && capitalVal > 0;
  const isInvalidStopLoss = isValid && stopLossVal >= entryVal;

  let maxRiskAmount = 0;
  let maxShares = 0;
  let riskPerShare = 0;

  if (isValid && !isInvalidStopLoss) {
    maxRiskAmount = capitalVal * (riskTolVal / 100);
    riskPerShare = entryVal - stopLossVal;
    if (riskPerShare > 0) {
      maxShares = maxRiskAmount / riskPerShare;
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 lg:p-8 flex flex-col space-y-8">
      <Link href="/tools" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors w-fit">
        <ArrowLeft className="mr-2 size-4" />
        Back to Tools
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-lg bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400">
          <ShieldAlert className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Position Risk Manager</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Calculate optimal position sizing based on risk tolerance and stop-loss.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-2">
        <div className="lg:col-span-5 flex flex-col space-y-6 rounded-2xl border border-slate-200/80 bg-white/80 p-6 lg:p-8 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/80">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Trade Parameters</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Total Capital ({glyph})</label>
                <input type="number" value={capital} onChange={(e) => setCapital(e.target.value)} placeholder="10000" className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700/60 dark:bg-slate-950/50 dark:text-white dark:focus:border-amber-400 dark:focus:ring-amber-400/20 transition-all" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Risk Tolerance (%)</label>
                <input type="number" value={riskTolerance} onChange={(e) => setRiskTolerance(e.target.value)} placeholder="2" step="0.1" className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700/60 dark:bg-slate-950/50 dark:text-white dark:focus:border-amber-400 dark:focus:ring-amber-400/20 transition-all" />
              </div>
            </div>
            <div className="flex gap-4 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <div className="flex-1 mt-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Entry Price ({glyph})</label>
                <input type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} placeholder="150" className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700/60 dark:bg-slate-950/50 dark:text-white dark:focus:border-amber-400 dark:focus:ring-amber-400/20 transition-all" />
              </div>
              <div className="flex-1 mt-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Stop-Loss Price ({glyph})</label>
                <input type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} placeholder="140" className={cn("w-full rounded-xl border bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all dark:bg-slate-950/50 dark:text-white", isInvalidStopLoss ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500" : "border-slate-200 focus:border-amber-500 focus:ring-amber-500/20 dark:border-slate-700/60 dark:focus:border-amber-400 dark:focus:ring-amber-400/20")} />
              </div>
            </div>
            {isInvalidStopLoss && (<p className="text-sm text-red-500 dark:text-red-400 mt-2">Stop-loss price must be lower than the entry price for long positions.</p>)}
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col justify-center rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 lg:p-12 shadow-inner backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-8 relative z-10">Risk & Sizing</h3>
          {isValid && !isInvalidStopLoss ? (
            <div className="space-y-10 relative z-10">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Max Position Size</p>
                <div className="text-5xl lg:text-6xl font-bold tracking-tighter text-slate-900 dark:text-white transition-colors flex items-baseline gap-2">
                  {Math.floor(maxShares).toLocaleString()} <span className="text-2xl lg:text-3xl font-semibold text-slate-400 dark:text-slate-500 tracking-normal">shares</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Max Risk Amount</p>
                <div className="text-2xl lg:text-3xl font-semibold tracking-tight text-red-500 dark:text-red-400">{formatCurrency(maxRiskAmount, currency)}</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-center relative z-10">
              <ShieldAlert className="size-10 mb-4 opacity-20" />
              <p>Please enter valid trade parameters to calculate sizing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
