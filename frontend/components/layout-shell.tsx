"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

/**
 * Renders the site-wide Header and Footer on all pages.
 */
export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
