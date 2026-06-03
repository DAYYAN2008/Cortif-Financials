import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Your Profile — Cortif",
  description: "Set up your Cortif profile to access your financial workspace.",
};

/**
 * Force dynamic rendering for the onboarding route.
 * The onboarding page uses the Supabase browser client which requires
 * NEXT_PUBLIC_* env vars — these aren't available during static build.
 */
export const dynamic = "force-dynamic";

/**
 * Onboarding layout — intentionally minimal.
 * The root LayoutShell already strips Header/Footer for /onboarding.
 * This layout only sets page-specific metadata and dynamic rendering.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
