import { createClient } from "@/utils/supabase/server";
import { PortfolioPageContent } from "@/components/dashboard/portfolio-content";

export const metadata = {
  title: "Portfolio Assets — Cortif",
  description:
    "Manage your current holdings, track asset performance, and monitor your portfolio allocation in real time.",
};

export default async function PortfolioPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let baseCurrency = "USD";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("base_currency")
      .eq("id", user.id)
      .single();

    if (profile?.base_currency) {
      baseCurrency = profile.base_currency;
    }
  }

  return <PortfolioPageContent baseCurrency={baseCurrency} />;
}
