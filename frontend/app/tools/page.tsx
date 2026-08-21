import Link from "next/link";
import { 
  Calculator, 
  TrendingUp, 
  PiggyBank, 
  Scissors, 
  ShieldAlert, 
  TrendingDown,
  ArrowRight
} from "lucide-react";

const toolsList = [
  {
    id: "roi",
    name: "ROI Calculator",
    description: "Calculate the Return on Investment and absolute profit/loss for your trades.",
    icon: Calculator,
    href: "/tools/roi",
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-500/10 dark:bg-blue-500/20"
  },
  {
    id: "cagr",
    name: "CAGR Calculator",
    description: "Determine the Compound Annual Growth Rate over a specific duration.",
    icon: TrendingUp,
    href: "/tools/cagr",
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20"
  },
  {
    id: "sip",
    name: "SIP Auto-Invest",
    description: "Project your wealth growth through Systematic Investment Plans over time.",
    icon: PiggyBank,
    href: "/tools/sip",
    color: "text-purple-500 dark:text-purple-400",
    bg: "bg-purple-500/10 dark:bg-purple-500/20"
  },
  {
    id: "deduction",
    name: "Tax Deduction",
    description: "Estimate your tax liabilities and potential deductions for the fiscal year.",
    icon: Scissors,
    href: "/tools/tax",
    color: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-500/10 dark:bg-rose-500/20"
  },
  {
    id: "risk",
    name: "Position Risk Manager",
    description: "Calculate optimal position sizing based on your risk tolerance and stop-loss.",
    icon: ShieldAlert,
    href: "/tools/risk",
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500/10 dark:bg-amber-500/20"
  },
  {
    id: "average",
    name: "Average Down",
    description: "Calculate your new break-even price when adding to a losing position.",
    icon: TrendingDown,
    href: "/tools/average-down",
    color: "text-cyan-500 dark:text-cyan-400",
    bg: "bg-cyan-500/10 dark:bg-cyan-500/20"
  }
];

export default function ToolsDirectoryPage() {
  return (
    <div className="flex flex-col space-y-8 max-w-[1400px] mx-auto p-4 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Financial Tools
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
          Select a tool from our suite of financial calculators and risk managers designed to help you analyze trades and investments.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolsList.map((tool) => (
          <Link 
            key={tool.id} 
            href={tool.href}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 dark:border-slate-800/60 dark:bg-slate-900/50 dark:hover:border-slate-700/80 dark:hover:shadow-black/40"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center justify-center size-12 rounded-xl ${tool.bg} ${tool.color} transition-transform duration-300 group-hover:scale-110`}>
                <tool.icon className="size-6" strokeWidth={1.5} />
              </div>
              <ArrowRight className="size-5 text-slate-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-slate-500 dark:text-slate-700 dark:group-hover:text-slate-400" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1.5">
                {tool.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {tool.description}
              </p>
            </div>
            
            {/* Ambient Background Glow on Hover */}
            <div className={`absolute -right-20 -top-20 size-40 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-20 ${tool.bg}`} />
          </Link>
        ))}
      </div>
    </div>
  );
}
