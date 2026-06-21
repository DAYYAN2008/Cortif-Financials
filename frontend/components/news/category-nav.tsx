"use client";

import { motion } from "framer-motion";
import type { NewsCategory } from "@/types/news";

/* ------------------------------------------------------------------ */
/*  Category definitions                                               */
/* ------------------------------------------------------------------ */
const CATEGORIES: { key: NewsCategory; label: string }[] = [
  { key: "all", label: "All News" },
  { key: "stocks", label: "Stocks" },
  { key: "crypto", label: "Crypto" },
  { key: "commodities", label: "Commodities" },
  { key: "macro", label: "Macro" },
];

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */
interface CategoryNavProps {
  active: NewsCategory;
  onChange: (category: NewsCategory) => void;
}

/* ================================================================== */
/*  CategoryNav — sliding bubble tab selector                          */
/* ================================================================== */
export function CategoryNav({ active, onChange }: CategoryNavProps) {
  return (
    <nav
      id="news-category-nav"
      className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-2"
      aria-label="News category filter"
    >
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
        {CATEGORIES.map(({ key, label }) => {
          const isActive = active === key;

          return (
            <button
              key={key}
              id={`news-tab-${key}`}
              onClick={() => onChange(key)}
              className="relative z-10 cursor-pointer rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-200 whitespace-nowrap select-none"
              style={{
                color: isActive ? "white" : undefined,
              }}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Sliding pill background */}
              {isActive && (
                <motion.span
                  layoutId="news-category-pill"
                  className="absolute inset-0 rounded-full bg-slate-800 dark:bg-white/10 border border-slate-700/50 dark:border-white/10"
                  style={{ zIndex: -1 }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                    mass: 0.8,
                  }}
                />
              )}
              <span
                className={
                  isActive
                    ? "text-white dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Subtle bottom border */}
      <div className="mt-1 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800" />
    </nav>
  );
}
