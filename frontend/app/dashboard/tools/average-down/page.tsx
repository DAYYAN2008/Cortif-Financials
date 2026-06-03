"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, TrendingDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { formatCurrency, CURRENCY_GLYPHS } from "@/utils/currency";

export default function AverageDownCalculatorPage() {
  const [currentShares, setCurrentShares] = useState<string>("100");
  const [currentPrice, setCurrentPrice] = useState<string>("50");
  const [newShares, setNewShares] = useState<string>("50");
  const [newPrice, setNewPrice] = useState<string>("40");
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

  const currSharesVal = parseFloat(currentShares);
  const currPriceVal = parseFloat(currentPrice);
  const newSharesVal = parseFloat(newShares);
  const newPriceVal = parseFloat(newPrice);

  const isValid = 
    !isNaN(currSharesVal) && 
    !isNaN(currPriceVal) && 
    !isNaN(newSharesVal) && 
    !isNaN(newPriceVal) && 
    (currSharesVal > 0 || newSharesVal > 0);

  let totalShares = 0;
  let totalCapital = 0;
  let newAverage = 0;

  if (isValid) {
    totalShares = currSharesVal + newSharesVal;
    totalCapital = (currSharesVal * currPriceVal) + (newSharesVal * newPriceVal);
    if (totalShares > 0) {
      newAverage = totalCapital / totalShares;
    }
  }

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
        <div className="flex items-center justify-center size-10 rounded-lg bg-cyan-500/10 text-cyan-500 dark:bg-cyan-500/20 dark:text-cyan-400">
          <TrendingDown className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Average Down Calculator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Calculate your new break-even price when adding to a position.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-2">
        {/* Input Panel */}
        <div className="lg:col-span-5 flex flex-col space-y-6 rounded-2xl border border-slate-200/80 bg-white/80 p-6 lg:p-8 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/80">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
            Position Details
          </h3>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Current Shares
                </label>
                <input
                  type="number"
                  value={currentShares}
                  onChange={(e) => setCurrentShares(e.target.value)}
                  placeholder="100"
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700/60 dark:bg-slate-950/50 dark:text-white dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20 transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Average Price ({glyph})
                </label>
                <input
                  type="number"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  placeholder="50"
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700/60 dark:bg-slate-950/50 dark:text-white dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20 transition-all"
                />
              </div>
            </div>
            
            <div className="flex gap-4 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <div className="flex-1 mt-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  New Shares to Buy
                </label>
                <input
                  type="number"
                  value={newShares}
                  onChange={(e) => setNewShares(e.target.value)}
                  placeholder="50"
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700/60 dark:bg-slate-950/50 dark:text-white dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20 transition-all"
                />
              </div>
              <div className="flex-1 mt-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  New Purchase Price ({glyph})
                </label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="40"
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700/60 dark:bg-slate-950/50 dark:text-white dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 flex flex-col justify-center rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 lg:p-12 shadow-inner backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-8 relative z-10">
            Results
          </h3>
          
          {isValid && totalShares > 0 ? (
            <div className="space-y-10 relative z-10">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">New Break-Even Price</p>
                <div className="text-5xl lg:text-6xl font-bold tracking-tighter text-slate-900 dark:text-white transition-colors">
                  {formatCurrency(newAverage, currency)}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Total Shares Owned</p>
                  <div className="text-2xl lg:text-3xl font-semibold tracking-tight text-slate-700 dark:text-slate-300">
                    {totalShares.toLocaleString()}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Total Capital Deployed</p>
                  <div className="text-2xl lg:text-3xl font-semibold tracking-tight text-slate-700 dark:text-slate-300">
                    {formatCurrency(totalCapital, currency)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-center relative z-10">
              <TrendingDown className="size-10 mb-4 opacity-20" />
              <p>Please enter valid numbers to calculate new average.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
