"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/**
 * Session-aware navigation hook.
 *
 * - Logged in  → navigates directly to `targetPath`
 * - Logged out → redirects to `/login?redirectTo=<targetPath>`
 *
 * Mirrors the pattern from PopularTools but is reusable across
 * all market components.
 */
export function useAuthRedirect() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useCallback(
    async (targetPath: string) => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        const {
<<<<<<< HEAD
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
=======
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
>>>>>>> c6dcdb38b59498ccd9a623d53cc349fa5618104a
          router.push(targetPath);
        } else {
          router.push(`/login?redirectTo=${encodeURIComponent(targetPath)}`);
        }
      } catch {
        // Fallback: send to login with redirect
        router.push(`/login?redirectTo=${encodeURIComponent(targetPath)}`);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, router, supabase],
  );

  return { navigate, isLoading };
}
