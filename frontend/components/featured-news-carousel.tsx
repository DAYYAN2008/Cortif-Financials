"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Clock } from "lucide-react";
import type { NewsArticle } from "@/types/news";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface FeaturedNewsCarouselProps {
  articles?: NewsArticle[];
}

/* ------------------------------------------------------------------ */
/*  Placeholder fallback data                                          */
/* ------------------------------------------------------------------ */
const PLACEHOLDER_ARTICLES: NewsArticle[] = [
  {
    id: 1,
    title: "Markets Rally as Federal Reserve Signals Rate Stability",
    link: "#",
    summary:
      "Major indices reached new highs today as the Federal Reserve indicated a steady approach to interest rates, boosting investor confidence across sectors.",
    published_date: new Date().toISOString(),
    image_url: null,
    source: "Market Updates",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Tech Sector Leads Global Equities Amid AI Investment Surge",
    link: "#",
    summary:
      "Technology stocks surged as companies announced increased AI infrastructure spending, driving a broad rally in global equity markets.",
    published_date: new Date().toISOString(),
    image_url: null,
    source: "Market Updates",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Bond Yields Dip as Inflation Data Comes in Below Expectations",
    link: "#",
    summary:
      "Treasury yields fell sharply after CPI data showed inflation cooling faster than economists predicted, raising hopes for monetary policy easing.",
    published_date: new Date().toISOString(),
    image_url: null,
    source: "Market Updates",
    created_at: new Date().toISOString(),
  },
];

/* ------------------------------------------------------------------ */
/*  Framer Motion variants                                             */
/* ------------------------------------------------------------------ */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 1.04,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    zIndex: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.96,
    zIndex: 0,
  }),
};

const springTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 30,
  mass: 1,
};

/* ------------------------------------------------------------------ */
/*  Helper: format published date                                      */
/* ------------------------------------------------------------------ */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHrs < 1) return "Just now";
    if (diffHrs < 24) return `${diffHrs}h ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "";
  }
}

/* ------------------------------------------------------------------ */
/*  Helper: display source name (backend now stores clean labels)       */
/* ------------------------------------------------------------------ */
function getSourceName(source: string): string {
  return source || "News";
}

/* ------------------------------------------------------------------ */
/*  Gradient placeholder for slides without images                     */
/* ------------------------------------------------------------------ */
const GRADIENT_PALETTES = [
  "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)",
  "linear-gradient(135deg, #0c1220 0%, #1a2744 40%, #2d4a7a 100%)",
  "linear-gradient(135deg, #0a0f1a 0%, #162032 40%, #1e3a5f 100%)",
  "linear-gradient(135deg, #0d1117 0%, #161b22 40%, #21262d 100%)",
];

/* ================================================================== */
/*  FeaturedNewsCarousel Component                                     */
/* ================================================================== */
export function FeaturedNewsCarousel({
  articles: externalArticles,
}: FeaturedNewsCarouselProps) {
  const articles =
    externalArticles && externalArticles.length > 0
      ? externalArticles
      : PLACEHOLDER_ARTICLES;

  const [[currentIndex, direction], setSlide] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);

  /* ── Navigation handlers ────────────────────────────────────────── */
  const paginate = useCallback(
    (newDirection: number) => {
      setSlide(([prev]) => {
        const next =
          (prev + newDirection + articles.length) % articles.length;
        return [next, newDirection];
      });
    },
    [articles.length],
  );

  const goToSlide = useCallback(
    (index: number) => {
      setSlide(([prev]) => [index, index > prev ? 1 : -1]);
    },
    [],
  );

  /* ── Keyboard navigation ────────────────────────────────────────── */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate]);

  /* ── Auto-play (pauses on hover) ────────────────────────────────── */
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => paginate(1), 6000);
    return () => clearInterval(timer);
  }, [isHovered, paginate]);

  const current = articles[currentIndex];

  /* ── Background style ───────────────────────────────────────────── */
  const bgStyle: React.CSSProperties = current.image_url
    ? { backgroundImage: `url(${current.image_url})` }
    : { background: GRADIENT_PALETTES[currentIndex % GRADIENT_PALETTES.length] };

  return (
    <section
      id="featured-news-carousel"
      className="relative w-full overflow-hidden select-none"
      style={{ height: "clamp(380px, 50vh, 540px)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-roledescription="carousel"
      aria-label="Featured financial news"
    >
      {/* ── Slides ─────────────────────────────────────────────────── */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.article
          key={current.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={springTransition}
          className="absolute inset-0 w-full h-full"
          aria-roledescription="slide"
          aria-label={`Slide ${currentIndex + 1} of ${articles.length}: ${current.title}`}
        >
          {/* Background image / gradient */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={bgStyle}
          />

          {/* Dark gradient overlay (bottom → top) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.15) 70%, transparent 100%)",
            }}
          />

          {/* Subtle noise texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* ── Content overlay ─────────────────────────────────────── */}
          <div className="relative z-10 flex flex-col justify-end h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-16 sm:pb-20">
            {/* Source badge + timestamp */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex items-center gap-3 mb-4"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/80">
                {getSourceName(current.source)}
              </span>
              <span className="flex items-center gap-1 text-[12px] text-white/50">
                <Clock className="size-3" />
                {formatDate(current.published_date)}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white max-w-3xl tracking-tight"
            >
              {current.title}
            </motion.h2>

            {/* Summary / excerpt */}
            {current.summary && (
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="mt-3 text-[15px] leading-relaxed text-white/65 max-w-2xl line-clamp-2"
              >
                {current.summary}
              </motion.p>
            )}

            {/* Read article link */}
            <motion.a
              href={current.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.35 }}
              className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-white/90 hover:text-white transition-colors group w-fit"
            >
              Read full article
              <ExternalLink className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.a>
          </div>
        </motion.article>
      </AnimatePresence>

      {/* ── Navigation Buttons ─────────────────────────────────────── */}
      <div className="absolute inset-y-0 left-0 z-20 flex items-center pl-3 sm:pl-5">
        <button
          id="carousel-prev"
          onClick={() => paginate(-1)}
          className="group flex items-center justify-center size-10 sm:size-11 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/15 hover:text-white hover:border-white/20 transition-all duration-200 cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-5 transition-transform group-hover:-translate-x-0.5" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 z-20 flex items-center pr-3 sm:pr-5">
        <button
          id="carousel-next"
          onClick={() => paginate(1)}
          className="group flex items-center justify-center size-10 sm:size-11 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/15 hover:text-white hover:border-white/20 transition-all duration-200 cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="size-5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* ── Dot indicators ─────────────────────────────────────────── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {articles.map((article, i) => (
          <button
            key={article.id}
            onClick={() => goToSlide(i)}
            className="group relative p-1 cursor-pointer"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === currentIndex ? "true" : undefined}
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-7 h-[3px] bg-white"
                  : "w-[3px] h-[3px] bg-white/35 group-hover:bg-white/60"
              }`}
            />
          </button>
        ))}
      </div>

      {/* ── Progress bar (auto-play indicator) ─────────────────────── */}
      {!isHovered && (
        <div className="absolute bottom-0 left-0 z-20 w-full h-[2px] bg-white/5">
          <motion.div
            key={currentIndex}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 6, ease: "linear" }}
            className="h-full bg-gradient-to-r from-white/20 via-white/40 to-white/20"
          />
        </div>
      )}
    </section>
  );
}
