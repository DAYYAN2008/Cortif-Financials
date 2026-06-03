import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * OAuth Callback Route Handler
 *
 * After a successful OAuth sign-in (Google, Microsoft, etc.),
 * Supabase redirects the user here with a `code` query parameter.
 * We exchange that code for a session, then redirect to the app.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");


  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Fetch the authenticated user's metadata from public.profiles
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", user.id)
          .single();

        // If the database returns no profile row (or name is unset), redirect to onboarding
        if (!profile || !profile.first_name) {
          const onboardingUrl = new URL(`${origin}/onboarding`);
          const redirectToParam = searchParams.get("redirectTo");
          if (redirectToParam) {
            onboardingUrl.searchParams.set("redirectTo", redirectToParam);
          }
          return NextResponse.redirect(onboardingUrl);
        }
      }

      // Profile is complete, route back to the landing page (root path /) or the specified redirect
      const next = searchParams.get("redirectTo") || "/";
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If code exchange fails, redirect to login with an error hint
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
