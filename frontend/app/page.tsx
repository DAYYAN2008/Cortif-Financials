import { FeaturedNewsCarousel } from "@/components/featured-news-carousel";
import { MarketOverview } from "@/components/market-overview";
import { MarketCarousel } from "@/components/market-carousel";
import { PopularTools } from "@/components/popular-tools";
import type { NewsArticle } from "@/types/news";

/**
 * Fetch the latest news articles from the FastAPI backend.
 * Runs server-side at request time (no caching for fresh news).
 */
async function getLatestNews(): Promise<NewsArticle[]> {
  const backendUrl =
    process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  try {
    const res = await fetch(`${backendUrl}/api/news/latest`, {
      next: { revalidate: 300 }, // ISR: revalidate every 5 minutes (news syncs every 30m)
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.articles ?? [];
  } catch {
    // Backend may not be running — component has fallback data
    return [];
  }
}

export default async function Home() {
  const articles = await getLatestNews();

  return (
    <div className="flex flex-col pb-20">
      {/* ── Hero: Featured News Carousel ── */}
      <FeaturedNewsCarousel articles={articles} />

      {/* ── Market Asset Previews ── */}
      <MarketOverview />
      <MarketCarousel />

      {/* ── Popular Tools Section ── */}
      <PopularTools />
    </div>
  );
}
