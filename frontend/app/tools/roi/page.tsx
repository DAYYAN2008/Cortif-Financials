"use client";

import { useState } from "react";
import { ArrowLeft, Calculator } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCurrency, CURRENCY_GLYPHS } from "@/utils/currency";

export default function ROICalculatorPage() {
  const [initial, setInitial] = useState<string>("1000");
  const [final, setFinal] = useState<string>("1500");
  const currency = "USD";

  const glyph = CURRENCY_GLYPHS[currency] || "$";

  const initialVal = parseFloat(initial);
  const finalVal = parseFloat(final);

  const isValid = !isNaN(initialVal) && !isNaN(finalVal) && initialVal !== 0;

  let profitLoss = 0;
  let roi = 0;

  if (isValid) {
    profitLoss = finalVal - initialVal;
    roi = (profitLoss / initialVal) * 100;
  }

  const isPositive = profitLoss >= 0;

  return (
    <div className="max-w-[1400px] mx-auto p-4 lg:p-8 flex flex-col space-y-8">
      <Link 
        href="/tools" 
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors w-fit"
      >
        <ArrowLeft className="mr-2 size-4" />
        Back to Tools
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-lg bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400">
          <Calculator className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">ROI Calculator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Calculate Return on Investment and absolute profit/loss.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-2">
        {/* Input Panel */}
        <div className="lg:col-span-5 flex flex-col space-y-6 rounded-2xl border border-slate-200/80 bg-white/80 p-6 lg:p-8 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/80">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
            Investment Parameters
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Initial Investment ({glyph})
              </label>
              <input
                type="number"
                value={initial}
                onChange={(e) => setInitial(e.target.value)}
                placeholder="e.g. 1000"
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/60 dark:bg-slate-950/50 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Final Value ({glyph})
              </label>
              <input
                type="number"
                value={final}
                onChange={(e) => setFinal(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/60 dark:bg-slate-950/50 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 flex flex-col justify-center rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 lg:p-12 shadow-inner backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-8 relative z-10">
            Results
          </h3>
          
          {isValid ? (
            <div className="space-y-10 relative z-10">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Total Profit / Loss</p>
                <div className={cn(
                  "text-5xl lg:text-6xl font-bold tracking-tighter transition-colors",
                  isPositive ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                )}>
                  {isPositive ? "+" : "-"}{formatCurrency(Math.abs(profitLoss), currency)}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Return on Investment (ROI)</p>
                <div className={cn(
                  "text-4xl lg:text-5xl font-bold tracking-tight transition-colors",
                  isPositive ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                )}>
                  {isPositive ? "+" : ""}{roi.toFixed(2)}%
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-slate-500 relative z-10">
              <Calculator className="size-10 mb-4 opacity-20" />
              <p>Please enter valid non-zero values to see results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
