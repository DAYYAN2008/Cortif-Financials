"""
News Hub Service
Parses RSS feeds from financial news sources and stores them in Supabase.
"""

import os
import logging
from datetime import datetime, timezone
from typing import Optional

import feedparser
from dotenv import load_dotenv
from supabase import create_client, Client

# ── Load env vars from root .env.local ──────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env.local"))

SUPABASE_URL: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY: str = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

logger = logging.getLogger("news_service")

# ── RSS Feed Sources ────────────────────────────────────────────────────────
# Each entry is (human_readable_name, url) so the stored `source` column
# is a clean label instead of a raw URL.
RSS_FEEDS: list[tuple[str, str]] = [
    ("CNBC Business",   "https://www.cnbc.com/id/100003114/device/rss/rss.html"),
    ("Yahoo Finance",   "https://www.yahoo.com/news/rss/finance"),
    ("WSJ Markets",     "http://www.wsj.com/xml/rss/3_7031.xml"),
    ("Investing.com",   "https://www.investing.com/rss/news_25.rss"),
]

# Custom headers to avoid 403 from some RSS providers
FEED_REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}


def _get_supabase_client() -> Client:
    """Create and return a Supabase client instance."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError(
            "Missing SUPABASE_URL or SUPABASE_KEY. "
            "Ensure .env.local is configured correctly."
        )
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def _extract_image_url(entry: dict) -> Optional[str]:
    """
    Extract the best available image URL from an RSS entry.
    Checks, in order:
      1. media:content  (media_content)
      2. media:thumbnail (media_thumbnail)
      3. enclosure tags
    """
    # 1. media:content
    media_content = entry.get("media_content", [])
    if media_content:
        for media in media_content:
            url = media.get("url", "")
            if url:
                return url

    # 2. media:thumbnail
    media_thumbnail = entry.get("media_thumbnail", [])
    if media_thumbnail:
        for thumb in media_thumbnail:
            url = thumb.get("url", "")
            if url:
                return url

    # 3. enclosure
    enclosures = entry.get("enclosures", [])
    if enclosures:
        for enc in enclosures:
            enc_type = enc.get("type", "")
            if enc_type.startswith("image") or enc.get("url", "").endswith(
                (".jpg", ".jpeg", ".png", ".webp", ".gif")
            ):
                return enc.get("url", "")

    # 4. links with type image
    links = entry.get("links", [])
    for link in links:
        if link.get("type", "").startswith("image"):
            return link.get("href", "")

    return None


def _parse_published_date(entry: dict) -> str:
    """
    Parse the published date from an RSS entry.
    Returns an ISO-8601 string.  Falls back to current UTC time.
    """
    published_parsed = entry.get("published_parsed")
    if published_parsed:
        try:
            dt = datetime(*published_parsed[:6], tzinfo=timezone.utc)
            return dt.isoformat()
        except Exception:
            pass

    updated_parsed = entry.get("updated_parsed")
    if updated_parsed:
        try:
            dt = datetime(*updated_parsed[:6], tzinfo=timezone.utc)
            return dt.isoformat()
        except Exception:
            pass

    # Fallback
    return datetime.now(timezone.utc).isoformat()


def _clean_summary(raw: str) -> str:
    """Strip common HTML wrapper tags from RSS summaries."""
    import re
    clean = re.sub(r"<[^>]+>", "", raw)          # remove HTML tags
    clean = clean.replace("&amp;", "&")
    clean = clean.replace("&lt;", "<")
    clean = clean.replace("&gt;", ">")
    clean = clean.replace("&quot;", '"')
    clean = clean.replace("&#39;", "'")
    return clean.strip()


# ── Core Functions ──────────────────────────────────────────────────────────

def sync_external_news() -> dict:
    """
    Fetch articles from all configured RSS feeds and upsert unique
    entries into the Supabase `external_news` table.

    Returns a summary dict: {"fetched": int, "inserted": int, "errors": list}
    """
    supabase = _get_supabase_client()
    total_fetched = 0
    total_inserted = 0
    errors: list[str] = []

    for source_name, feed_url in RSS_FEEDS:
        logger.info("Fetching feed: %s (%s)", source_name, feed_url)
        try:
            feed = feedparser.parse(
                feed_url,
                request_headers=FEED_REQUEST_HEADERS,
            )

            if feed.bozo and not feed.entries:
                err_msg = f"Feed error for {source_name}: {feed.bozo_exception}"
                logger.warning(err_msg)
                errors.append(err_msg)
                continue

            articles = []
            for entry in feed.entries:
                title = entry.get("title", "").strip()
                link = entry.get("link", "").strip()

                if not title or not link:
                    continue

                summary_raw = entry.get("summary", entry.get("description", ""))
                summary = _clean_summary(summary_raw) if summary_raw else ""

                articles.append({
                    "title": title,
                    "link": link,
                    "summary": summary[:1000],  # Cap at 1000 chars
                    "published_date": _parse_published_date(entry),
                    "image_url": _extract_image_url(entry),
                    "source": source_name,
                })

            total_fetched += len(articles)

            if articles:
                # Upsert – skip duplicates based on unique `link` constraint
                result = (
                    supabase.table("external_news")
                    .upsert(articles, on_conflict="link")
                    .execute()
                )
                total_inserted += len(result.data) if result.data else 0
                logger.info(
                    "  ✓ %s: %d articles processed", source_name, len(articles)
                )

        except Exception as exc:
            err_msg = f"Failed to process {source_name} ({feed_url}): {exc}"
            logger.error(err_msg)
            errors.append(err_msg)

    summary = {
        "fetched": total_fetched,
        "inserted": total_inserted,
        "errors": errors,
    }
    logger.info("Sync complete: %s", summary)
    return summary


def get_latest_news(limit: int = 8) -> list[dict]:
    """
    Retrieve the most recent articles from the `external_news` table,
    ordered by published_date descending.
    """
    supabase = _get_supabase_client()
    result = (
        supabase.table("external_news")
        .select("*")
        .order("published_date", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data if result.data else []
