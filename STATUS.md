# Project Status: Cortif

## 1. Project Overview
Cortif is a financial data web application that handles real-time market tracking, news aggregation, and portfolio management. The frontend is deployed on Vercel, while the FastAPI backend runs inside a Docker container on a Hugging Face Space. Redis is hosted on the same Space alongside the backend for caching, and Supabase handles all authentication and database storage.

## 2. Core Architecture & Routing
* **`/` (Landing Page):** Public homepage featuring a compiled news slider, quick market previews, and direct shortcuts to dashboard tools.
* **`/news`:** Dedicated feed for browsing aggregated financial articles.
* **`/dashboard`:** Authenticated user space containing an overview section, portfolio manager, a dedicated section for market data and financial calculators.

## 3. Feature Breakdown & Implementation Brief
* **User Authentication & Session Management**
  - Handled via Supabase Auth using passwordless magic links. It manages user sessions and route guarding, syncing authenticated users with a profile table in the database.
* **Multi-Source RSS News Aggregator & Hero Slider**
  - Driven by a FastAPI background worker that periodically fetches and formats RSS feeds from different financial sites into Supabase. The Next.js frontend pulls this structured data and cycles it through a custom carousel on the hero section.
  - **Feed Sources:**
    - *Crypto:* CoinTelegraph, CoinDesk
    - *Commodities:* MarketWatch Commentary
    - *Stocks & Macro:* CNBC, Yahoo Finance, Wall Street Journal (WSJ), Investing.com, MarketWatch Bulletins
* **Live Market Data Transport & Terminals**
  - Uses a custom `useMarketData` React hook connected to a FastAPI WebSocket loop backed by Redis to transport real-time market data across the platform. *Note: External API logic (Finnhub/Binance) is currently commented out to keep the system provider-independent and ready for any future data feed.*
  - **Landing Page Terminals:** Data is presented via the `MarketOverview` component (a 3-column snapshot grid for Stocks, Mutual Funds, and Dividends) and the `MarketCarousel` (an infinite-scrolling asset ticker).
  - **Dashboard Terminals:** Powering the `/dashboard/markets` route, the `MarketTerminal` component acts as a full-featured data hub with sortable, tabbed tables for equities, forex, commodities, and mutual funds.
* **The Dashboard Toolset**
  - Includes 6 financial calculators built right into the UI: Average Down, CAGR, Risk, ROI, SIP, and Tax.
* **Portfolio & Asset Transaction Mechanism**
  - Tracks user assets dynamically across transaction ledger and holdings components. It talks to FastAPI backend endpoints to handle database updates whenever a transaction is added or modified.

## 4. Current Dependencies & Tech Stack Summary
* **Frontend:** Next.js (React), Tailwind CSS, Shadcn/ui, Framer Motion
* **Backend:** FastAPI (Python), Uvicorn, Redis
* **Database & Auth:** PostgreSQL (via Supabase), Supabase Auth SDK
* **Real-Time Data:** Native WebSockets

## 5. Development Status Notes
* **Last Updated:** June 21, 2026
* **Current State:** Core architecture and local features are fully functional. The codebase is clean and optimized for reconnecting live production market APIs.