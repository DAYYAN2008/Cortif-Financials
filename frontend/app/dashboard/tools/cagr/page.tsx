"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { formatCurrency, CURRENCY_GLYPHS } from "@/utils/currency";

export default function CAGRCalculatorPage() {
  const [initial, setInitial] = useState<string>("10000");
  const [final, setFinal] = useState<string>("25000");
  const [years, setYears] = useState<string>("5");
  const [currency, setCurrency] = useState<string>("USD");

  const supabase = createClient();

  useEffect(() => {
    async function fetchCurrency() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("base_currency")
          .eq("id", user.id)
          .single();
        if (data?.base_currency) {
          setCurrency(data.base_currency);
        }
      }
    }
    fetchCurrency();
  }, []);

  const glyph = CURRENCY_GLYPHS[currency] || "$";

  const initialVal = parseFloat(initial);
  const finalVal = parseFloat(final);
  const yearsVal = parseFloat(years);

  const isValid = !isNaN(initialVal) && !isNaN(finalVal) && !isNaN(yearsVal) && initialVal !== 0 && yearsVal > 0;

  let cagr = 0;

  if (isValid) {
    if (finalVal >= 0 && initialVal > 0) {
        cagr = (Math.pow(finalVal / initialVal, 1 / yearsVal) - 1) * 100;
    }
  }

  // CAGR can be NaN if values are negative in a way that doesn't compute root correctly
  const isValidCagr = !isNaN(cagr) && isFinite(cagr);
  const isPositive = cagr >= 0;

  return (
    <div className="max-w-[1400px] mx-auto p-4 lg:p-8 flex flex-col space-y-8">
      <Link 
        href="/dashboard/tools" 
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors w-fit"
      >
        <ArrowLeft className="mr-2 size-4" />
        Back to Tools
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-lg bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400">
          <TrendingUp className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">CAGR Calculator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Compound Annual Growth Rate over a specific duration.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-2">
        {/* Input Panel */}
        <div className="lg:col-span-5 flex flex-col space-y-6 rounded-2xl border border-slate-200/80 bg-white/80 p-6 lg:p-8 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/80">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
            Growth Parameters
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Initial Value ({glyph})
              </label>
              <input
                type="number"
                value={initial}
                onChange={(e) => setInitial(e.target.value)}
                placeholder="e.g. 10000"
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-950/50 dark:text-white dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 transition-all"
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
                placeholder="e.g. 25000"
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-950/50 dark:text-white dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Duration (Years)
              </label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                placeholder="e.g. 5"
                min="0.1"
                step="0.1"
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-950/50 dark:text-white dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 flex flex-col justify-center rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 lg:p-12 shadow-inner backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/50 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          
          <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-8 relative z-10">
            Results
          </h3>
          
          {isValid && isValidCagr ? (
            <div className="space-y-6 relative z-10">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Annualized Growth Rate</p>
                <div className={cn(
                  "text-6xl lg:text-7xl font-bold tracking-tighter transition-colors",
                  isPositive ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                )}>
                  {isPositive ? "+" : ""}{cagr.toFixed(2)}%
                </div>
                <p className="mt-6 text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
                  Your investment changed by an average of <strong className={cn(
                    isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  )}>{Math.abs(cagr).toFixed(2)}%</strong> every year for {yearsVal} years.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-center relative z-10">
              <TrendingUp className="size-10 mb-4 opacity-20" />
              <p>Please enter valid positive numbers for initial value, final value, and years.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
