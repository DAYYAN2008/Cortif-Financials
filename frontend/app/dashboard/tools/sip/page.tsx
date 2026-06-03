"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, PiggyBank } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { formatCurrency, CURRENCY_GLYPHS } from "@/utils/currency";

export default function SIPCalculatorPage() {
  const [monthly, setMonthly] = useState<string>("500");
  const [rate, setRate] = useState<string>("12");
  const [years, setYears] = useState<string>("10");
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

  const monthlyVal = parseFloat(monthly);
  const rateVal = parseFloat(rate);
  const yearsVal = parseFloat(years);

  const isValid = 
    !isNaN(monthlyVal) && 
    !isNaN(rateVal) && 
    !isNaN(yearsVal) && 
    monthlyVal > 0 && 
    yearsVal > 0;

  let futureValue = 0;
  let totalInvested = 0;
  let wealthGained = 0;

  if (isValid) {
    if (rateVal === 0) {
      futureValue = monthlyVal * (yearsVal * 12);
    } else {
      const monthlyRate = (rateVal / 100) / 12;
      const totalMonths = yearsVal * 12;
      futureValue = monthlyVal * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    }
    totalInvested = monthlyVal * (yearsVal * 12);
    wealthGained = futureValue - totalInvested;
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
        <div className="flex items-center justify-center size-10 rounded-lg bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 dark:text-purple-400">
          <PiggyBank className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">SIP Auto-Invest</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Project wealth growth through Systematic Investment Plans.</p>
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
                Monthly Investment ({glyph})
              </label>
              <input
                type="number"
                value={monthly}
                onChange={(e) => setMonthly(e.target.value)}
                placeholder="e.g. 500"
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700/60 dark:bg-slate-950/50 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Expected Annual Return (%)
              </label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="e.g. 12"
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700/60 dark:bg-slate-950/50 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20 transition-all"
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
                placeholder="e.g. 10"
                min="0.1"
                step="1"
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700/60 dark:bg-slate-950/50 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 flex flex-col justify-center rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 lg:p-12 shadow-inner backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/50 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl translate-y-1/3 translate-x-1/3 pointer-events-none" />
          
          <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-8 relative z-10">
            Results
          </h3>
          
          {isValid ? (
            <div className="space-y-8 relative z-10">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Total Future Value</p>
                <div className="text-5xl lg:text-6xl font-bold tracking-tighter text-slate-900 dark:text-white transition-colors">
                  {formatCurrency(futureValue, currency)}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Total Invested</p>
                  <div className="text-2xl lg:text-3xl font-semibold tracking-tight text-slate-700 dark:text-slate-300">
                    {formatCurrency(totalInvested, currency)}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Wealth Gained</p>
                  <div className="text-2xl lg:text-3xl font-semibold tracking-tight text-emerald-500 dark:text-emerald-400">
                    +{formatCurrency(wealthGained, currency)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-center relative z-10">
              <PiggyBank className="size-10 mb-4 opacity-20" />
              <p>Please enter valid positive numbers for monthly investment and years.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
