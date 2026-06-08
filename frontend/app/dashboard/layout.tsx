import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  DashboardSidebar,
  DashboardMobileNav,
} from "@/components/dashboard/sidebar";
import { AddAssetModal } from "@/components/modals/add-asset-modal";

export const metadata: Metadata = {
  title: "Dashboard — Cortif",
  description:
    "Your AI-powered financial workspace. Track portfolios, analyze markets, and manage assets.",
};

/**
 * Dashboard layout — app-style with sidebar navigation.
 * Replaces the marketing site Header/Footer (excluded via LayoutShell).
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the authenticated user's metadata from public.profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .single();

  // If the database returns no profile row (or name is unset), redirect to onboarding
  if (!profile || !profile.first_name) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <DashboardSidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Header */}
        <DashboardMobileNav />
        <div className="flex-1 overflow-y-auto pb-6 lg:pb-0">
          {children}
        </div>
      </div>

      {/* Global Modals */}
      <AddAssetModal />
    </div>
  );
}
