"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

/**
 * Routes where the global Header and Footer should be hidden,
 * giving those pages a clean, distraction-free layout.
 */
const MINIMAL_ROUTES = ["/login", "/onboarding", "/dashboard"];

/**
 * Conditionally renders the site-wide Header and Footer.
 * Hidden on auth/onboarding routes for a focused experience.
 */
export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMinimal = MINIMAL_ROUTES.some((r) => pathname.startsWith(r));

  if (isMinimal) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
