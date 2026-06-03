"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  CalendarDays,
  Settings2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CURRENCIES = [
  { value: "USD", label: "USD — US Dollar", symbol: "$" },
  { value: "EUR", label: "EUR — Euro", symbol: "€" },
  { value: "GBP", label: "GBP — British Pound", symbol: "£" },
  { value: "PKR", label: "PKR — Pakistani Rupee", symbol: "₨" },
];

const FOCUS_AREAS = [
  { value: "Stocks", label: "Stocks", desc: "Equities & ETFs" },
  { value: "Commodities", label: "Commodities", desc: "Gold, oil & more" },
  { value: "Crypto", label: "Crypto", desc: "Digital assets" },
  { value: "Diversified", label: "Diversified", desc: "Balanced portfolio" },
];

const STEPS = [
  { id: 1, label: "Personal Info", icon: User },
  { id: 2, label: "Date of Birth", icon: CalendarDays },
  { id: 3, label: "Preferences", icon: Settings2 },
] as const;

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 100;
const MAX_YEAR = CURRENT_YEAR - 18; // Must be 18+

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getDaysInMonth(month: number, year: number): number {
  if (!month || !year) return 31;
  return new Date(year, month, 0).getDate();
}

function isAtLeast18(year: number, month: number, day: number): boolean {
  const today = new Date();
  const birth = new Date(year, month - 1, day);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 18;
  }
  return age >= 18;
}

