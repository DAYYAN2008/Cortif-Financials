"use client";

import Link from "next/link";
import {
  Search,
  Menu,
  ChevronRight,
  BrainCircuit,
  LineChart,
  Radio,
  Star,
  Users,
  Building2,
  TrendingUp,
  CircleDollarSign,
  Globe,
  ArrowLeftRight,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

/* ------------------------------------------------------------------ */
/*  Mega-menu item component (icon + title + description)              */
/* ------------------------------------------------------------------ */
function MegaMenuItem({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <NavigationMenuLink
      href={href}
      render={<Link href={href} />}
      className="flex items-start gap-3 rounded-md p-3 hover:bg-slate-50 focus:bg-slate-50 dark:hover:bg-slate-800 dark:focus:bg-slate-800 transition-colors cursor-pointer"
    >
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <Icon className="size-4 text-slate-600 dark:text-slate-400" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-semibold leading-tight text-slate-900 dark:text-slate-100">
          {title}
        </span>
        <span className="text-[11.5px] leading-snug text-slate-500 dark:text-slate-400">
          {description}
        </span>
      </div>
    </NavigationMenuLink>
  );
}

/* ------------------------------------------------------------------ */
/*  Simple dropdown link item (no icon)                                */
/* ------------------------------------------------------------------ */
function DropdownItem({
  href,
  icon: Icon,
  label,
  showChevron,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  showChevron?: boolean;
}) {
  return (
    <NavigationMenuLink
      href={href}
      render={<Link href={href} />}
      className="group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus:bg-slate-800 transition-colors cursor-pointer"
    >
      <Icon className="size-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {showChevron && (
        <ChevronRight className="size-3.5 text-slate-400 opacity-50 group-hover:opacity-100 transition-opacity" />
      )}
    </NavigationMenuLink>
  );
}

