"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Search,
  RefreshCw,
  Calendar,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/lib/use-market-data";
import type {
  MarketAsset,
  ForexPair,
  CommodityAsset,
  PayoutAsset,
} from "@/types/market";

/* ------------------------------------------------------------------ */
/*  Tab Types                                                           */
/* ------------------------------------------------------------------ */
const TABS = [
  { key: "all",         label: "All Markets" },
  { key: "stocks",      label: "Stocks" },
  { key: "mutual-funds", label: "Mutual Funds" },
  { key: "forex",       label: "Forex" },
  { key: "commodities", label: "Commodities" },
  { key: "dividends",   label: "Dividends" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* ------------------------------------------------------------------ */
/*  Mini SVG Sparkline                                                  */
/* ------------------------------------------------------------------ */
function Sparkline({
  data,
  positive,
}: {
  data?: number[];
  positive: boolean;
}) {
  if (!data || data.length < 2) return null;

  const w = 64;
  const h = 24;
  const step = w / (data.length - 1);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(" ");

  const strokeColor = positive ? "#34d399" : "#f87171";
  const fillId = `spark-${positive ? "g" : "r"}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#${fillId})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Change Badge                                                        */
/* ------------------------------------------------------------------ */
function ChangeBadge({
  change,
  absChange,
}: {
  change: number;
  absChange?: number;
}) {
  const isPositive = change >= 0;
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-[12px] font-semibold tabular-nums",
          isPositive
            ? "text-emerald-500 dark:text-emerald-400"
            : "text-red-500 dark:text-red-400"
        )}
      >
        {isPositive ? (
          <TrendingUp className="size-3" />
        ) : (
          <TrendingDown className="size-3" />
        )}
        {isPositive ? "+" : ""}
        {change.toFixed(2)}%
      </span>
      {absChange !== undefined && (
        <span
          className={cn(
            "text-[10px] tabular-nums font-mono",
            isPositive
              ? "text-emerald-500/60 dark:text-emerald-400/60"
              : "text-red-500/60 dark:text-red-400/60"
          )}
        >
          {isPositive ? "+" : ""}
          {absChange.toFixed(2)}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stock Table                                                         */
/* ------------------------------------------------------------------ */
function StockTable({
  assets,
  onRowClick,
}: {
  assets: MarketAsset[];
  onRowClick: (symbol: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40">
            <th className="text-left px-4 py-3">Asset</th>
            <th className="text-right px-4 py-3">Price (PKR)</th>
            <th className="text-right px-4 py-3">24h</th>
            <th className="text-right px-4 py-3 hidden md:table-cell">24h Volume</th>
            <th className="text-right px-4 py-3 hidden lg:table-cell">52W High</th>
            <th className="text-right px-4 py-3 hidden lg:table-cell">52W Low</th>
            <th className="px-4 py-3 w-20">Chart</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a, idx) => (
            <motion.tr
              key={a.symbol}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => onRowClick(a.symbol)}
              className="border-b border-slate-50 dark:border-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/40 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 tracking-wider">
                      {a.symbol.slice(0, 3)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {a.symbol}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      {a.name}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-right text-[13px] font-semibold tabular-nums font-mono text-slate-900 dark:text-white">
                {a.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 text-right">
                <ChangeBadge change={a.change} absChange={a.absChange} />
              </td>
              <td className="px-4 py-3 text-right text-[12px] tabular-nums font-mono text-slate-500 dark:text-slate-400 hidden md:table-cell">
                {a.volume ?? "—"}
              </td>
              <td className="px-4 py-3 text-right text-[12px] tabular-nums font-mono text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                {a.high52w?.toFixed(2) ?? "—"}
              </td>
              <td className="px-4 py-3 text-right text-[12px] tabular-nums font-mono text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                {a.low52w?.toFixed(2) ?? "—"}
              </td>
              <td className="px-4 py-3">
                <Sparkline data={a.sparkline} positive={a.change >= 0} />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mutual Fund Table                                                   */
/* ------------------------------------------------------------------ */
function MutualFundTable({
  assets,
  onRowClick,
}: {
  assets: MarketAsset[];
  onRowClick: (symbol: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px]">
        <thead>
          <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40">
            <th className="text-left px-4 py-3">Fund</th>
            <th className="text-right px-4 py-3">NAV (PKR)</th>
            <th className="text-right px-4 py-3">24h</th>
            <th className="text-right px-4 py-3 hidden md:table-cell">AUM</th>
            <th className="px-4 py-3 w-20">Chart</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a, idx) => (
            <motion.tr
              key={a.symbol}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => onRowClick(a.symbol)}
              className="border-b border-slate-50 dark:border-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200/60 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                      {a.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {a.name}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      {a.symbol}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-right text-[13px] font-semibold tabular-nums font-mono text-slate-900 dark:text-white">
                {a.price.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right">
                <ChangeBadge change={a.change} absChange={a.absChange} />
              </td>
              <td className="px-4 py-3 text-right text-[12px] tabular-nums font-mono text-slate-500 dark:text-slate-400 hidden md:table-cell">
                {a.aum ? `Rs. ${a.aum}` : "—"}
              </td>
              <td className="px-4 py-3">
                <Sparkline data={a.sparkline} positive={a.change >= 0} />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Forex Table                                                         */
/* ------------------------------------------------------------------ */
function ForexTable({
  pairs,
  onRowClick,
}: {
  pairs: ForexPair[];
  onRowClick: (symbol: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px]">
        <thead>
          <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40">
            <th className="text-left px-4 py-3">Pair</th>
            <th className="text-right px-4 py-3">Exchange Rate</th>
            <th className="text-right px-4 py-3">24h</th>
            <th className="px-4 py-3 w-20">Chart</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((p, idx) => {
            const symbol = `${p.base}${p.quote}`;
            return (
              <motion.tr
                key={symbol}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => onRowClick(symbol)}
                className="border-b border-slate-50 dark:border-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center -space-x-1.5">
                      <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-sm z-10">
                        {p.flagBase}
                      </span>
                      <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-sm">
                        {p.flagQuote}
                      </span>
                    </div>
                    <p className="text-[13px] font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {p.base}
                      <span className="text-slate-400 font-normal">/</span>
                      {p.quote}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-[13px] font-semibold tabular-nums font-mono text-slate-900 dark:text-white">
                  {p.rate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-right">
                  <ChangeBadge change={p.change} />
                </td>
                <td className="px-4 py-3">
                  <Sparkline data={p.sparkline} positive={p.change >= 0} />
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Commodities Table                                                   */
/* ------------------------------------------------------------------ */
function CommoditiesTable({
  commodities,
  onRowClick,
}: {
  commodities: CommodityAsset[];
  onRowClick: (symbol: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px]">
        <thead>
          <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40">
            <th className="text-left px-4 py-3">Commodity</th>
            <th className="text-right px-4 py-3">Price (PKR)</th>
            <th className="text-right px-4 py-3">24h</th>
            <th className="px-4 py-3 w-20">Chart</th>
          </tr>
        </thead>
        <tbody>
          {commodities.map((c, idx) => (
            <motion.tr
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => onRowClick(c.id)}
              className="border-b border-slate-50 dark:border-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 flex items-center justify-center text-base shrink-0">
                    {c.icon}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {c.name}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {c.unit}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-right text-[13px] font-semibold tabular-nums font-mono text-slate-900 dark:text-white">
                {c.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 text-right">
                <ChangeBadge change={c.change} />
              </td>
              <td className="px-4 py-3">
                <Sparkline data={c.sparkline} positive={c.change >= 0} />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dividends Table                                                     */
/* ------------------------------------------------------------------ */
function DividendsTable({
  payouts,
  onRowClick,
}: {
  payouts: PayoutAsset[];
  onRowClick: (symbol: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px]">
        <thead>
          <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40">
            <th className="text-left px-4 py-3">Ticker</th>
            <th className="text-left px-4 py-3">Company</th>
            <th className="text-right px-4 py-3">Ex-Date</th>
            <th className="text-right px-4 py-3">Yield</th>
            <th className="text-center px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((p, idx) => {
            const exDate = new Date(p.exDate);
            const formatted = exDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            return (
              <motion.tr
                key={p.symbol}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => onRowClick(p.symbol)}
                className="border-b border-slate-50 dark:border-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3">
                  <p className="text-[13px] font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-mono">
                    {p.symbol}
                  </p>
                </td>
                <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">
                  {p.name}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center gap-1.5 justify-end text-[12px] text-slate-500 dark:text-slate-400">
                    <Calendar className="size-3" />
                    <span className="tabular-nums">{formatted}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-[13px] font-semibold tabular-nums font-mono text-emerald-600 dark:text-emerald-400">
                  {p.yieldPct.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">
                    {p.indicator}
                  </span>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================== */
/*  MarketTerminal — Full Dashboard Component                          */
/* ================================================================== */
export function MarketTerminal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabKey) || "all";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, isConnected, refetch } = useMarketData();

  const handleRowClick = (symbol: string) => {
    router.push(`/dashboard/markets/${symbol}`);
  };

  // Filter data by search query
  const filteredStocks = useMemo(() => {
    if (!searchQuery) return data.stocks;
    const q = searchQuery.toLowerCase();
    return data.stocks.filter(
      (a) =>
        a.symbol.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
    );
  }, [data.stocks, searchQuery]);

  const filteredMutualFunds = useMemo(() => {
    if (!searchQuery) return data.mutualFunds;
    const q = searchQuery.toLowerCase();
    return data.mutualFunds.filter(
      (a) =>
        a.symbol.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
    );
  }, [data.mutualFunds, searchQuery]);

  const filteredForex = useMemo(() => {
    if (!searchQuery) return data.forex;
    const q = searchQuery.toLowerCase();
    return data.forex.filter(
      (p) =>
        p.base.toLowerCase().includes(q) ||
        p.quote.toLowerCase().includes(q)
    );
  }, [data.forex, searchQuery]);

  const filteredCommodities = useMemo(() => {
    if (!searchQuery) return data.commodities;
    const q = searchQuery.toLowerCase();
    return data.commodities.filter((c) =>
      c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
  }, [data.commodities, searchQuery]);

  const filteredPayouts = useMemo(() => {
    if (!searchQuery) return data.payouts;
    const q = searchQuery.toLowerCase();
    return data.payouts.filter(
      (p) =>
        p.symbol.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q)
    );
  }, [data.payouts, searchQuery]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Market Overview
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
          Real-time market data terminal — equities, funds, forex, commodities & dividends
        </p>
      </motion.div>

      {/* ── Search + Refresh ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5"
      >
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets, pairs, or commodities..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800/60 dark:bg-slate-900/80 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20 transition-all"
          />
        </div>
        {/* Connection Status Badge */}
        <div className={cn(
          "flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider border",
          isConnected
            ? "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
            : isLoading
            ? "border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400"
            : "border-red-200/60 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
        )}>
          {isConnected ? (
            <>
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-50" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <Wifi className="size-3" />
              Live
            </>
          ) : isLoading ? (
            <>
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-50" />
                <span className="relative inline-flex rounded-full size-2 bg-amber-500" />
              </span>
              Connecting
            </>
          ) : (
            <>
              <WifiOff className="size-3" />
              Offline
            </>
          )}
        </div>

        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium transition-all cursor-pointer border",
            "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            "dark:border-slate-800/60 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:bg-slate-800",
            isLoading && "opacity-50 pointer-events-none"
          )}
        >
          <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
          Reconnect
        </button>
      </motion.div>

      {/* ── Tab Navigation ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center gap-1 overflow-x-auto pb-1 mb-6 border-b border-slate-100 dark:border-slate-800/60 no-scrollbar"
        style={{ scrollbarWidth: "none" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "relative px-4 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0",
              activeTab === tab.key
                ? "text-slate-900 dark:text-white"
                : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            )}
          >
            {tab.label}
            {activeTab === tab.key && (
              <motion.div
                layoutId="terminal-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </motion.div>

      {/* ── Table Content ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className={cn(
          "rounded-xl border overflow-hidden",
          "border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/80"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* All Markets */}
            {activeTab === "all" && (
              <div>
                {/* Stocks section */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/40">
                  <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Stocks
                  </h3>
                </div>
                <StockTable assets={filteredStocks} onRowClick={handleRowClick} />

                {/* Mutual Funds section */}
                <div className="px-4 py-3 border-b border-t border-slate-100 dark:border-slate-800/40">
                  <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Mutual Funds
                  </h3>
                </div>
                <MutualFundTable assets={filteredMutualFunds} onRowClick={handleRowClick} />

                {/* Forex section */}
                <div className="px-4 py-3 border-b border-t border-slate-100 dark:border-slate-800/40">
                  <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Forex
                  </h3>
                </div>
                <ForexTable pairs={filteredForex} onRowClick={handleRowClick} />

                {/* Commodities section */}
                <div className="px-4 py-3 border-b border-t border-slate-100 dark:border-slate-800/40">
                  <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Commodities
                  </h3>
                </div>
                <CommoditiesTable commodities={filteredCommodities} onRowClick={handleRowClick} />

                {/* Dividends section */}
                <div className="px-4 py-3 border-b border-t border-slate-100 dark:border-slate-800/40">
                  <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Upcoming Dividends
                  </h3>
                </div>
                <DividendsTable payouts={filteredPayouts} onRowClick={handleRowClick} />
              </div>
            )}

            {activeTab === "stocks" && (
              <StockTable assets={filteredStocks} onRowClick={handleRowClick} />
            )}

            {activeTab === "mutual-funds" && (
              <MutualFundTable assets={filteredMutualFunds} onRowClick={handleRowClick} />
            )}

            {activeTab === "forex" && (
              <ForexTable pairs={filteredForex} onRowClick={handleRowClick} />
            )}

            {activeTab === "commodities" && (
              <CommoditiesTable commodities={filteredCommodities} onRowClick={handleRowClick} />
            )}

            {activeTab === "dividends" && (
              <DividendsTable payouts={filteredPayouts} onRowClick={handleRowClick} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}
