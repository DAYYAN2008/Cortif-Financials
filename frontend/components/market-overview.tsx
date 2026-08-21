"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Calendar,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMarketData } from "@/lib/use-market-data";
import type { MarketAsset, PayoutAsset } from "@/types/market";

/* ------------------------------------------------------------------ */
/*  Tab filter types                                                    */
/* ------------------------------------------------------------------ */
type TabFilter = "active" | "gainers" | "losers";

const TAB_OPTIONS: { key: TabFilter; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "gainers", label: "Gainers" },
  { key: "losers", label: "Losers" },
];

/* ------------------------------------------------------------------ */
/*  Asset Row                                                           */
/* ------------------------------------------------------------------ */
function AssetRow({
  asset,
  onClick,
  index,
}: {
  asset: MarketAsset;
  onClick: () => void;
  index: number;
}) {
  const isPositive = asset.change > 0;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent/50 transition-colors duration-150 cursor-pointer group border-b border-border/50 last:border-b-0"
    >
      {/* Left: Symbol + Name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary/5 border border-border/60 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-primary tracking-wider">
            {asset.symbol.slice(0, 3)}
          </span>
        </div>
        <div className="min-w-0 text-left">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {asset.symbol}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {asset.name}
          </p>
        </div>
      </div>

      {/* Right: Price + Change */}
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold tabular-nums font-mono text-foreground">
          {asset.price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <span
          className={`inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums ${
            isPositive
              ? "text-emerald-500 dark:text-emerald-400"
              : "text-red-500 dark:text-red-400"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          {isPositive ? "+" : ""}
          {asset.change.toFixed(2)}%
        </span>
      </div>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Pill Tab Selector                                                   */
/* ------------------------------------------------------------------ */
function PillTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: TabFilter;
  onTabChange: (tab: TabFilter) => void;
  layoutGroup: string;
}) {
  return (
    <div className="flex items-center gap-1 p-0.5 rounded-full bg-secondary/60 border border-border/50">
      {TAB_OPTIONS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`relative px-3 py-1 text-[11px] font-medium rounded-full transition-all duration-200 cursor-pointer ${
            activeTab === tab.key
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {activeTab === tab.key && (
            <motion.div
              layoutId={`pill-indicator-${layoutGroup}`}
              className="absolute inset-0 bg-primary rounded-full"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Asset List Card (Stocks or Mutual Funds)                           */
/* ------------------------------------------------------------------ */
function AssetListCard({
  title,
  assets,
  targetPath,
  layoutGroup,
}: {
  title: string;
  assets: MarketAsset[];
  targetPath: string;
  layoutGroup: string;
}) {
  const [activeTab, setActiveTab] = useState<TabFilter>("active");
  const router = useRouter();

  const filteredAssets = useMemo(() => {
    switch (activeTab) {
      case "gainers":
        return [...assets]
          .filter((a) => a.change > 0)
          .sort((a, b) => b.change - a.change);
      case "losers":
        return [...assets]
          .filter((a) => a.change < 0)
          .sort((a, b) => a.change - b.change);
      default:
        return assets;
    }
  }, [assets, activeTab]);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-primary/15 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="text-base font-bold text-foreground tracking-tight">
          {title}
        </h3>
        <PillTabs activeTab={activeTab} onTabChange={setActiveTab} layoutGroup={layoutGroup} />
      </div>

      {/* Asset List */}
      <div className="flex-1 min-h-0 overflow-y-auto max-h-[360px]">
        <AnimatePresence mode="popLayout">
          {filteredAssets.length > 0 ? (
            filteredAssets.map((asset, idx) => (
              <AssetRow
                key={`${layoutGroup}-${asset.symbol}`}
                asset={asset}
                index={idx}
                onClick={() => router.push(targetPath)}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-12 text-sm text-muted-foreground"
            >
              No {activeTab === "gainers" ? "gaining" : "losing"} assets
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View All Footer */}
      <div className="border-t border-border/50 px-5 py-3">
        <button
          onClick={() => router.push(targetPath)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
        >
          View All
          <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Payout Row                                                          */
/* ------------------------------------------------------------------ */
function PayoutRow({
  payout,
  onClick,
  index,
}: {
  payout: PayoutAsset;
  onClick: () => void;
  index: number;
}) {
  const exDate = new Date(payout.exDate);
  const formatted = exDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent/50 transition-colors duration-150 cursor-pointer group border-b border-border/50 last:border-b-0"
    >
      {/* Left: XD Badge + Symbol */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[10px] font-black tracking-wide bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 shrink-0">
          {payout.indicator}
        </span>
        <div className="min-w-0 text-left">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {payout.symbol}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {payout.name}
          </p>
        </div>
      </div>

      {/* Right: Ex-Date + Yield */}
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-0.5 justify-end">
          <Calendar className="size-3" />
          <span className="tabular-nums">{formatted}</span>
        </div>
        <span className="text-sm font-semibold tabular-nums font-mono text-emerald-500 dark:text-emerald-400">
          {payout.yieldPct.toFixed(2)}%
        </span>
      </div>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Upcoming Payouts Card                                               */
/* ------------------------------------------------------------------ */
function UpcomingPayoutsCard({
  payouts,
  targetPath,
}: {
  payouts: PayoutAsset[];
  targetPath: string;
}) {
  const router = useRouter();

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-primary/15 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="text-base font-bold text-foreground tracking-tight">
          Upcoming Payouts
        </h3>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">
          Dividends
        </span>
      </div>

      {/* Column Labels */}
      <div className="flex items-center justify-between px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold border-b border-border/50">
        <span className="pl-11">Asset</span>
        <span>Yield / Ex-Date</span>
      </div>

      {/* Payout List */}
      <div className="flex-1 min-h-0 overflow-y-auto max-h-[330px]">
        {payouts.map((payout, idx) => (
          <PayoutRow
            key={payout.symbol}
            payout={payout}
            index={idx}
            onClick={() => router.push(targetPath)}
          />
        ))}
      </div>

      {/* View All Footer */}
      <div className="border-t border-border/50 px-5 py-3">
        <button
          onClick={() => router.push(targetPath)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
        >
          View All
          <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  MarketOverview — 3-Column Grid Container                           */
/* ================================================================== */
interface MarketOverviewProps {}

export function MarketOverview(props: MarketOverviewProps) {
  const { data, feedStatus } = useMarketData();

  // Format the lastUpdated timestamp for display
  const lastUpdatedLabel = (() => {
    if (!data.lastUpdated) return null;
    try {
      const ts = new Date(data.lastUpdated);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - ts.getTime()) / 1000);
      if (diffSec < 5) return "just now";
      if (diffSec < 60) return `${diffSec}s ago`;
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      return ts.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return null;
    }
  })();

  return (
    <section
      id="market-overview"
      className="w-full max-w-[1400px] mx-auto px-4 py-12"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Market Overview
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Real-time snapshots across equities, funds & upcoming dividends
          </p>
        </div>
        {/* Feed Status + Last Updated */}
        <div className="flex items-center gap-2">
          {feedStatus === "stale" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <span className="relative flex size-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-50" />
                <span className="relative inline-flex rounded-full size-1.5 bg-amber-500" />
              </span>
              Cached
            </span>
          )}
          {lastUpdatedLabel && (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              Updated {lastUpdatedLabel}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <AssetListCard
          title="Stocks"
          assets={data.stocks}
          targetPath="/dashboard/markets"
          layoutGroup="stocks"
        />
        <AssetListCard
          title="Mutual Funds"
          assets={data.mutualFunds}
          targetPath="/dashboard/markets?tab=mutual-funds"
          layoutGroup="mf"
        />
        <UpcomingPayoutsCard
          payouts={data.payouts}
          targetPath="/dashboard/markets?tab=dividends"
        />
      </div>
    </section>
  );
}
