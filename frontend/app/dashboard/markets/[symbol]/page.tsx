"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  MOCK_STOCKS,
  MOCK_MUTUAL_FUNDS,
  MOCK_FOREX,
  MOCK_COMMODITIES,
} from "@/types/market";

/* ------------------------------------------------------------------ */
/*  Time interval types                                                 */
/* ------------------------------------------------------------------ */
const INTERVALS = ["1D", "1W", "1M", "1Y", "ALL"] as const;
type Interval = (typeof INTERVALS)[number];

/* ------------------------------------------------------------------ */
/*  Mock Chart Data Generator                                           */
/* ------------------------------------------------------------------ */
function generateChartData(interval: Interval, basePrice: number) {
  const points: { time: string; price: number }[] = [];
  let count: number;
  let value = basePrice * 0.95;

  switch (interval) {
    case "1D":
      count = 24;
      break;
    case "1W":
      count = 7;
      break;
    case "1M":
      count = 30;
      break;
    case "1Y":
      count = 52;
      break;
    case "ALL":
      count = 100;
      break;
  }

  for (let i = 0; i < count; i++) {
    const noise = (Math.random() - 0.45) * basePrice * 0.02;
    value = Math.max(basePrice * 0.8, Math.min(basePrice * 1.15, value + noise));

    let label: string;
    switch (interval) {
      case "1D":
        label = `${i.toString().padStart(2, "0")}:00`;
        break;
      case "1W":
        label = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i % 7];
        break;
      case "1M":
        label = `Day ${i + 1}`;
        break;
      case "1Y":
        label = `W${i + 1}`;
        break;
      case "ALL":
        label = `${i + 1}`;
        break;
    }

    points.push({ time: label, price: parseFloat(value.toFixed(2)) });
  }
  return points;
}

/* ------------------------------------------------------------------ */
/*  Resolve Asset from Symbol                                           */
/* ------------------------------------------------------------------ */
function resolveAsset(symbol: string) {
  // Check stocks
  const stock = MOCK_STOCKS.find(
    (s) => s.symbol.toLowerCase() === symbol.toLowerCase()
  );
  if (stock) return { type: "stock" as const, name: stock.name, price: stock.price, change: stock.change, symbol: stock.symbol };

  // Check mutual funds
  const mf = MOCK_MUTUAL_FUNDS.find(
    (s) => s.symbol.toLowerCase() === symbol.toLowerCase()
  );
  if (mf) return { type: "fund" as const, name: mf.name, price: mf.price, change: mf.change, symbol: mf.symbol };

  // Check forex
  const forex = MOCK_FOREX.find(
    (p) => `${p.base}${p.quote}`.toLowerCase() === symbol.toLowerCase()
  );
  if (forex) return { type: "forex" as const, name: `${forex.base}/${forex.quote}`, price: forex.rate, change: forex.change, symbol: `${forex.base}${forex.quote}` };

  // Check commodities
  const commodity = MOCK_COMMODITIES.find(
    (c) => c.id.toLowerCase() === symbol.toLowerCase()
  );
  if (commodity) return { type: "commodity" as const, name: commodity.name, price: commodity.price, change: commodity.change, symbol: commodity.id };

  // Fallback
  return { type: "stock" as const, name: symbol.toUpperCase(), price: 100.00, change: 0.0, symbol: symbol.toUpperCase() };
}

/* ------------------------------------------------------------------ */
/*  Custom Recharts Tooltip                                             */
/* ------------------------------------------------------------------ */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 dark:bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[10px] text-slate-400 mb-0.5">{label}</p>
      <p className="text-[13px] font-semibold text-white font-mono tabular-nums">
        {payload[0].value.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </div>
  );
}

/* ================================================================== */
/*  Asset Dashboard Page                                                */
/* ================================================================== */
export default function AssetDashboardPage() {
  const params = useParams<{ symbol: string }>();
  const symbol = params.symbol;
  const [interval, setInterval] = useState<Interval>("1M");

  const asset = useMemo(() => resolveAsset(symbol), [symbol]);
  const chartData = useMemo(
    () => generateChartData(interval, asset.price),
    [interval, asset.price]
  );

  const isPositive = asset.change >= 0;
  const chartColor = isPositive ? "#34d399" : "#f87171";

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
      {/* ── Back Navigation ── */}
      <Link
        href="/dashboard/markets"
        className="inline-flex items-center text-[13px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Markets
      </Link>

      {/* ── Asset Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/40 flex items-center justify-center">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 tracking-wider">
                  {asset.symbol.slice(0, 3)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {asset.name}
                </h1>
                <p className="text-[12px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">
                  {asset.symbol}
                </p>
              </div>
            </div>
          </div>

          <div className="sm:ml-auto text-left sm:text-right">
            <p className="text-3xl font-bold tabular-nums font-mono text-slate-900 dark:text-white tracking-tight">
              {asset.price.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[13px] font-semibold tabular-nums mt-0.5",
                isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {isPositive ? (
                <TrendingUp className="size-4" />
              ) : (
                <TrendingDown className="size-4" />
              )}
              {isPositive ? "+" : ""}
              {asset.change.toFixed(2)}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Two-Panel Layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Main Panel: Chart Engine ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "xl:col-span-2 rounded-xl border overflow-hidden",
            "border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/80"
          )}
        >
          {/* Chart Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-slate-400 dark:text-slate-500" />
              <h2 className="text-[14px] font-semibold text-slate-900 dark:text-white">
                Price Chart
              </h2>
            </div>
            <div className="flex items-center gap-1">
              {INTERVALS.map((iv) => (
                <button
                  key={iv}
                  onClick={() => setInterval(iv)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer",
                    interval === iv
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:text-slate-300 dark:hover:bg-slate-800"
                  )}
                >
                  {iv}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Body */}
          <div className="h-[380px] px-4 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="chartGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={chartColor}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor={chartColor}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800/50"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                  tickFormatter={(v: number) =>
                    v.toLocaleString("en-US", { maximumFractionDigits: 0 })
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill="url(#chartGradient)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: chartColor,
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── Secondary Panel: AI Insights Canvas ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "rounded-xl border overflow-hidden flex flex-col",
            "border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/80"
          )}
        >
        </motion.div>
      </div>
    </div>
  );
}
