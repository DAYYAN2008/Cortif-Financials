"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  PieChart,
  TrendingUp,
  Newspaper,
  BrainCircuit,
  Wrench,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Navigation Items                                                   */
/* ------------------------------------------------------------------ */
const NAV_ITEMS = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Portfolio",
    href: "/dashboard/portfolio",
    icon: PieChart,
  },
  {
    label: "Markets",
    href: "/dashboard/markets",
    icon: TrendingUp,
  },
  {
    label: "News",
    href: "/dashboard/news",
    icon: Newspaper,
  },
  {
    label: "AI Analysis",
    href: "/dashboard/ai",
    icon: BrainCircuit,
  },
  {
    label: "Tools",
    href: "/dashboard/tools",
    icon: Wrench,
  },
];

const BOTTOM_ITEMS = [
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

/* ------------------------------------------------------------------ */
/*  Brand Mark                                                         */
/* ------------------------------------------------------------------ */
function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-1 group">
      <div className="flex items-center justify-center size-8 rounded-lg bg-slate-900 dark:bg-white shrink-0 transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
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
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white overflow-hidden whitespace-nowrap"
        >
          Cortif
        </motion.span>
      )}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Nav Item                                                           */
/* ------------------------------------------------------------------ */
function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
  collapsed,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200",
        isActive
          ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
      )}
      title={collapsed ? label : undefined}
    >
      {isActive && (
        <motion.div
          layoutId="active-nav"
          className="absolute inset-0 rounded-lg bg-slate-100 dark:bg-slate-800"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          style={{ zIndex: -1 }}
        />
      )}
      <Icon className="size-4 shrink-0" />
      {!collapsed && (
        <span className="truncate">{label}</span>
      )}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard Sidebar                                                  */
/* ------------------------------------------------------------------ */
export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      id="dashboard-sidebar"
      className={cn(
        "hidden lg:flex flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all duration-300 ease-in-out shrink-0",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* ── Top: Brand ── */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-slate-100 dark:border-slate-800/60">
        <SidebarBrand collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center size-6 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronLeft className="size-3.5" />
          )}
        </button>
      </div>

      {/* ── Quick Action ── */}
      <div className="px-3 pt-4 pb-2">
        <button
          className={cn(
            "flex items-center gap-2 w-full rounded-lg px-3 py-2 text-[13px] font-medium transition-all cursor-pointer",
            "bg-slate-900 text-white hover:bg-slate-800",
            "dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100",
            collapsed && "justify-center px-0"
          )}
        >
          <Plus className="size-4 shrink-0" />
          {!collapsed && <span>Add Asset</span>}
        </button>
      </div>

      {/* ── Main Nav ── */}
      <nav className="flex-1 px-3 py-2 space-y-0.5" aria-label="Dashboard navigation">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* ── Bottom Nav ── */}
      <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-800/60 space-y-0.5">
        {BOTTOM_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href}
            collapsed={collapsed}
          />
        ))}
        <Link
          href="/login"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
            "text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          )}
          title={collapsed ? "Log Out" : undefined}
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </Link>

        {/* Theme Toggle */}
        <div className={cn("flex pt-1", collapsed ? "justify-center" : "px-1")}>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile Top Bar (for small screens)                                 */
/* ------------------------------------------------------------------ */
export function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-slate-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-950/90 backdrop-blur-md">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2">
        <div className="flex items-center justify-center size-7 rounded-md bg-slate-900 dark:bg-white">
          <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden="true">
            <path d="M3 17L9 11L13 15L21 7" stroke="white" className="dark:stroke-slate-900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 7H21V11" stroke="white" className="dark:stroke-slate-900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-[14px] font-bold tracking-tight text-slate-900 dark:text-white">Cortif</span>
      </Link>

      <ThemeToggle />
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile Bottom Tab Bar                                              */
/* ------------------------------------------------------------------ */
export function DashboardMobileTabs() {
  const pathname = usePathname();

  const tabs = NAV_ITEMS.slice(0, 5); // Show first 5 items

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-around h-16 border-t border-slate-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-950/90 backdrop-blur-md"
      aria-label="Mobile navigation"
    >
      {tabs.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors",
              isActive
                ? "text-slate-900 dark:text-white"
                : "text-slate-400 dark:text-slate-500"
            )}
          >
            <Icon className="size-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}

      {/* Mobile Theme Toggle */}
      <div className="flex items-center justify-center py-1 px-3">
        <ThemeToggle />
      </div>
    </nav>
  );
}
