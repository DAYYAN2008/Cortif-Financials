"use client";

import { useState, useCallback, useTransition, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { NewsArticle, NewsCategory } from "@/types/news";
import { CategoryNav } from "@/components/news/category-nav";
import { HeroSection } from "@/components/news/hero-section";
import { NewsStream } from "@/components/news/news-stream";
import { HeroSkeleton, StreamSkeleton } from "@/components/news/news-skeletons";

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */
interface NewsDashboardProps {
  initialArticles: NewsArticle[];
}

/* ------------------------------------------------------------------ */
/*  API helper — client-side category re-fetch                         */
/* ------------------------------------------------------------------ */
async function fetchArticles(
  category: NewsCategory,
  limit = 25
): Promise<NewsArticle[]> {
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const params = new URLSearchParams({ limit: String(limit) });
  if (category !== "all") {
    params.set("category", category);
  }

  try {
    const res = await fetch(`${backendUrl}/api/news/latest?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.articles ?? [];
  } catch {
    return [];
  }
}

/* ================================================================== */
/*  NewsDashboard — top-level orchestrator                              */
/* ================================================================== */
export function NewsDashboard({ initialArticles }: NewsDashboardProps) {
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles);
  const [activeCategory, setActiveCategory] = useState<NewsCategory>("all");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  /* ── Derived data (memoized with safe guard rails) ────────────── */
  const { featured, bulletins, streamArticles } = useMemo(() => {
    if (articles.length === 0) {
      return { featured: null, bulletins: [], streamArticles: [] };
    }

    // First article with an image → featured hero card; fallback to first article
    const feat = articles.find((a) => a.image_url) ?? articles[0];

    // Collect remaining articles after removing the featured one
    const remaining = articles.filter((a) => a.id !== feat.id);

    // Next 4 (or fewer) → bulletin panel
    const bulls = remaining.slice(0, 4);

    // Build a set of consumed IDs for O(1) dedup lookups
    const consumedIds = new Set<number>([feat.id, ...bulls.map((b) => b.id)]);

    // Everything else → stream list
    const stream = articles.filter((a) => !consumedIds.has(a.id));

    return { featured: feat, bulletins: bulls, streamArticles: stream };
  }, [articles]);

  /* ── Category switch handler ──────────────────────────────────── */
  const handleCategoryChange = useCallback(
    (category: NewsCategory) => {
      if (category === activeCategory) return;

      setActiveCategory(category);

      // If switching back to "all", reuse the server-prefetched data
      // instead of dispatching a redundant network request
      if (category === "all") {
        setArticles(initialArticles);
        return;
      }

      setIsLoading(true);

      startTransition(() => {
        fetchArticles(category).then((newArticles) => {
          setArticles(
            newArticles.length > 0 ? newArticles : initialArticles
          );
          setIsLoading(false);
        });
      });
    },
    [activeCategory, initialArticles]
  );

  const showSkeleton = isLoading || isPending;

  return (
    <div className="flex flex-col min-h-[60vh] pb-8">
      {/* ── Category Sub-Navbar ─────────────────────────────────────── */}
      <CategoryNav
        active={activeCategory}
        onChange={handleCategoryChange}
      />

      {/* ── Content with loading transition ─────────────────────────── */}
      <AnimatePresence mode="wait">
        {showSkeleton ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-6"
          >
            <HeroSkeleton />
            <StreamSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key={`content-${activeCategory}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-6"
          >
            <HeroSection featured={featured} bulletins={bulletins} />
            <NewsStream articles={streamArticles} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
