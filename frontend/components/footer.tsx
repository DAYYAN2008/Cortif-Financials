"use client";

import Link from "next/link";
import { Send } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Brand mark (mirrors Navbar)                                        */
/* ------------------------------------------------------------------ */
function FooterBrand() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0 group">
      <div className="flex items-center justify-center size-7 rounded-md bg-slate-900 dark:bg-white transition-transform group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-4"
          aria-hidden="true"
        >
          <path
            d="M3 17L9 11L13 15L21 7"
            stroke="white"
            className="dark:stroke-slate-900"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 7H21V11"
            stroke="white"
            className="dark:stroke-slate-900"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
        Cortif
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Column heading                                                     */
/* ------------------------------------------------------------------ */
function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
      {children}
    </h3>
  );
}

/* ------------------------------------------------------------------ */
/*  Column link                                                        */
/* ------------------------------------------------------------------ */
function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

/* ================================================================== */
/*  Footer                                                             */
/* ================================================================== */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="site-footer"
      className="w-full border-t border-border/40 bg-white dark:bg-slate-950"
    >
      {/* ── Main grid ───────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1 — Brand + description */}
          <div className="flex flex-col gap-4 lg:pr-8">
            <FooterBrand />
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              AI-powered financial intelligence platform delivering real-time
              market analytics, predictive insights, and institutional-grade
              tools for the modern investor.
            </p>
            <div className="flex items-center gap-3 mt-1">
              {/* Social icons */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:border-slate-600 transition-all"
                aria-label="Twitter"
              >
                <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:border-slate-600 transition-all"
                aria-label="LinkedIn"
              >
                <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:border-slate-600 transition-all"
                aria-label="GitHub"
              >
                <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2 — Platform */}
          <div>
            <ColumnHeading>Platform</ColumnHeading>
            <ul className="flex flex-col gap-2.5">
              <FooterLink href="/products/real-time-ticker">
                Live Ticker
              </FooterLink>
              <FooterLink href="/news">Financial News</FooterLink>
              <FooterLink href="/products/ai-analysis">
                AI Analysis
              </FooterLink>
              <FooterLink href="/products/predictive-models">
                Predictive Models
              </FooterLink>
              <FooterLink href="/products/watchlists">
                Watchlists
              </FooterLink>
            </ul>
          </div>

          {/* Col 3 — Company */}
          <div>
            <ColumnHeading>Company</ColumnHeading>
            <ul className="flex flex-col gap-2.5">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/support">Support</FooterLink>
              <FooterLink href="/developers/api">API Docs</FooterLink>
              <FooterLink href="/pricing">Pricing</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
            </ul>
          </div>

          {/* Col 4 — Newsletter */}
          <div>
            <ColumnHeading>Stay Informed</ColumnHeading>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
              Get weekly market insights and AI-driven analysis delivered to
              your inbox.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2"
            >
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 h-8 rounded-lg border border-slate-200 bg-slate-50 px-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:ring-slate-700/50 transition-all"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="flex items-center justify-center size-8 rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-colors shrink-0 cursor-pointer"
                aria-label="Subscribe"
              >
                <Send className="size-3.5" />
              </button>
            </form>
            <p className="mt-2.5 text-[11px] text-muted-foreground">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom bar — copyright + legal ──────────────────────────── */}
      <div className="border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          {/* Copyright row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <p className="text-xs text-muted-foreground">
              &copy; {currentYear} Cortif Technologies (Pvt.) Ltd. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
              <Link
                href="/terms"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <span className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
              <Link
                href="/cookies"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>

          {/* Regulatory & risk disclosure */}
          <div className="space-y-2 text-[10.5px] leading-relaxed text-muted-foreground/80">
            <p>
              <strong className="font-medium text-muted-foreground">
                Risk Disclosure:
              </strong>{" "}
              Trading and investing in financial instruments involves
              substantial risk of loss and is not suitable for every investor.
              The valuation of financial instruments may fluctuate and, as a
              result, investors may lose more than their original investment.
              Past performance is not indicative of future results. The content
              provided on this platform is for informational purposes only and
              does not constitute financial, investment, or trading advice.
            </p>
            <p>
              Cortif Technologies (Pvt.) Ltd. is incorporated in Pakistan under
              the Companies Act, 2017. This platform is not regulated by the
              Securities and Exchange Commission of Pakistan (SECP) or the
              Pakistan Stock Exchange (PSX) and does not provide brokerage
              services. All market data is provided by third-party sources and
              may be delayed. Users outside Pakistan should comply with their
              local regulatory requirements regarding financial data usage and
              investment activities.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
