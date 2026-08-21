"use client";

import { useEffect, useState, Suspense, useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  ChevronRight,
  ArrowLeft,
  Calendar,
  DollarSign,
  Pencil,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type TransactionType = "buy" | "sell";
type AssetType = "Stock" | "Crypto" | "Commodity";
type ModalStep = "search" | "transaction";
type FilterCategory = "All" | AssetType;

interface SearchableAsset {
  id: string;
  name: string;
  symbol: string;
  asset_type: AssetType;
  logo_url?: string;
  fallback_price: number;
}

/* ------------------------------------------------------------------ */
/*  Development Mock Data                                              */
/* ------------------------------------------------------------------ */
const DEVELOPMENT_MOCK_ASSETS: SearchableAsset[] = [
  { id: "sol", name: "Solana", symbol: "SOL", asset_type: "Crypto", fallback_price: 20474.96 },
  { id: "btc", name: "Bitcoin", symbol: "BTC", asset_type: "Crypto", fallback_price: 18000000 },
  { id: "eth", name: "Ethereum", symbol: "ETH", asset_type: "Crypto", fallback_price: 450000 },
  { id: "aapl", name: "Apple Inc.", symbol: "AAPL", asset_type: "Stock", fallback_price: 48000 },
  { id: "nvda", name: "NVIDIA Corp.", symbol: "NVDA", asset_type: "Stock", fallback_price: 135000 },
  { id: "tsla", name: "Tesla Inc.", symbol: "TSLA", asset_type: "Stock", fallback_price: 27500 },
  { id: "msft", name: "Microsoft Corp.", symbol: "MSFT", asset_type: "Stock", fallback_price: 42000 },
  { id: "gold", name: "Gold Trust", symbol: "GLD", asset_type: "Commodity", fallback_price: 65000 },
  { id: "silver", name: "Silver Trust", symbol: "SLV", asset_type: "Commodity", fallback_price: 2800 },
  { id: "oil", name: "Crude Oil Fund", symbol: "USO", asset_type: "Commodity", fallback_price: 7500 },
];

const FILTER_CATEGORIES: FilterCategory[] = ["All", "Stock", "Crypto", "Commodity"];

const FILTER_LABELS: Record<FilterCategory, string> = {
  All: "All",
  Stock: "Stocks",
  Crypto: "Crypto",
  Commodity: "Commodities",
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://dayyanyasir-cortif-backend.hf.space";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatDatetimeLabel(d: Date): string {
  try {
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
}

/* ------------------------------------------------------------------ */
/*  Date & Time Picker Overlay                                         */
/* ------------------------------------------------------------------ */
function DateTimePickerOverlay({
  selectedTimestamp,
  onChange,
  onClose,
}: {
  selectedTimestamp: Date;
  onChange: (d: Date) => void;
  onClose: () => void;
}) {
  const [tempTimestamp, setTempTimestamp] = useState(new Date(selectedTimestamp));
  const [viewDate, setViewDate] = useState(new Date(selectedTimestamp));
  
  // Time state
  const [timeStr, setTimeStr] = useState(() => {
    return tempTimestamp.toTimeString().slice(0, 5); // "HH:MM"
  });

  const now = new Date();

  // Calendar logic
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const isSelected = (day: number) => {
    return (
      tempTimestamp.getFullYear() === year &&
      tempTimestamp.getMonth() === month &&
      tempTimestamp.getDate() === day
    );
  };

  const isFuture = (day: number) => {
    // A day is entirely in the future if the START of that day is > now
    const startOfDay = new Date(year, month, day, 0, 0, 0);
    return startOfDay > now;
  };

  const handleDayClick = (day: number) => {
    if (isFuture(day)) return;
    const [hours, minutes] = timeStr.split(":").map(Number);
    
    const newDate = new Date(year, month, day, hours, minutes);
    if (newDate > now) {
      setTempTimestamp(now);
      setTimeStr(now.toTimeString().slice(0, 5));
    } else {
      setTempTimestamp(newDate);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTimeStr(val);
    const [hours, minutes] = val.split(":").map(Number);
    const newDate = new Date(tempTimestamp);
    newDate.setHours(hours, minutes);
    if (newDate > now) {
      setTempTimestamp(now);
      setTimeStr(now.toTimeString().slice(0, 5));
    } else {
      setTempTimestamp(newDate);
    }
  };

  const nextMonth = () => {
    const next = new Date(year, month + 1, 1);
    if (next.getFullYear() > now.getFullYear() || (next.getFullYear() === now.getFullYear() && next.getMonth() > now.getMonth())) {
      return;
    }
    setViewDate(next);
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));

  const handleConfirm = () => {
    onChange(tempTimestamp);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/60">
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full transition-colors"
          type="button"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex-1">
          Date & Time
        </h3>
      </div>

      <div className="p-5 flex-1 overflow-y-auto scrollbar-thin">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {viewDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            disabled={viewDate.getFullYear() === now.getFullYear() && viewDate.getMonth() === now.getMonth()}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {blanks.map((b) => (
            <div key={`blank-${b}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const selected = isSelected(day);
            const disabled = isFuture(day);
            return (
              <button
                type="button"
                key={day}
                onClick={() => handleDayClick(day)}
                disabled={disabled}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-all
                  ${disabled ? "pointer-events-none opacity-20 text-slate-400" : ""}
                  ${!disabled && !selected ? "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" : ""}
                  ${selected ? "bg-blue-600 dark:bg-indigo-600 text-white font-semibold shadow-sm" : ""}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Time Selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Time
          </label>
          <input
            type="time"
            value={timeStr}
            onChange={handleTimeChange}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Confirmation CTA */}
      <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/50">
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-3 text-sm font-semibold rounded-xl flex items-center justify-center transition-all duration-200 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 active:scale-[0.98]"
        >
          Change Date & Time
        </button>
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/* ------------------------------------------------------------------ */
/*  Logo Fallback Component                                            */
/* ------------------------------------------------------------------ */
function AssetLogo({ asset, size = "md" }: { asset: SearchableAsset; size?: "sm" | "md" }) {
  const gradients: Record<AssetType, string> = {
    Crypto: "from-violet-500 to-indigo-600",
    Stock: "from-emerald-500 to-teal-600",
    Commodity: "from-amber-500 to-orange-600",
  };

  const sizeClass = size === "sm" ? "size-8" : "size-10";
  const textSize = size === "sm" ? "text-[9px]" : "text-[11px]";

  return (
    <div
      className={`flex items-center justify-center ${sizeClass} rounded-full bg-gradient-to-br ${gradients[asset.asset_type]} shrink-0 shadow-sm`}
    >
      <span className={`${textSize} font-bold text-white tracking-wide leading-none`}>
        {asset.symbol.slice(0, 3)}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1: Asset Search View                                          */
/* ------------------------------------------------------------------ */
function AssetSearchStep({
  onSelect,
  onClose,
}: {
  onSelect: (asset: SearchableAsset) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("All");

  const filteredAssets = useMemo(() => {
    const term = query.trim().toLowerCase();
    return DEVELOPMENT_MOCK_ASSETS.filter((asset) => {
      const matchesFilter = activeFilter === "All" || asset.asset_type === activeFilter;
      const matchesQuery =
        !term ||
        asset.name.toLowerCase().includes(term) ||
        asset.symbol.toLowerCase().includes(term);
      return matchesFilter && matchesQuery;
    });
  }, [query, activeFilter]);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Select Asset
        </h2>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="px-6 pt-5 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search assets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 focus:border-slate-400 dark:focus:border-slate-600 transition-all"
          />
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="px-6 pb-3">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl gap-0.5">
          {FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveFilter(cat)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all duration-200 ${
                activeFilter === cat
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {FILTER_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="px-3 pb-4 max-h-[42vh] overflow-y-auto scrollbar-thin">
        {filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Search className="size-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              No assets found
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredAssets.map((asset, idx) => (
              <motion.button
                key={asset.id}
                type="button"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.2 }}
                onClick={() => onSelect(asset)}
                className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-left transition-all duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/60 group"
              >
                <AssetLogo asset={asset} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {asset.name}
                    </span>
                    <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase shrink-0">
                      {asset.symbol}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                    {asset.asset_type}
                  </span>
                </div>
                <ChevronRight className="size-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors shrink-0" />
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2: Contextual Transaction Entry Form                          */
/* ------------------------------------------------------------------ */
const inputClass =
  "w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 focus:border-slate-400 dark:focus:border-slate-600 transition-all";

function TransactionStep({
  selectedAsset,
  onBack,
  onClose,
}: {
  selectedAsset: SearchableAsset;
  onBack: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<TransactionType>("buy");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(selectedAsset.fallback_price.toString());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [selectedTimestamp, setSelectedTimestamp] = useState<Date>(new Date());

  /* Toggleable metadata panels */
  const [showFee, setShowFee] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [fee, setFee] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const isFormValid =
    parseFloat(quantity) > 0 &&
    parseFloat(price) > 0;

  const subtotal = useMemo(() => {
    const q = parseFloat(quantity) || 0;
    const p = parseFloat(price) || 0;
    return q * p;
  }, [quantity, price]);

  const feeValue = useMemo(() => parseFloat(fee) || 0, [fee]);

  const totalValue = useMemo(() => subtotal + feeValue, [subtotal, feeValue]);

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        ticker: selectedAsset.symbol.toUpperCase(),
        asset_name: selectedAsset.name,
        asset_type: selectedAsset.asset_type.toLowerCase(),
        transaction_type: type.toUpperCase(),
        quantity: parseFloat(quantity),
        execution_price: parseFloat(price),
        executed_at: selectedTimestamp.toISOString(),
      };

      if (fee.trim()) payload.fee = parseFloat(fee);
      if (notes.trim()) payload.notes = notes.trim();

      const res = await fetch(`${BACKEND_URL}/api/v1/portfolio/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const detailMessage =
          typeof body?.detail === "object"
            ? JSON.stringify(body.detail)
            : body?.detail;
        setError(
          detailMessage ??
            `Server rejected transaction log entry (Status ${res.status})`
        );
        setIsSubmitting(false);
        return;
      }

      const responseBody = await res.json().catch(() => null);
      const transactionId = responseBody?.id ?? null;

      setIsSubmitting(false);
      setSuccessId(transactionId);

      setQuantity("");
      setFee("");
      setNotes("");
      setShowFee(false);
      setShowNotes(false);

      window.dispatchEvent(new CustomEvent("portfolio-updated"));

      setTimeout(() => {
        setSuccessId(null);
        router.refresh();
        onClose();
      }, 800);
    } catch (err: any) {
      setError(
        err.message || "An unexpected network execution connection failure occurred."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* ── Selected Asset Header Bar ── */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/60">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="p-1.5 -ml-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          aria-label="Go back to search"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex items-center gap-2.5 flex-1 min-w-0 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
          <AssetLogo asset={selectedAsset} size="sm" />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
              {selectedAsset.name}
            </span>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase shrink-0">
              {selectedAsset.symbol}
            </span>
          </div>
          <ChevronDown className="size-3.5 text-slate-400 dark:text-slate-500 ml-auto shrink-0" />
        </div>
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* ── Form Body ── */}
      <div className="px-5 py-4 space-y-4 max-h-[58vh] overflow-y-auto">
        {/* Transaction Direction Toggle */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => setType("buy")}
            disabled={isSubmitting}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
              type === "buy"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setType("sell")}
            disabled={isSubmitting}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
              type === "sell"
                ? "bg-white dark:bg-slate-900 text-red-500 dark:text-red-400 shadow-sm"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            Sell
          </button>
        </div>

        {/* Numeric Inputs: Quantity & Price Per Unit */}
        <div className="flex gap-3">
          <div className="space-y-1.5 flex-1">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Quantity
            </label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isSubmitting}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5 flex-1">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Price / Unit
            </label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isSubmitting}
              className={inputClass}
            />
          </div>
        </div>

        {/* ── Metadata Action Buttons Row ── */}
        <div className="flex items-center gap-2">
          {/* Timestamp Picker */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              disabled={isSubmitting}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 text-left transition-all hover:border-slate-300 dark:hover:border-slate-600 group"
            >
              <Calendar className="size-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0 transition-colors" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                {formatDatetimeLabel(selectedTimestamp)}
              </span>
            </button>
          </div>

          {/* Fee Toggle */}
          <button
            type="button"
            onClick={() => setShowFee(!showFee)}
            disabled={isSubmitting}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${
              showFee
                ? "border-slate-900/20 dark:border-white/20 bg-slate-900/5 dark:bg-white/5 text-slate-900 dark:text-white"
                : "border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
            title="Add fee"
          >
            <DollarSign className="size-3.5 shrink-0" />
            <span className="text-xs font-medium">Fee</span>
          </button>

          {/* Notes Toggle */}
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            disabled={isSubmitting}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${
              showNotes
                ? "border-slate-900/20 dark:border-white/20 bg-slate-900/5 dark:bg-white/5 text-slate-900 dark:text-white"
                : "border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
            title="Add notes"
          >
            <Pencil className="size-3.5 shrink-0" />
            <span className="text-xs font-medium">Note</span>
          </button>
        </div>

        {/* ── Expandable Fee Input ── */}
        <AnimatePresence>
          {showFee && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Transaction Fee
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500 font-medium pointer-events-none">
                    Rs.
                  </span>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    disabled={isSubmitting}
                    autoFocus
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Expandable Notes Input ── */}
        <AnimatePresence>
          {showNotes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Add a note about this transaction..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                  className={`${inputClass} resize-none`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Aggregate Value Summary Panel ── */}
        <AnimatePresence>
          {parseFloat(quantity) > 0 && parseFloat(price) > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 px-4 py-3 space-y-2">
                {/* Breakdown rows */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {parseFloat(quantity).toLocaleString("en-US", { maximumFractionDigits: 8 })} × {formatCurrency(parseFloat(price) || 0)}
                  </span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 tabular-nums">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                {feeValue > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Fee
                    </span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 tabular-nums">
                      + {formatCurrency(feeValue)}
                    </span>
                  </div>
                )}
                {/* Divider */}
                <div className="border-t border-slate-200/80 dark:border-slate-700/50" />
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {type === "buy" ? "Total Spent" : "Total Received"}
                  </span>
                  <span className={`text-sm font-bold tabular-nums ${
                    type === "buy"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-500 dark:text-red-400"
                  }`}>
                    {formatCurrency(totalValue)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error / Success Alerts ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:bg-red-950/30 dark:border-red-900/50">
                <AlertCircle className="size-4 mt-0.5 shrink-0 text-red-500" />
                <p className="text-xs text-red-700 dark:text-red-300 font-mono max-w-full overflow-x-auto">
                  {error}
                </p>
              </div>
            </motion.div>
          )}
          {successId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30 dark:border-emerald-900/50">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Transaction saved
                  </p>
                  <p className="text-[10px] font-mono text-emerald-600/70 dark:text-emerald-400/60 mt-0.5">
                    ID: {successId}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Execution CTA Footer ── */}
      <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/50">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className="w-full py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Saving…
            </>
          ) : (
            "Add Transaction"
          )}
        </button>
      </div>

      <AnimatePresence>
        {isDatePickerOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 bg-white dark:bg-slate-900 overflow-hidden rounded-2xl"
          >
            <DateTimePickerOverlay
              selectedTimestamp={selectedTimestamp}
              onChange={setSelectedTimestamp}
              onClose={() => setIsDatePickerOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Modal Orchestrator                                            */
/* ------------------------------------------------------------------ */
function AddAssetModalContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get("modal") === "add-asset";

  const [step, setStep] = useState<ModalStep>("search");
  const [selectedAsset, setSelectedAsset] = useState<SearchableAsset | null>(null);

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("search");
      setSelectedAsset(null);
    }
  }, [isOpen]);

  const handleAssetSelect = useCallback((asset: SearchableAsset) => {
    setSelectedAsset(asset);
    setStep("transaction");
  }, []);

  const handleBack = useCallback(() => {
    setStep("search");
    setSelectedAsset(null);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800"
        >
          <AnimatePresence mode="wait">
            {step === "search" ? (
              <motion.div
                key="step-search"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <AssetSearchStep onSelect={handleAssetSelect} onClose={closeModal} />
              </motion.div>
            ) : (
              selectedAsset && (
                <motion.div
                  key="step-transaction"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <TransactionStep
                    selectedAsset={selectedAsset}
                    onBack={handleBack}
                    onClose={closeModal}
                  />
                </motion.div>
              )
            )}
          </AnimatePresence>
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