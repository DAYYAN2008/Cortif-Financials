"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

/* ------------------------------------------------------------------ */
/* Types                                                             */
/* ------------------------------------------------------------------ */
type TransactionType = "buy" | "sell";
type AssetType = "stock" | "crypto" | "commodity";

const ASSET_TYPES: { value: AssetType; label: string; icon: string }[] = [
  { value: "stock", label: "Stock", icon: "📈" },
  { value: "crypto", label: "Crypto", icon: "₿" },
  { value: "commodity", label: "Commodity", icon: "🪙" },
];

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://dayyanyasir-cortif-backend.hf.space";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all";

/* ------------------------------------------------------------------ */
/* Modal Content                                                     */
/* ------------------------------------------------------------------ */
function AddAssetModalContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get("modal") === "add-asset";

  /* ---- Form State ---- */
  const [ticker, setTicker] = useState("");
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState<AssetType>("stock");
  const [assetSuggestions, setAssetSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [type, setType] = useState<TransactionType>("buy");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");

  /* ---- Request Lifecycle ---- */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (isOpen) {
      setTicker("");
      setAssetName("");
      setAssetType("stock");
      setType("buy");
      setQuantity("");
      setPrice("");
      setDate(new Date().toISOString().split("T")[0]);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  /* ---- Fetch asset suggestions (debounced with fallback) ---- */
  useEffect(() => {
    const term = ticker.trim();
    if (!term) {
      setAssetSuggestions([]);
      return;
    }

    const id = setTimeout(async () => {
      try {
        let res = await fetch(`${BACKEND_URL}/api/v1/assets?search=${encodeURIComponent(term)}`);
        if (!res.ok) {
          res = await fetch(`${BACKEND_URL}/api/assets?search=${encodeURIComponent(term)}`);
        }
        if (!res.ok) return;
        
        const body = await res.json().catch(() => null);
        setAssetSuggestions(body?.assets ?? []);
        setShowDropdown(true);
      } catch (err) {
        setAssetSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(id);
  }, [ticker]);

  const isFormValid =
    ticker.trim().length > 0 &&
    assetName.trim().length > 0 &&
    parseFloat(quantity) > 0 &&
    parseFloat(price) > 0 &&
    date.length > 0;

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("You must be logged in to add a transaction.");
        setIsSubmitting(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };

      /* 1. Resolve Portfolio ID with route asymmetry check */
      let portfolioRes = await fetch(`${BACKEND_URL}/api/portfolio`, { headers });
      if (!portfolioRes.ok) {
        portfolioRes = await fetch(`${BACKEND_URL}/api/v1/portfolio`, { headers });
      }

      if (!portfolioRes.ok) {
        setError("Failed to resolve portfolio schema mapping endpoints.");
        setIsSubmitting(false);
        return;
      }

      const portfolio = await portfolioRes.json();

      const payload = {
        portfolio_id: portfolio.id,
        ticker: ticker.trim().toUpperCase(),
        asset_name: assetName.trim(),
        asset_type: assetType.toLowerCase(),
        transaction_type: type.toUpperCase(),
        quantity: parseFloat(quantity),
        execution_price: parseFloat(price),
        executed_at: new Date(date).toISOString(),
      };

      /* 2. POST Transaction with dynamic routing fallback protection */
      let res = await fetch(`${BACKEND_URL}/api/transactions`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        res = await fetch(`${BACKEND_URL}/api/v1/portfolio/transactions`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.detail ?? `Transaction rejected by backend server (Status ${res.status})`);
        setIsSubmitting(false);
        return;
      }

      setTicker("");
      setAssetName("");
      setShowDropdown(false);
      window.dispatchEvent(new CustomEvent("portfolio-updated"));
      router.refresh();
      closeModal();
    } catch (err: any) {
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isSubmitting ? undefined : closeModal}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add Transaction</h2>
            <button onClick={closeModal} disabled={isSubmitting} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full transition-colors">
              <X className="size-4" />
            </button>
          </div>

          <div className="px-6 py-6 space-y-5 max-h-[65vh] overflow-y-auto">
            <div className="space-y-1.5 relative">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Asset Ticker</label>
              <input
                type="text"
                placeholder="e.g. AAPL, BTC, LUCK"
                value={ticker}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setTicker(e.target.value.toUpperCase());
                  setShowDropdown(true);
                }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                disabled={isSubmitting}
                className={inputClass}
              />

              {showDropdown && assetSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 z-50 max-h-48 overflow-auto rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
                  {assetSuggestions.map((a: any) => (
                    <button
                      key={a.id ?? a.ticker}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setTicker((a.ticker || "").toUpperCase());
                        setAssetName(a.name || "");
                        setAssetType((a.asset_type || "stock") as AssetType);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                    >
                      <span className="font-semibold mr-2">{a.ticker}</span>
                      <span className="text-slate-500 dark:text-slate-400">- {a.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Asset Name</label>
              <input type="text" placeholder="e.g. Apple Inc." value={assetName} onChange={(e) => setAssetName(e.target.value)} disabled={isSubmitting} className={inputClass} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Asset Type</label>
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {ASSET_TYPES.map((at) => (
                  <button
                    key={at.value}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setAssetType(at.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-all ${
                      assetType === at.value ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"
                    }`}
                  >
                    <span>{at.icon}</span> {at.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Transaction Type</label>
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button type="button" onClick={() => setType("buy")} className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${type === "buy" ? "bg-white dark:bg-slate-950 text-emerald-600 shadow-sm" : "text-slate-500"}`}>Buy</button>
                <button type="button" onClick={() => setType("sell")} className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${type === "sell" ? "bg-white dark:bg-slate-950 text-red-600 shadow-sm" : "text-slate-500"}`}>Sell</button>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Quantity</label>
                <input type="number" step="any" placeholder="0.00" value={quantity} onChange={(e) => setQuantity(e.target.value)} disabled={isSubmitting} className={inputClass} />
              </div>
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Execution Price</label>
                <input type="number" step="any" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} disabled={isSubmitting} className={inputClass} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={isSubmitting} className={inputClass} />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:bg-red-950/30 dark:border-red-900/50">
                    <AlertCircle className="size-4 mt-0.5 shrink-0 text-red-500" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/50">
            <button onClick={closeModal} disabled={isSubmitting} className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">Cancel</button>
            <button onClick={handleSubmit} disabled={!isFormValid || isSubmitting} className="px-4 py-2 text-sm text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg flex items-center gap-2 min-w-[140px] justify-center">
              {isSubmitting ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : "Save Transaction"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function AddAssetModal() {
  return (
    <Suspense fallback={null}>
      <AddAssetModalContent />
    </Suspense>
  );
}