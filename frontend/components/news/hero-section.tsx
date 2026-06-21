"use client";

import { motion } from "framer-motion";
import { Clock, ExternalLink, Zap } from "lucide-react";
import type { NewsArticle } from "@/types/news";

/* ------------------------------------------------------------------ */
/*  Gradient fallbacks for articles without images                     */
/* ------------------------------------------------------------------ */
const GRADIENT_PALETTES = [
  "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)",
  "linear-gradient(135deg, #0c1220 0%, #1a2744 40%, #2d4a7a 100%)",
  "linear-gradient(135deg, #0a0f1a 0%, #162032 40%, #1e3a5f 100%)",
  "linear-gradient(135deg, #0d1117 0%, #161b22 40%, #21262d 100%)",
];

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
/*  Props                                                               */
/* ------------------------------------------------------------------ */
interface HeroSectionProps {
  featured: NewsArticle | null;
  bulletins: NewsArticle[];
}

/* ================================================================== */
/*  HeroSection                                                        */
/* ================================================================== */
export function HeroSection({ featured, bulletins }: HeroSectionProps) {
  if (!featured) return null;

  const bgStyle: React.CSSProperties = featured.image_url
    ? { backgroundImage: `url(${featured.image_url})` }
    : { background: GRADIENT_PALETTES[featured.id % GRADIENT_PALETTES.length] };

  return (
    <section
      id="news-hero-section"
      className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mb-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Featured Article ─────────────────────────────────── */}
        <motion.a
          href={featured.link}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="lg:col-span-2 group relative overflow-hidden rounded-2xl border border-slate-200/30 dark:border-slate-700/40 cursor-pointer"
          style={{ minHeight: "340px" }}
          id="news-hero-featured"
        >
          {/* Background image / gradient */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
            style={bgStyle}
          />

          {/* Gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Noise texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Content overlay */}
          <div className="relative z-10 flex flex-col justify-end h-full p-6 sm:p-8 min-h-[340px]">
            {/* Source + time */}
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/80">
                {featured.source || "News"}
              </span>
              <span className="flex items-center gap-1 text-[12px] text-white/50">
                <Clock className="size-3" />
                {relativeTime(featured.published_date)}
              </span>
              {featured.category && (
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                  {featured.category}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white max-w-2xl tracking-tight group-hover:text-emerald-100 transition-colors duration-300">
              {featured.title}
            </h2>

            {/* Summary */}
            {featured.summary && (
              <p className="mt-3 text-[15px] leading-relaxed text-white/60 max-w-xl line-clamp-2">
                {featured.summary}
              </p>
            )}

            {/* Read link */}
            <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-white/80 group-hover:text-white transition-colors w-fit">
              Read full article
              <ExternalLink className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </motion.a>

        {/* ── Right: Real-Time Bulletins ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="lg:col-span-1 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden"
          id="news-hero-bulletins"
        >
          {/* Bulletin items */}
          <div className="flex flex-col px-5 py-4">
            {bulletins.length === 0 ? (
              <p className="text-[13px] text-slate-400 dark:text-slate-500 py-4">
                No bulletins available.
              </p>
            ) : (
              bulletins.map((article, i) => (
                <a
                  key={article.id}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/bulletin block"
                >
                  <div className="py-3.5">
                    {/* Timestamp */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <Zap className="size-3 text-amber-500" />
                      <span className="text-[11px] font-semibold tabular-nums text-slate-400 dark:text-slate-500">
                        {relativeTime(article.published_date)}
                      </span>
                      <span className="text-[10px] text-slate-300 dark:text-slate-600">
                        · {article.source}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="text-[13px] font-medium leading-snug text-slate-700 dark:text-slate-200 line-clamp-2 group-hover/bulletin:text-emerald-600 dark:group-hover/bulletin:text-emerald-400 transition-colors">
                      {article.title}
                    </p>
                  </div>

                  {/* Divider */}
                  {i < bulletins.length - 1 && (
                    <div className="h-px bg-slate-100 dark:bg-slate-800/80" />
                  )}
                </a>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
