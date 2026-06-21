/**
 * Valid news categories stored in the external_news table.
 */
export type NewsCategory = "all" | "stocks" | "crypto" | "commodities" | "macro";

/**
 * Represents an article from the external_news Supabase table.
 */
export interface NewsArticle {
  id: number;
  title: string;
  link: string;
  summary: string;
  published_date: string;
  image_url: string | null;
  source: string;
  category?: string;
  created_at: string;
}
