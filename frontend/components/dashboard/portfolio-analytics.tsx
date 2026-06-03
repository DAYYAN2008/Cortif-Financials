"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";

/* ------------------------------------------------------------------ */
/*  Shared Mock Data (derived from holdings)                           */
/* ------------------------------------------------------------------ */
const ALLOCATION_DATA = [
  { name: "Stocks", value: 57.0, color: "#3b82f6", darkColor: "#60a5fa" },
  { name: "Crypto", value: 31.5, color: "#f59e0b", darkColor: "#fbbf24" },
  { name: "Commodities", value: 11.5, color: "#8b5cf6", darkColor: "#a78bfa" },
];

const TOP_PERFORMER = {
  ticker: "TSLA",
  name: "Tesla Inc.",
  pnlPercent: 46.46,
};

const WORST_PERFORMER = {
  ticker: "GOLD",
  name: "Gold (XAU)",
  pnlPercent: -4.60,
};

const TOTAL_VALUE = 28030.28;

/* ------------------------------------------------------------------ */
/*  Custom Donut Tooltip (rendered outside the chart SVG)               */
/* ------------------------------------------------------------------ */
function FloatingTooltip({
  active,
  name,
  value,
  color,
  x,
  y,
}: {
  active: boolean;
  name: string;
  value: number;
  color: string;
  x: number;
  y: number;
}) {
  if (!active) return null;

  return (
    <div
      className={cn(
        "fixed pointer-events-none",
        "rounded-lg px-3 py-2 shadow-xl border",
        "bg-white dark:bg-slate-800",
        "border-slate-200/80 dark:border-slate-700/60",
        "transition-[top,left] duration-100 ease-out"
      )}
      style={{
        left: x + 14,
        top: y - 40,
        zIndex: 9999,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="size-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-[12px] font-semibold text-slate-900 dark:text-white">
          {name}
        </span>
      </div>
      <p className="text-[13px] font-mono font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
        {value.toFixed(1)}%
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Donut Chart Card                                                   */
/* ------------------------------------------------------------------ */
function AllocationDonut() {
  const [tooltipData, setTooltipData] = useState<{
    active: boolean;
    name: string;
    value: number;
    color: string;
    x: number;
    y: number;
  }>({ active: false, name: "", value: 0, color: "", x: 0, y: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-xl border overflow-hidden flex-1 min-w-0",
        "border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/80",
        "shadow-sm dark:shadow-none"
      )}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-1">
        <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">
          Allocation Breakdown
        </h3>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
          Portfolio diversification by asset class
        </p>
      </div>

      {/* Chart + Legend Row */}
      <div className="flex flex-col sm:flex-row items-center gap-2 px-5 pb-5 pt-2">
        {/* Donut Chart */}
        <div
          className="relative w-[180px] h-[180px] shrink-0"
          onMouseMove={(e) => {
            if (tooltipData.active) {
              setTooltipData((prev) => ({
                ...prev,
                x: e.clientX,
                y: e.clientY,
              }));
            }
          }}
          onMouseLeave={() => {
            setTooltipData((prev) => ({ ...prev, active: false }));
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ALLOCATION_DATA}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
                animationBegin={200}
                animationDuration={900}
                animationEasing="ease-out"
                onMouseEnter={(_, index) => {
                  const entry = ALLOCATION_DATA[index];
                  setTooltipData((prev) => ({
                    ...prev,
                    active: true,
                    name: entry.name,
                    value: entry.value,
                    color: entry.color,
                  }));
                }}
                onMouseLeave={() => {
                  setTooltipData((prev) => ({ ...prev, active: false }));
                }}
              >
                {ALLOCATION_DATA.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="dark:opacity-90"
                    style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.1))" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Classes
            </span>
            <span className="text-[20px] font-bold text-slate-900 dark:text-white font-mono">
              {ALLOCATION_DATA.length}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-row sm:flex-col gap-3 sm:gap-2.5 sm:pl-2">
          {ALLOCATION_DATA.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.3 }}
              className="flex items-center gap-2.5"
            >
              <div
                className="size-2.5 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex flex-col">
                <span className="text-[12px] font-medium text-slate-700 dark:text-slate-300">
                  {item.name}
                </span>
                <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                  {item.value.toFixed(1)}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cursor-following tooltip (rendered at DOM root level of this component) */}
      <FloatingTooltip
        active={tooltipData.active}
        name={tooltipData.name}
        value={tooltipData.value}
        color={tooltipData.color}
        x={tooltipData.x}
        y={tooltipData.y}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick Stat Card                                                    */
/* ------------------------------------------------------------------ */
function QuickStatCard({
  label,
  icon: Icon,
  iconColor,
  iconBg,
  children,
  delay = 0,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-xl border p-4",
        "border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/80",
        "shadow-sm dark:shadow-none",
        "group hover:border-slate-300/80 dark:hover:border-slate-700/60 transition-colors duration-200"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex items-center justify-center size-8 rounded-lg shrink-0",
            iconBg
          )}
        >
          <Icon className={cn("size-4", iconColor)} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {label}
          </span>
          <div className="mt-1">{children}</div>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick Stats Column                                                 */
/* ------------------------------------------------------------------ */
function QuickStats({ currency }: { currency: string }) {
  return (
    <div className="flex flex-col gap-3 w-full lg:w-[280px] shrink-0">
      {/* Top Performer */}
      <QuickStatCard
        label="Top Performer"
        icon={Trophy}
        iconColor="text-emerald-600 dark:text-emerald-400"
        iconBg="bg-emerald-50 dark:bg-emerald-500/10"
        delay={0.15}
      >
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-slate-900 dark:text-white">
            {TOP_PERFORMER.ticker}
          </span>
          <div className="flex items-center gap-0.5">
            <ArrowUpRight className="size-3 text-emerald-500" />
            <span className="text-[13px] font-semibold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              +{TOP_PERFORMER.pnlPercent.toFixed(2)}%
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
          {TOP_PERFORMER.name}
        </p>
      </QuickStatCard>

      {/* Worst Performer */}
      <QuickStatCard
        label="Worst Performer"
        icon={AlertTriangle}
        iconColor="text-red-600 dark:text-red-400"
        iconBg="bg-red-50 dark:bg-red-500/10"
        delay={0.22}
      >
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-slate-900 dark:text-white">
            {WORST_PERFORMER.ticker}
          </span>
          <div className="flex items-center gap-0.5">
            <ArrowDownRight className="size-3 text-red-500" />
            <span className="text-[13px] font-semibold font-mono tabular-nums text-red-600 dark:text-red-400">
              {WORST_PERFORMER.pnlPercent.toFixed(2)}%
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
          {WORST_PERFORMER.name}
        </p>
      </QuickStatCard>

      {/* Total Portfolio Value */}
      <QuickStatCard
        label="Total Value"
        icon={Wallet}
        iconColor="text-blue-600 dark:text-blue-400"
        iconBg="bg-blue-50 dark:bg-blue-500/10"
        delay={0.29}
      >
        <p className="text-[18px] font-bold text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
          {formatCurrency(TOTAL_VALUE, currency)}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
          Across {ALLOCATION_DATA.length} asset classes
        </p>
      </QuickStatCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported Analytics Panel                                           */
/* ------------------------------------------------------------------ */
export function PortfolioAnalytics({
  baseCurrency,
}: {
  baseCurrency: string;
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6">
      <AllocationDonut />
      <QuickStats currency={baseCurrency} />
    </div>
  );
}
