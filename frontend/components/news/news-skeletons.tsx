"use client";

/* ================================================================== */
/*  Skeleton loaders for the News Dashboard                            */
/*  Prevents layout shifts during category switching                   */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/*  Shimmer bar helper                                                  */
/* ------------------------------------------------------------------ */
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Hero Section Skeleton                                               */
/* ------------------------------------------------------------------ */
export function HeroSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — featured article card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 aspect-[16/9] min-h-[320px]">
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
            <Shimmer className="h-3 w-20 mb-4" />
            <Shimmer className="h-7 w-3/4 mb-3" />
            <Shimmer className="h-7 w-1/2 mb-4" />
            <Shimmer className="h-4 w-full mb-2" />
            <Shimmer className="h-4 w-2/3" />
          </div>
        </div>

        {/* Right — bulletins panel */}
        <div className="lg:col-span-1 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 p-5">
          <Shimmer className="h-4 w-36 mb-5" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="py-3.5">
              <Shimmer className="h-3 w-16 mb-2.5" />
              <Shimmer className="h-4 w-full mb-1.5" />
              <Shimmer className="h-4 w-3/4" />
              {i < 3 && (
                <div className="mt-3.5 h-px bg-slate-200/40 dark:bg-slate-800/60" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stream Row Skeleton                                                 */
/* ------------------------------------------------------------------ */
function StreamRowSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-xl p-3 sm:p-4">
      {/* Thumbnail */}
      <Shimmer className="w-24 h-24 md:w-32 md:h-20 rounded-lg shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0 py-0.5">
        <Shimmer className="h-4 w-5/6 mb-2.5" />
        <Shimmer className="h-3.5 w-2/3 mb-3" />
        <Shimmer className="h-3 w-24 mb-2" />
        <Shimmer className="h-3 w-full" />
      </div>

      {/* Ticker badges */}
      <div className="hidden sm:flex items-center gap-2 shrink-0 pt-1">
        <Shimmer className="h-6 w-20 rounded-full" />
        <Shimmer className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stream Skeleton (multiple rows)                                     */
/* ------------------------------------------------------------------ */
export function StreamSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <StreamRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
