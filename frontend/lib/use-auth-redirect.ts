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
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
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
