import { FeaturedNewsCarousel } from "@/components/featured-news-carousel";
import type { NewsArticle } from "@/types/news";

/**
 * Fetch the latest news articles from the FastAPI backend.
 * Runs server-side at request time (no caching for fresh news).
 */
async function getLatestNews(): Promise<NewsArticle[]> {
  try {
    const res = await fetch("http://localhost:8000/api/news/latest", {
      cache: "no-store",
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
    <div className="flex flex-col">
      {/* ── Hero: Featured News Carousel ── */}
      <FeaturedNewsCarousel articles={articles} />

      {/* ── Remaining page content ── */}
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <div className="max-w-2xl text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            AI-Powered Financial Intelligence
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Real-time market analytics, predictive insights, and institutional-grade
            tools — all powered by advanced AI models.
          </p>
        </div>
      </div>
    </div>
  );
}
