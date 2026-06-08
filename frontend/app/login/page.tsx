"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const REDIRECT_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/auth/callback`
    : "http://localhost:3000/auth/callback";

/* ------------------------------------------------------------------ */
/*  Brand Logo (self-contained for the login page)                     */
/* ------------------------------------------------------------------ */
function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group" id="login-logo">
      <div className="flex items-center justify-center size-8 rounded-lg bg-slate-900 dark:bg-white transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" fill="none" className="size-4.5" aria-hidden="true">
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
      <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
        Cortif
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  OAuth Button Component                                             */
/* ------------------------------------------------------------------ */
function OAuthButton({
  provider,
  label,
  icon,
  onClick,
  loading,
}: {
  provider: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <motion.button
      id={`oauth-${provider}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      disabled={loading}
      className={cn(
        "relative flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3",
        "text-[14px] font-medium transition-all duration-200 cursor-pointer",
        "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50",
        "dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
      )}
    >
      {loading ? <Loader2 className="size-5 animate-spin" /> : icon}
      <span>{label}</span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Divider                                                            */
/* ------------------------------------------------------------------ */
function Divider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700/60" />
      <span className="text-[11px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500 select-none">
        or
      </span>
      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700/60" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SVG Icons for OAuth providers                                      */
/* ------------------------------------------------------------------ */
function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className="size-5" viewBox="0 0 23 23" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Login Page (wrapped in Suspense for useSearchParams)           */
/* ------------------------------------------------------------------ */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
          <div className="size-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-600 dark:border-t-white" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackError = searchParams.get("error");
  const redirectToParam = searchParams.get("redirectTo");
  
  const finalRedirectUrl = (() => {
    try {
      const url = new URL(REDIRECT_URL);
      if (redirectToParam) {
        url.searchParams.set("redirectTo", redirectToParam);
      }
      return url.toString();
    } catch {
      return REDIRECT_URL;
    }
  })();



  const [email, setEmail] = useState("");
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(
    callbackError === "auth_callback_failed"
      ? "Authentication failed. Please try again."
      : null
  );

  const supabase = createClient();

  /* ── OAuth Handler ── */
  async function handleOAuth(provider: "google" | "azure") {
    setError(null);
    setLoadingProvider(provider);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: finalRedirectUrl,
      },
    });

    if (error) {
      setError(error.message);
      setLoadingProvider(null);
    }
    // If successful, the browser is redirected — no need to clear loading.
  }

  /* ── Magic Link / OTP Handler ── */
  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setLoadingProvider("email");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: finalRedirectUrl,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setOtpSent(true);
    }

    setLoadingProvider(null);
  }


  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      {/* ── Subtle background gradient accents ── */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-transparent blur-3xl dark:from-blue-500/[0.03] dark:via-indigo-500/[0.03]" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-emerald-500/5 via-teal-500/5 to-transparent blur-3xl dark:from-emerald-500/[0.03] dark:via-teal-500/[0.03]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[400px]"
      >
        {/* ── Card Container ── */}
        <div
          className={cn(
            "rounded-2xl border p-8",
            "border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-xl",
            "dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-black/20"
          )}
        >
          {/* ── Header ── */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <BrandMark />
            <div className="text-center">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Welcome back
              </h1>
              <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                Sign in to access your financial workspace
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {otpSent ? (
              /* ── Magic Link Sent State ── */
              <motion.div
                key="magic-link-sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-4 py-4"
              >
                <div className="flex items-center justify-center size-14 rounded-full bg-slate-100 dark:bg-slate-800/50">
                  <Mail className="size-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="text-center w-full">
                  <p className="text-[15px] font-semibold text-slate-900 dark:text-white">
                    Check your email
                  </p>
                  <p className="mt-1.5 text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    We sent a magic link to{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {email}
                    </span>
                    <br />
                    Click the link to sign in automatically.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setError(null);
                  }}
                  className="mt-4 text-[13px] font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Back to Email Entry
                </button>
              </motion.div>
            ) : (
              /* ── Login Form ── */
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
                {/* ── Error Alert ── */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 dark:border-red-500/20 dark:bg-red-500/10"
                    >
                      <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
                      <p className="text-[13px] text-red-700 dark:text-red-300 leading-snug">
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── OAuth Buttons ── */}
                <OAuthButton
                  provider="google"
                  label="Continue with Google"
                  icon={<GoogleIcon />}
                  onClick={() => handleOAuth("google")}
                  loading={loadingProvider === "google"}
                />
                <OAuthButton
                  provider="microsoft"
                  label="Continue with Microsoft"
                  icon={<MicrosoftIcon />}
                  onClick={() => handleOAuth("azure")}
                  loading={loadingProvider === "azure"}
                />

                <Divider />

                {/* ── Magic Link Email Form ── */}
                <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
                    <input
                      id="email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      autoComplete="email"
                      className={cn(
                        "w-full rounded-xl border py-3 pl-10 pr-4",
                        "text-[14px] placeholder:text-slate-400 dark:placeholder:text-slate-500",
                        "border-slate-200 bg-white text-slate-900 transition-all duration-200",
                        "hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200",
                        "dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-200",
                        "dark:hover:border-slate-600 dark:focus:border-slate-500 dark:focus:ring-slate-700/50",
                        "focus:outline-none"
                      )}
                    />
                  </div>
                  <motion.button
                    id="magic-link-submit"
                    type="submit"
                    disabled={loadingProvider === "email" || !email.trim()}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.985 }}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3",
                      "text-[14px] font-medium transition-all duration-200 cursor-pointer",
                      "bg-slate-900 text-white hover:bg-slate-800",
                      "dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
                    )}
                  >
                    {loadingProvider === "email" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <span>Continue with Email</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer Note ── */}
        <p className="mt-6 text-center text-[12px] text-slate-400 dark:text-slate-500 leading-relaxed">
          By continuing, you agree to Cortif&apos;s{" "}
          <Link
            href="/terms"
            className="underline underline-offset-2 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </motion.div>
    </div>
  );
}

