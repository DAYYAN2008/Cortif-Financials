# Tech Stack Specification: AI FinTech Platform

## Overview
This document outlines the foundational technology stack for our AI-driven financial analysis platform. The architecture is designed to support a RAG (Retrieval-Augmented Generation) model initially, with a modular structure that allows for a seamless transition to an LQM (Large Quantitative Model) for predictive forecasting in the future.

## 1. Backend Architecture
* **Framework:** **FastAPI** (Python)
* **Rationale:** * Native asynchronous support, ideal for handling long-running AI model processing times without blocking the main thread.
  * Direct compatibility with the Python-based AI ecosystem.
  * Automatically generates OpenAPI/Swagger documentation for seamless API integration with the frontend.
  * Lightweight and modular, serving perfectly as an API "adapter layer" between the frontend and the AI model.

## 2. Frontend Architecture
* **Framework:** **Next.js** (React)
* **Rationale:** * Industry standard for state-heavy, dynamic dashboards.
  * Supports hybrid rendering (SSG for fast marketing/blog pages, SSR/CSR for the live AI workspace).
  * Component-driven architecture aligns perfectly with our modular "widget" layout strategy.

## 3. Database & Authentication
* **System:** **PostgreSQL (via Supabase)**
* **Rationale:** * Highly structured, ACID-compliant relational database.
  * Bulletproof for managing user accounts, authentication, financial watchlists, and subscription tiers.
  * Supabase provides out-of-the-box secure authentication and a managed cloud environment, drastically reducing initial DevOps overhead.

## 4. Real-Time Data Streaming (Stock Carousel)
* **Protocol:** **WebSockets (via FastAPI)**
* **Data Provider:** **Finnhub.io / Alpaca**
* **Rationale:** * Maintains a single, continuous connection to the financial API to receive live market data without hitting rate limits.
  * FastAPI broadcasts these live price updates instantly to all connected Next.js clients.
  * Frontend rendering is handled strictly via CSS keyframe animations (Tailwind `animate-marquee`) to ensure a smooth 60fps infinite scroll without Javascript performance lag.

## 5. Styling & UI Components
* **CSS Framework:** **Tailwind CSS**
  * Utility-first styling for highly custom, responsive layouts with a minimal CSS footprint.
* **Component Library:** **Shadcn/ui**
  * Accessible, beautifully designed components (modals, dropdowns, tables) that are copied directly into the codebase for full customization via Tailwind, avoiding the bloat of traditional component libraries.

## 6. Animations & Visualizations
* **Micro-interactions:** **Framer Motion**
  * Used strictly for subtle, professional transitions (e.g., loading states, layout shifts, text generation fade-ins) to maintain an institutional FinTech feel without distracting the user.
* **Data Visualization (LQM Phase):** **Recharts**
  * React-native charting library reserved for rendering predictive numerical data, probability matrices, and complex financial graphs once the Large Quantitative Model is integrated.