/* ------------------------------------------------------------------ */
/*  Brand / Logo                                                       */
/* ------------------------------------------------------------------ */
function BrandLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 shrink-0"
      id="logo-link"
    >
      {/* Icon Mark */}
      <div className="flex items-center justify-center size-7 rounded-md bg-slate-900 dark:bg-white">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-4"
          aria-hidden="true"
        >
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
      {/* Wordmark */}
      <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
        Cortif 
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Command-K Search Trigger                                           */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/*  Command-K Search Trigger / Adaptive Search Bar                    */
/* ------------------------------------------------------------------ */
function CommandKSearch() {
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus with CMD+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsFocused(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isFocused) {
      inputRef.current?.focus();
    }
  }, [isFocused]);

  // Handle click outside to blur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    if (isFocused) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFocused]);

  return (
    <div ref={containerRef} className="relative hidden md:flex items-center justify-center w-[240px] h-9">
      <motion.div
        layout
        initial={false}
        animate={{
          width: isFocused ? (value.length > 30 ? 460 : 320) : 240,
          scale: isFocused ? 1.03 : 1,
          boxShadow: isFocused 
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
            : "0 0px 0px rgba(0,0,0,0)",
          zIndex: isFocused ? 100 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          mass: 0.8,
        }}
        onClick={() => setIsFocused(true)}
        className={cn(
          "absolute left-1/2 -translate-x-1/2 flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 transition-colors cursor-text overflow-hidden",
          isFocused 
            ? "bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-800 ring-4 ring-slate-900/5 dark:ring-white/5" 
            : "hover:border-slate-300 hover:bg-slate-100 dark:bg-slate-800/50 dark:border-slate-700 dark:hover:border-slate-600",
          "dark:text-slate-200"
        )}
      >
        <div className="flex items-center gap-2.5 w-full h-5">
          <Search className={cn("size-4 shrink-0 transition-colors mb-[0.5px]", isFocused ? "text-slate-900 dark:text-white" : "text-slate-400")} />
          
          {!isFocused && value === "" ? (
            <span className="text-[13px] text-slate-400 select-none flex-1 leading-none mt-[1px]">Search...</span>
          ) : (
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                // Simple auto-resize logic
                e.target.style.height = 'inherit';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Search..."
              rows={1}
              className="flex-1 bg-transparent border-none outline-none text-[13px] resize-none py-0 focus:ring-0 leading-relaxed"
              style={{
                minHeight: "20px",
                maxHeight: "200px"
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  setIsFocused(false);
                }
                if (e.key === "Escape") {
                  setIsFocused(false);
                }
              }}
            />
          )}

          <AnimatePresence>
            {value.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setValue("");
                  inputRef.current?.focus();
                }}
                className={cn(
                  "p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer",
                  isFocused ? "text-slate-900 dark:text-white" : "text-slate-400"
                )}
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </motion.button>
            )}

            {!isFocused && value === "" && (
              <motion.kbd
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="pointer-events-none inline-flex h-5 items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-500 select-none"
              >
                ⌘ K
              </motion.kbd>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile Navigation Sheet                                            */
/* ------------------------------------------------------------------ */
function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden cursor-pointer"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 dark:bg-slate-950">
        <SheetHeader className="border-b border-slate-100 dark:border-slate-800 px-5 py-4">
          <SheetTitle>
            <BrandLogo />
          </SheetTitle>
        </SheetHeader>

        <nav
          className="flex flex-col gap-0.5 p-3 overflow-y-auto"
          aria-label="Mobile navigation"
        >
          {/* Products */}
          <span className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Products
          </span>
          <MobileLink href="/products/ai-analysis" label="AI Analysis" />
          <MobileLink href="/products/predictive-models" label="Predictive Models" />
          <MobileLink href="/products/real-time-ticker" label="Real-time Ticker" />
          <MobileLink href="/products/watchlists" label="Watchlists" />

          {/* Solutions */}
          <span className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Solutions
          </span>
          <MobileLink href="/solutions/day-traders" label="For Day Traders" />
          <MobileLink href="/solutions/institutional" label="For Institutional Investors" />

          {/* Markets */}
          <span className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Markets
          </span>
          <MobileLink href="/dashboard/markets/stocks" label="Stocks" />
          <MobileLink href="/dashboard/markets/mutual-funds" label="Mutual Funds" />
          <MobileLink href="/dashboard/markets/commodities" label="Commodities" />
          <MobileLink href="/dashboard/markets/forex" label="Forex" />

          {/* Academy */}
          <span className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            General
          </span>
          <MobileLink label="Academy" />
        </nav>

        <div className="mt-auto border-t border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-2">
          <Button
            variant="ghost"
            className="w-full justify-center h-9 text-[13px] font-medium text-slate-700 dark:text-slate-300"
          >
            Log In
          </Button>
          <Button className="w-full justify-center h-9 text-[13px] font-medium bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
            Sign Up
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileLink({ href, label }: { href?: string; label: string }) {
  const className = "flex items-center justify-between rounded-md px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer";
  
  const content = (
    <>
      {label}
      <ChevronRight className="size-3 text-slate-400" />
    </>
  );

  if (!href) {
    return (
      <div className={className}>
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Navbar Export                                                  */
/* ------------------------------------------------------------------ */
export function Navbar() {
  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        {/* ---- Left: Brand ---- */}
        <BrandLogo />

        {/* ---- Center: Navigation Mega Menus ---- */}
        <NavigationMenu className="hidden lg:flex ml-8">
          <NavigationMenuList className="gap-0.5">
            {/* ── Products (2-Column Mega Menu) ── */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-[13px] font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer">
                Products
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-[460px] p-4">
                <div className="grid grid-cols-2 gap-1">
                  <MegaMenuItem
                    href="/products/ai-analysis"
                    icon={BrainCircuit}
                    title="AI Analysis"
                    description="RAG-powered market insights"
                  />
                  <MegaMenuItem
                    href="/products/predictive-models"
                    icon={LineChart}
                    title="Predictive Models"
                    description="LQM Beta forecasting"
                  />
                  <MegaMenuItem
                    href="/products/real-time-ticker"
                    icon={Radio}
                    title="Real-time Ticker"
                    description="Live streaming market data"
                  />
                  <MegaMenuItem
                    href="/products/watchlists"
                    icon={Star}
                    title="Watchlists"
                    description="Track your portfolios"
                  />
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* ── Solutions (Simple Dropdown) ── */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-[13px] font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer">
                Solutions
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-[220px] p-2">
                <div className="flex flex-col gap-0.5">
                  <DropdownItem
                    href="/solutions/day-traders"
                    icon={Users}
                    label="For Day Traders"
                  />
                  <DropdownItem
                    href="/solutions/institutional"
                    icon={Building2}
                    label="For Institutional Investors"
                  />
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* ── Markets (Simple Dropdown) ── */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-[13px] font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer">
                Markets
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-[220px] p-2">
                <div className="flex flex-col gap-0.5">
                  <span className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    MARKETS
                  </span>
                  <DropdownItem
                    href="/dashboard/markets/stocks"
                    icon={TrendingUp}
                    label="Stocks"
                    showChevron
                  />
                  <DropdownItem
                    href="/dashboard/markets/mutual-funds"
                    icon={CircleDollarSign}
                    label="Mutual Funds"
                    showChevron
                  />
                  <DropdownItem
                    href="/dashboard/markets/commodities"
                    icon={Globe}
                    label="Commodities"
                    showChevron
                  />
                  <DropdownItem
                    href="/dashboard/markets/forex"
                    icon={ArrowLeftRight}
                    label="Forex"
                    showChevron
                  />
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* ── Academy (Plain Text) ── */}
            <NavigationMenuItem>
              <NavigationMenuLink
                className={`${navigationMenuTriggerStyle()} cursor-pointer`}
              >
                <span className="text-[13px] font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                  Academy
                </span>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* ---- Spacer ---- */}
        <div className="flex-1" />

        {/* ---- Right: Search + Auth ---- */}
        <div className="flex items-center gap-4">
          <CommandKSearch />

          {/* Mobile search icon fallback */}
          <button
            className="inline-flex items-center justify-center size-8 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors md:hidden cursor-pointer"
            aria-label="Search"
          >
            <Search className="size-4" />
          </button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Desktop auth buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <Button
              id="login-button"
              variant="ghost"
              size="sm"
              className="text-[13px] font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer"
            >
              Log In
            </Button>
            <Button
              id="signup-button"
              size="sm"
              className="text-[13px] font-medium bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 cursor-pointer"
            >
              Sign Up
            </Button>
          </div>

          {/* Mobile hamburger */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
