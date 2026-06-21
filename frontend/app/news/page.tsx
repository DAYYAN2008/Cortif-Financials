import type { Metadata } from "next";
import { NewsDashboard } from "@/components/news/news-dashboard";
import type { NewsArticle } from "@/types/news";

/* ------------------------------------------------------------------ */
/*  SEO Metadata                                                        */
/* ------------------------------------------------------------------ */
export const metadata: Metadata = {
  title: "Financial News — Cortif Intelligence",
  description:
    "Real-time financial news intelligence. Breaking market updates across stocks, crypto, commodities, and macro economics — powered by Cortif.",
};

/* ------------------------------------------------------------------ */
/*  Server-side data fetching                                           */
/* ------------------------------------------------------------------ */
async function getLatestNews(): Promise<NewsArticle[]> {
  const backendUrl =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";
  try {
    const res = await fetch(`${backendUrl}/api/news/latest?limit=25`, {
      next: { revalidate: 300 }, // ISR: revalidate every 5 minutes
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.articles ?? [];
  } catch {
    // Backend may not be running — dashboard has empty-state handling
    return [];
  }
}

/* ================================================================== */
/*  NewsPage — Server Component                                         */
/* ================================================================== */
export default async function NewsPage() {
  const articles = await getLatestNews();

  return <NewsDashboard initialArticles={articles} />;
}
