"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  Menu,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

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
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg py-2 text-[13px] font-medium transition-all duration-200",
        collapsed ? "justify-center w-10 px-0 mx-auto" : "px-3 w-full",
        isActive
          ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
      )}
      title={collapsed ? label : undefined}
    >
      {isActive && (
        <motion.div
          layoutId="active-nav"
          className={cn("absolute inset-0 rounded-lg bg-slate-100 dark:bg-slate-800", collapsed ? "w-10 mx-auto" : "")}
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      id="dashboard-sidebar"
      className={cn(
        "hidden lg:flex flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all duration-300 ease-in-out shrink-0",
        collapsed ? "w-[68px] items-center" : "w-[240px]"
      )}
    >
      {/* ── Top: Brand ── */}
      <div className={cn("flex items-center h-14 border-b border-slate-100 dark:border-slate-800/60 w-full relative", collapsed ? "justify-center px-0 flex-col" : "justify-between px-4")}>
        <SidebarBrand collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn("flex items-center justify-center size-6 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer", collapsed ? "absolute -right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 z-10 hidden" : "")}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronLeft className="size-3.5" />
          )}
        </button>
        {collapsed && (
            <button
            onClick={() => setCollapsed(false)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 flex items-center justify-center size-6 rounded-md text-slate-400 hover:text-slate-600 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer z-10"
          >
            <ChevronRight className="size-3.5" />
          </button>
        )}
      </div>

      {/* ── Quick Action ── */}
      <div className={cn("pt-4 pb-2 w-full", collapsed ? "px-0 flex justify-center" : "px-3")}>
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("modal", "add-asset");
            router.push(`${pathname}?${params.toString()}`);
          }}
          className={cn(
            "flex items-center gap-2 rounded-lg py-2 text-[13px] font-medium transition-all cursor-pointer",
            "bg-slate-900 text-white hover:bg-slate-800",
            "dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100",
            collapsed ? "justify-center w-10 px-0" : "w-full px-3"
          )}
        >
          <Plus className="size-4 shrink-0" />
          {!collapsed && <span>Add Asset</span>}
        </button>
      </div>

      {/* ── Main Nav ── */}
      <nav className={cn("flex-1 py-2 space-y-0.5 w-full", collapsed ? "px-0" : "px-3")} aria-label="Dashboard navigation">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            }
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* ── Bottom Nav ── */}
      <div className={cn("py-3 border-t border-slate-100 dark:border-slate-800/60 space-y-0.5 w-full flex flex-col items-center", collapsed ? "px-0" : "px-3 items-stretch")}>
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
            "group relative flex items-center gap-3 rounded-lg py-2 text-[13px] font-medium transition-colors",
            "text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400",
            collapsed ? "justify-center w-10 px-0 mx-auto" : "w-full px-3"
          )}
          title={collapsed ? "Log Out" : undefined}
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </Link>

        {/* Theme Toggle */}
        <div className={cn("flex pt-1", collapsed ? "justify-center w-full" : "px-1")}>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile Top Bar & Hamburger Menu                                    */
/* ------------------------------------------------------------------ */
export function DashboardMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  // Close sheet on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname, searchParams]);

  const handleAddAsset = () => {
    setOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", "add-asset");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-16 px-4 border-b border-slate-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-950/90 backdrop-blur-md">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2">
        <div className="flex items-center justify-center size-8 rounded-lg bg-slate-900 dark:bg-white">
          <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
            <path d="M3 17L9 11L13 15L21 7" stroke="white" className="dark:stroke-slate-900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 7H21V11" stroke="white" className="dark:stroke-slate-900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-[16px] font-bold tracking-tight text-slate-900 dark:text-white">Cortif</span>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="flex items-center justify-center size-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <Menu className="size-5" />
          <span className="sr-only">Toggle Menu</span>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[350px] flex flex-col p-0 border-l border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="flex items-center h-16 px-6 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
              <SidebarBrand collapsed={false} />
            </div>

            <div className="px-4 py-6">
              <button
                onClick={handleAddAsset}
                className="flex items-center justify-center gap-2 w-full rounded-xl px-4 py-3 text-[14px] font-medium transition-all cursor-pointer bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 mb-6"
              >
                <Plus className="size-4 shrink-0" />
                <span>Add Asset</span>
              </button>

              <nav className="space-y-1" aria-label="Mobile main navigation">
                {NAV_ITEMS.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href)
                    }
                    collapsed={false}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </nav>
            </div>

            <div className="mt-auto px-4 py-6 border-t border-slate-100 dark:border-slate-800/60 space-y-1">
              {BOTTOM_ITEMS.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.href}
                  collapsed={false}
                  onClick={() => setOpen(false)}
                />
              ))}
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] font-medium transition-colors text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                <LogOut className="size-4 shrink-0" />
                <span>Log Out</span>
              </Link>
              
              <div className="px-3 pt-4 flex items-center justify-between">
                <span className="text-[13px] font-medium text-slate-500">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
