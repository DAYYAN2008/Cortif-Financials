import { createClient } from "@/utils/supabase/server";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
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

  return <DashboardContent baseCurrency={baseCurrency} />;
}
