"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMarketData } from "@/lib/use-market-data";
import type { ForexPair, CommodityAsset } from "@/types/market";

/* ------------------------------------------------------------------ */
/*  Category types                                                      */
/* ------------------------------------------------------------------ */
type Category = "forex" | "commodities";

/* ------------------------------------------------------------------ */
/*  Forex Card                                                          */
/* ------------------------------------------------------------------ */
function ForexCard({
  pair,
  onClick,
}: {
  pair: ForexPair;
  onClick: () => void;
}) {
  const isPositive = pair.change >= 0;

  return (
    <motion.button
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="snap-start shrink-0 w-56 bg-card border border-border rounded-2xl p-5 cursor-pointer group transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30 flex flex-col items-center gap-4"
    >
      {/* Flag Circles */}
      <div className="flex items-center -space-x-2">
        <div className="w-11 h-11 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xl z-10 shadow-sm">
          {pair.flagBase}
        </div>
        <div className="w-11 h-11 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xl shadow-sm">
          {pair.flagQuote}
        </div>
      </div>

      {/* Pair Label */}
      <div className="text-center">
        <p className="text-sm font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
          {pair.base}
          <span className="text-muted-foreground font-normal">/</span>
          {pair.quote}
        </p>
      </div>

      {/* Rate */}
      <p className="text-lg font-bold tabular-nums font-mono text-foreground">
        {pair.rate.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>

      {/* Change Badge */}
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tabular-nums ${
          isPositive
            ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20"
            : "bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="size-3" />
        ) : (
          <TrendingDown className="size-3" />
        )}
        {isPositive ? "+" : ""}
        {pair.change.toFixed(2)}%
      </span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Commodity Card                                                      */
/* ------------------------------------------------------------------ */
function CommodityCard({
  commodity,
  onClick,
}: {
  commodity: CommodityAsset;
  onClick: () => void;
}) {
  const isPositive = commodity.change >= 0;

  return (
    <motion.button
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="snap-start shrink-0 w-56 bg-card border border-border rounded-2xl p-5 cursor-pointer group transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30 flex flex-col items-center gap-4"
    >
      {/* Icon Circle */}
      <div className="w-12 h-12 rounded-full bg-secondary border border-border/60 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
        {commodity.icon}
      </div>

      {/* Name */}
      <p className="text-sm font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
        {commodity.name}
      </p>

      {/* Price + Unit */}
      <div className="text-center">
        <p className="text-lg font-bold tabular-nums font-mono text-foreground">
          ${commodity.price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
          {commodity.unit}
        </p>
      </div>

      {/* Change Badge */}
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tabular-nums ${
          isPositive
            ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20"
            : "bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="size-3" />
        ) : (
          <TrendingDown className="size-3" />
        )}
        {isPositive ? "+" : ""}
        {commodity.change.toFixed(2)}%
      </span>
    </motion.button>
  );
}

/* ================================================================== */
/*  MarketCarousel — Forex & Commodities Horizontal Scroll              */
/* ================================================================== */
interface MarketCarouselProps {}

export function MarketCarousel(props: MarketCarouselProps) {
  const { data } = useMarketData();
  const forex = data.forex;
  const commodities = data.commodities;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<Category>("forex");
  const router = useRouter();

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -280, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 280, behavior: "smooth" });
  };

  const targetPath =
    activeCategory === "forex"
      ? "/dashboard/markets?category=forex"
      : "/dashboard/markets?category=commodities";

  return (
    <section
      id="market-carousel"
      className="w-full max-w-[1400px] mx-auto px-4 pb-16"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 border-b border-border/50">
            {(["forex", "commodities"] as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-5 py-2.5 text-sm font-semibold capitalize transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
                {activeCategory === cat && (
                  <motion.div
                    layoutId="carousel-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(targetPath)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer mr-2 flex items-center gap-1"
          >
            View All
            <ChevronRight className="size-3.5" />
          </button>
          <button
            onClick={scrollLeft}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 hover:shadow-md cursor-pointer"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollRight}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 hover:shadow-md cursor-pointer"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 no-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {activeCategory === "forex"
                ? forex.map((pair) => (
                    <ForexCard
                      key={`${pair.base}-${pair.quote}`}
                      pair={pair}
                      onClick={() => router.push(targetPath)}
                    />
                  ))
                : commodities.map((commodity) => (
                    <CommodityCard
                      key={commodity.id}
                      commodity={commodity}
                      onClick={() => router.push(targetPath)}
                    />
                  ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Fade Gradients */}
        <div className="absolute top-0 bottom-4 left-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-4 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </section>
  );
}