function formatDobISO(year: number, month: number, day: number): string {
  const y = String(year);
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/* ------------------------------------------------------------------ */
/*  Shared Input Styles                                                */
/* ------------------------------------------------------------------ */
const inputClasses = cn(
  "w-full rounded-xl border py-3 px-4",
  "text-[14px] placeholder:text-slate-400 dark:placeholder:text-slate-500",
  "border-slate-200 bg-white text-slate-900 transition-all duration-200",
  "hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200",
  "dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-200",
  "dark:hover:border-slate-600 dark:focus:border-slate-500 dark:focus:ring-slate-700/50",
  "focus:outline-none"
);

const selectClasses = cn(
  inputClasses,
  "appearance-none cursor-pointer",
  "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]",
  "bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10"
);

const labelClasses =
  "block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5";

const fieldErrorClasses =
  "text-[12px] text-red-600 dark:text-red-400 mt-1";

/* ------------------------------------------------------------------ */
/*  Brand Logo                                                         */
/* ------------------------------------------------------------------ */
function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group" id="onboarding-logo">
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
/*  Step Indicator                                                     */
/* ------------------------------------------------------------------ */
function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2 w-full" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={3}>
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isComplete = currentStep > step.id;

        return (
          <div key={step.id} className="flex items-center gap-2 flex-1">
            {/* Step dot */}
            <motion.div
              animate={{
                scale: isActive ? 1 : 0.9,
                backgroundColor: isActive || isComplete ? undefined : undefined,
              }}
              className={cn(
                "flex items-center justify-center size-8 rounded-full shrink-0 transition-colors duration-300",
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : isComplete
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
              )}
            >
              {isComplete ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <Icon className="size-4" />
              )}
            </motion.div>

            {/* Step label (hidden on small screens) */}
            <span
              className={cn(
                "hidden sm:block text-[12px] font-medium transition-colors duration-300 whitespace-nowrap",
                isActive
                  ? "text-slate-900 dark:text-white"
                  : isComplete
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-slate-400 dark:text-slate-500"
              )}
            >
              {step.label}
            </span>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-1">
                <motion.div
                  className="h-full rounded-full"
                  initial={false}
                  animate={{
                    backgroundColor: isComplete
                      ? "rgb(16 185 129)" // emerald-500
                      : "rgb(226 232 240)", // slate-200
                  }}
                  transition={{ duration: 0.4 }}
                  style={{ width: "100%", minWidth: 16 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Slide Animation Wrapper                                            */
/* ------------------------------------------------------------------ */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

/* ------------------------------------------------------------------ */
/*  Main Onboarding Page                                               */
/* ------------------------------------------------------------------ */
export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  // ── Form State ──
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Step 2
  const [dobMonth, setDobMonth] = useState(0);
  const [dobDay, setDobDay] = useState(0);
  const [dobYear, setDobYear] = useState(0);

  // Step 3
  const [currency, setCurrency] = useState("USD");
  const [focus, setFocus] = useState("Diversified");

  // ── Derived State ──
  const daysInMonth = useMemo(
    () => getDaysInMonth(dobMonth, dobYear || CURRENT_YEAR),
    [dobMonth, dobYear]
  );

  const dobError = useMemo(() => {
    if (!dobMonth || !dobDay || !dobYear) return null;
    if (!isAtLeast18(dobYear, dobMonth, dobDay)) {
      return "You must be at least 18 years old to use Cortif.";
    }
    return null;
  }, [dobMonth, dobDay, dobYear]);

  // ── Step Validation ──
  const isStep1Valid = firstName.trim().length >= 2 && lastName.trim().length >= 2;
  const isStep2Valid = dobMonth > 0 && dobDay > 0 && dobYear > 0 && !dobError;
  const isStep3Valid = currency && focus;

  const canProceed = useCallback(() => {
    if (step === 1) return isStep1Valid;
    if (step === 2) return isStep2Valid;
    if (step === 3) return isStep3Valid;
    return false;
  }, [step, isStep1Valid, isStep2Valid, isStep3Valid]);

  // ── Navigation ──
  function goNext() {
    if (!canProceed()) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  // ── Submission ──
  async function handleSubmit() {
    if (!canProceed()) return;

    setError(null);
    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Session expired. Please log in again.");
        setSubmitting(false);
        return;
      }

      const dateOfBirth = formatDobISO(dobYear, dobMonth, dobDay);

      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dateOfBirth,
        base_currency: currency,
        investment_focus: focus,
        updated_at: new Date().toISOString(),
      });

      if (upsertError) {
        setError(upsertError.message);
        setSubmitting(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  // ── Year options (descending from MAX_YEAR) ──
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = MAX_YEAR; y >= MIN_YEAR; y--) {
      years.push(y);
    }
    return years;
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* ── Background gradients ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-transparent blur-3xl dark:from-blue-500/[0.03] dark:via-indigo-500/[0.03]" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-emerald-500/5 via-teal-500/5 to-transparent blur-3xl dark:from-emerald-500/[0.03] dark:via-teal-500/[0.03]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[480px]"
      >
        {/* ── Card ── */}
        <div
          className={cn(
            "rounded-2xl border p-8",
            "border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-xl",
            "dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-black/20"
          )}
        >
          {/* ── Header ── */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <BrandMark />
            <div className="text-center">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Complete your profile
              </h1>
              <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                A few details to personalize your workspace
              </p>
            </div>
          </div>

          {/* ── Step Indicator ── */}
          <div className="mb-8">
            <StepIndicator currentStep={step} />
          </div>

          {/* ── Error Alert ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 dark:border-red-500/20 dark:bg-red-500/10"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
                <p className="text-[13px] text-red-700 dark:text-red-300 leading-snug">
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Step Content ── */}
          <div className="relative overflow-hidden min-h-[200px]">
            <AnimatePresence mode="wait" custom={direction}>
              {/* ──────── Step 1: Personal Info ──────── */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label htmlFor="first-name" className={labelClasses}>
                      First Name
                    </label>
                    <input
                      id="first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      autoComplete="given-name"
                      autoFocus
                      className={inputClasses}
                    />
                    {firstName.length > 0 && firstName.trim().length < 2 && (
                      <p className={fieldErrorClasses}>Must be at least 2 characters.</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="last-name" className={labelClasses}>
                      Last Name
                    </label>
                    <input
                      id="last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      autoComplete="family-name"
                      className={inputClasses}
                    />
                    {lastName.length > 0 && lastName.trim().length < 2 && (
                      <p className={fieldErrorClasses}>Must be at least 2 characters.</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ──────── Step 2: Date of Birth ──────── */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-4"
                >
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    We need your date of birth to comply with financial regulations.
                    You must be at least <span className="font-medium text-slate-700 dark:text-slate-300">18 years old</span>.
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Month */}
                    <div>
                      <label htmlFor="dob-month" className={labelClasses}>
                        Month
                      </label>
                      <select
                        id="dob-month"
                        value={dobMonth}
                        onChange={(e) => {
                          setDobMonth(Number(e.target.value));
                          // Reset day if out of range
                          const newMax = getDaysInMonth(Number(e.target.value), dobYear || CURRENT_YEAR);
                          if (dobDay > newMax) setDobDay(0);
                        }}
                        className={selectClasses}
                      >
                        <option value={0} disabled>
                          Month
                        </option>
                        {MONTHS.map((m, i) => (
                          <option key={m} value={i + 1}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Day */}
                    <div>
                      <label htmlFor="dob-day" className={labelClasses}>
                        Day
                      </label>
                      <select
                        id="dob-day"
                        value={dobDay}
                        onChange={(e) => setDobDay(Number(e.target.value))}
                        className={selectClasses}
                      >
                        <option value={0} disabled>
                          Day
                        </option>
                        {Array.from({ length: daysInMonth }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Year */}
                    <div>
                      <label htmlFor="dob-year" className={labelClasses}>
                        Year
                      </label>
                      <select
                        id="dob-year"
                        value={dobYear}
                        onChange={(e) => {
                          setDobYear(Number(e.target.value));
                          // Reset day if Feb shortening
                          const newMax = getDaysInMonth(dobMonth, Number(e.target.value));
                          if (dobDay > newMax) setDobDay(0);
                        }}
                        className={selectClasses}
                      >
                        <option value={0} disabled>
                          Year
                        </option>
                        {yearOptions.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {dobError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10"
                    >
                      <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <p className="text-[13px] text-amber-700 dark:text-amber-300">
                        {dobError}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ──────── Step 3: Preferences ──────── */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-5"
                >
                  {/* Currency */}
                  <div>
                    <label htmlFor="base-currency" className={labelClasses}>
                      Base Currency
                    </label>
                    <select
                      id="base-currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className={selectClasses}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.symbol}  {c.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                      All portfolio values will be displayed in this currency.
                    </p>
                  </div>

                  {/* Focus */}
                  <div>
                    <label className={labelClasses}>Primary Focus</label>
                    <div className="grid grid-cols-2 gap-2">
                      {FOCUS_AREAS.map((f) => (
                        <motion.button
                          key={f.value}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFocus(f.value)}
                          className={cn(
                            "flex flex-col items-start gap-0.5 rounded-xl border p-3 text-left transition-all duration-200 cursor-pointer",
                            focus === f.value
                              ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:border-slate-600"
                          )}
                        >
                          <span className="text-[13px] font-semibold">{f.label}</span>
                          <span
                            className={cn(
                              "text-[11px]",
                              focus === f.value
                                ? "text-white/70 dark:text-slate-900/60"
                                : "text-slate-400 dark:text-slate-500"
                            )}
                          >
                            {f.desc}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Navigation Buttons ── */}
          <div className="flex items-center justify-between mt-8 gap-3">
            {/* Back */}
            {step > 1 ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={goBack}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-4 py-2.5",
                  "text-[13px] font-medium transition-colors cursor-pointer",
                  "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                  "dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                )}
              >
                <ArrowLeft className="size-4" />
                Back
              </motion.button>
            ) : (
              <div />
            )}

            {/* Next / Submit */}
            <motion.button
              type="button"
              whileHover={{ scale: canProceed() ? 1.02 : 1 }}
              whileTap={{ scale: canProceed() ? 0.98 : 1 }}
              onClick={step === 3 ? handleSubmit : goNext}
              disabled={!canProceed() || submitting}
              className={cn(
                "flex items-center gap-2 rounded-xl px-5 py-2.5",
                "text-[14px] font-medium transition-all duration-200 cursor-pointer",
                "bg-slate-900 text-white hover:bg-slate-800",
                "dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
              )}
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : step === 3 ? (
                <>
                  <span>Launch Workspace</span>
                  <CheckCircle2 className="size-4" />
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* ── Step count ── */}
        <p className="mt-4 text-center text-[12px] text-slate-400 dark:text-slate-500">
          Step {step} of {STEPS.length}
        </p>
      </motion.div>
    </div>
  );
}
