"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, Crown } from "lucide-react";
import type { NewsArticle } from "@/types/news";

/* ------------------------------------------------------------------ */
/*  Ticker extraction — client-side scan of title/summary              */
/* ------------------------------------------------------------------ */

/** Well-known financial tickers to detect in article text */
const KNOWN_TICKERS: string[] = [
  "AAPL", "MSFT", "GOOGL", "GOOG", "AMZN", "TSLA", "NVDA", "META",
  "NFLX", "AMD", "INTC", "JPM", "BAC", "GS", "WMT", "DIS", "CRM",
  "COIN", "MSTR", "PLTR", "SPY", "QQQ",
  "BTC", "ETH", "SOL", "XRP", "BNB", "ADA", "DOGE",
  "GOLD", "OIL", "BRENT",
];

/** Natural language names → ticker symbol mapping for crypto */
const CRYPTO_NAME_MAP: Record<string, string> = {
  BITCOIN: "BTC",
  ETHEREUM: "ETH",
  SOLANA: "SOL",
  RIPPLE: "XRP",
  BINANCE: "BNB",
  CARDANO: "ADA",
  DOGECOIN: "DOGE",
};

/** Minimum symbol length to avoid false-positive matches on short words */
const MIN_SYMBOL_LENGTH = 3;

function extractTickers(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toUpperCase();
  const found: string[] = [];
  const seen = new Set<string>();

  for (const symbol of KNOWN_TICKERS) {
    if (seen.has(symbol)) continue;

    // Match "$AAPL" or standalone "AAPL"
    const patterns = [
      new RegExp(`\\$${symbol}\\b`),
      new RegExp(`\\b${symbol}\\b`),
    ];

    let matched = patterns.some((p) => p.test(text));

    // Also match natural language crypto names
    if (!matched) {
      const nameEntry = Object.entries(CRYPTO_NAME_MAP).find(
        ([, sym]) => sym === symbol
      );
      if (nameEntry && text.includes(nameEntry[0])) {
        matched = true;
      }
    }

    if (matched) {
      seen.add(symbol);
      // Skip too-short symbols that could false positive
      if (symbol.length < MIN_SYMBOL_LENGTH && !["GS", "BTC", "ETH", "SOL", "XRP", "BNB"].includes(symbol)) {
        continue;
      }
      found.push(symbol);
    }
  }

  return found.slice(0, 3); // Max 3 tickers per article
}

/* ------------------------------------------------------------------ */
/*  Premium source detection                                            */
/* ------------------------------------------------------------------ */
const PREMIUM_SOURCES = [
  "wsj",
  "wall street journal",
  "bloomberg",
  "financial times",
  "barron",
  "economist",
];

function isPremiumSource(source: string): boolean {
  const lower = source.toLowerCase();
  return PREMIUM_SOURCES.some((s) => lower.includes(s));
}

/* ------------------------------------------------------------------ */
/*  Helper: relative time                                               */
/* ------------------------------------------------------------------ */
function relativeTime(dateStr: string): string {
  try {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60_000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

/* ------------------------------------------------------------------ */
/*  Gradient fallbacks                                                  */
/* ------------------------------------------------------------------ */
const MESH_GRADIENTS = [
  "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
  "linear-gradient(135deg, #0c1220 0%, #1a2744 50%, #0d1117 100%)",
  "linear-gradient(135deg, #0a0f1a 0%, #162032 50%, #0d1117 100%)",
  "linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)",
];

/* ------------------------------------------------------------------ */
/*  Ticker Tag — static neutral discovery badge                         */
/* ------------------------------------------------------------------ */
function TickerTag({ symbol }: { symbol: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-500 dark:text-neutral-400 select-none">
      ${symbol}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Article Row                                                         */
/* ------------------------------------------------------------------ */
function ArticleRow({
  article,
  index,
}: {
  article: NewsArticle;
  index: number;
}) {
  // Memoize ticker extraction so it only runs when title/summary changes
  const tickers = useMemo(
    () => extractTickers(article.title, article.summary),
    [article.title, article.summary]
  );
  const premium = isPremiumSource(article.source);

  return (
    <motion.a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      className="group flex items-start gap-4 rounded-xl p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors duration-200 cursor-pointer"
      id={`news-stream-row-${article.id}`}
    >
      {/* ── Thumbnail ────────────────────────────────────────────── */}
      <div className="relative w-24 h-24 md:w-32 md:h-20 rounded-lg overflow-hidden shrink-0 border border-slate-200/40 dark:border-slate-700/40">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background:
                MESH_GRADIENTS[article.id % MESH_GRADIENTS.length],
            }}
          />
        )}
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 py-0.5">
        {/* Title */}
        <h3 className="text-[14px] sm:text-[15px] font-semibold leading-snug text-slate-800 dark:text-slate-100 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
          {article.title}
        </h3>

        {/* Source + time + premium badge */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {article.source}
          </span>
          <span className="text-[11px] text-slate-300 dark:text-slate-600">·</span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            <Clock className="size-2.5" />
            {relativeTime(article.published_date)}
          </span>
          {premium && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-700/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              <Crown className="size-2.5" />
              Pro
            </span>
          )}
        </div>

        {/* Summary */}
        {article.summary && (
          <p className="mt-1.5 text-[12px] sm:text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
            {article.summary}
          </p>
        )}

        {/* Ticker tags — mobile (shown below summary) */}
        {tickers.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 sm:hidden flex-wrap">
            {tickers.map((symbol) => (
              <TickerTag key={symbol} symbol={symbol} />
            ))}
          </div>
        )}
      </div>

      {/* ── Ticker tags — desktop (right column) ─────────────────── */}
      {tickers.length > 0 && (
        <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
          {tickers.map((symbol) => (
            <TickerTag key={symbol} symbol={symbol} />
          ))}
        </div>
      )}
    </motion.a>
  );
}

/* ================================================================== */
/*  NewsStream                                                          */
/* ================================================================== */

interface NewsStreamProps {
  articles: NewsArticle[];
}

export function NewsStream({ articles }: NewsStreamProps) {
  if (articles.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-[14px] text-slate-400 dark:text-slate-500">
          No articles found for this category.
        </p>
      </div>
    );
  }

  return (
    <section
      id="news-stream"
      className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 pb-16"
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4 px-3 sm:px-4">
        <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-800" />
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 shrink-0">
          Latest Intelligence
        </h2>
        <div className="h-px flex-1 bg-gradient-to-l from-slate-200 to-transparent dark:from-slate-800" />
      </div>

      {/* Article rows */}
      <div className="flex flex-col gap-1">
        {articles.map((article, i) => (
          <ArticleRow key={article.id} article={article} index={i} />
        ))}
      </div>
    </section>
  );
}
