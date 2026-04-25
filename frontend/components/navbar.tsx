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
  FileCode2,
  Webhook,
  FlaskConical,
} from "lucide-react";
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
      className="flex items-start gap-3 rounded-md p-3 hover:bg-slate-50 focus:bg-slate-50 transition-colors"
    >
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white">
        <Icon className="size-4 text-slate-600" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-semibold leading-tight text-slate-900">
          {title}
        </span>
        <span className="text-[11.5px] leading-snug text-slate-500">
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
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <NavigationMenuLink
      href={href}
      render={<Link href={href} />}
      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 transition-colors"
    >
      <Icon className="size-3.5 text-slate-400" />
      {label}
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
      <div className="flex items-center justify-center size-7 rounded-md bg-slate-900">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-4"
          aria-hidden="true"
        >
          <path
            d="M3 17L9 11L13 15L21 7"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 7H21V11"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {/* Wordmark */}
      <span className="text-[15px] font-bold tracking-tight text-slate-900">
        Cortif 
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Command-K Search Trigger                                           */
/* ------------------------------------------------------------------ */
function CommandKSearch() {
  return (
    <button
      id="search-command-k"
      className="hidden md:inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] text-slate-400 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-500 transition-all cursor-pointer"
      aria-label="Search (⌘K)"
    >
      <Search className="size-3.5" />
      <span>Search...</span>
      <kbd className="pointer-events-none ml-3 inline-flex h-5 items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 select-none">
        ⌘K
      </kbd>
    </button>
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
            className="lg:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="border-b border-slate-100 px-5 py-4">
          <SheetTitle>
            <BrandLogo />
          </SheetTitle>
        </SheetHeader>

        <nav
          className="flex flex-col gap-0.5 p-3 overflow-y-auto"
          aria-label="Mobile navigation"
        >
          {/* Products */}
          <span className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Products
          </span>
          <MobileLink href="/products/ai-analysis" label="AI Analysis" />
          <MobileLink href="/products/predictive-models" label="Predictive Models" />
          <MobileLink href="/products/real-time-ticker" label="Real-time Ticker" />
          <MobileLink href="/products/watchlists" label="Watchlists" />

          {/* Solutions */}
          <span className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Solutions
          </span>
          <MobileLink href="/solutions/day-traders" label="For Day Traders" />
          <MobileLink href="/solutions/institutional" label="For Institutional Investors" />

          {/* Developers */}
          <span className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Developers
          </span>
          <MobileLink href="/developers/api" label="API Documentation" />
          <MobileLink href="/developers/websocket" label="WebSocket Setup" />
          <MobileLink href="/developers/sandbox" label="Sandbox" />

          {/* Pricing */}
          <span className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            General
          </span>
          <MobileLink href="/pricing" label="Pricing" />
        </nav>

        <div className="mt-auto border-t border-slate-100 p-4 flex flex-col gap-2">
          <Button
            variant="ghost"
            className="w-full justify-center h-9 text-[13px] font-medium text-slate-700"
          >
            Log In
          </Button>
          <Button className="w-full justify-center h-9 text-[13px] font-medium bg-slate-900 text-white hover:bg-slate-800">
            Sign Up
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-md px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
    >
      {label}
      <ChevronRight className="size-3 text-slate-400" />
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
      className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        {/* ---- Left: Brand ---- */}
        <BrandLogo />

        {/* ---- Center: Navigation Mega Menus ---- */}
        <NavigationMenu className="hidden lg:flex ml-8">
          <NavigationMenuList className="gap-0.5">
            {/* ── Products (2-Column Mega Menu) ── */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-[13px] font-medium text-slate-700 hover:text-slate-900">
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
              <NavigationMenuTrigger className="text-[13px] font-medium text-slate-700 hover:text-slate-900">
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

            {/* ── Developers (Simple Dropdown) ── */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-[13px] font-medium text-slate-700 hover:text-slate-900">
                Developers
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-[220px] p-2">
                <div className="flex flex-col gap-0.5">
                  <DropdownItem
                    href="/developers/api"
                    icon={FileCode2}
                    label="API Documentation"
                  />
                  <DropdownItem
                    href="/developers/websocket"
                    icon={Webhook}
                    label="WebSocket Setup"
                  />
                  <DropdownItem
                    href="/developers/sandbox"
                    icon={FlaskConical}
                    label="Sandbox"
                  />
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* ── Pricing (Plain Link) ── */}
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/pricing"
                render={<Link href="/pricing" />}
                className={navigationMenuTriggerStyle()}
              >
                <span className="text-[13px] font-medium text-slate-700 hover:text-slate-900">
                  Pricing
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
            className="inline-flex items-center justify-center size-8 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors md:hidden"
            aria-label="Search"
          >
            <Search className="size-4" />
          </button>

          {/* Desktop auth buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <Button
              id="login-button"
              variant="ghost"
              size="sm"
              className="text-[13px] font-medium text-slate-700 hover:text-slate-900"
            >
              Log In
            </Button>
            <Button
              id="signup-button"
              size="sm"
              className="text-[13px] font-medium bg-slate-900 text-white hover:bg-slate-800"
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
