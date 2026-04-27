"use client";

import { useRef } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calculator,
  TrendingUp,
  Scissors,
  PiggyBank,
  ArrowRightLeft,
  TrendingDown,
  Flame,
  Scale,
  PieChart,
  Ruler,
  Target
} from "lucide-react";

const tools = [
  { name: "ROI Calculator", icon: Calculator },
  { name: "CAGR", icon: TrendingUp },
  { name: "Deduction", icon: Scissors },
  { name: "SIP", icon: PiggyBank },
  { name: "X-Rate", icon: ArrowRightLeft },
  { name: "Drawdown", icon: TrendingDown },
  { name: "Inflation", icon: Flame },
  { name: "Leverage", icon: Scale },
  { name: "Margin", icon: PieChart },
  { name: "Pip Value", icon: Ruler },
  { name: "Pivot Point", icon: Target },
];

export function PopularTools() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 py-16 relative">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-bold text-foreground">Popular Tools</h2>
        
        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <button
            onClick={scrollLeft}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 hover:shadow-md"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={scrollRight}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 hover:shadow-md"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative w-full">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pt-8 pb-10 -mt-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tools.map((tool, idx) => (
            <div
              key={idx}
              className="snap-start shrink-0 w-72 h-64 bg-card border border-border rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer group transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] hover:-translate-y-3 hover:border-primary/20 hover:ring-2 hover:ring-primary/10 hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] dark:hover:border-border dark:hover:ring-0 dark:hover:shadow-black/50"
            >
              {/* Circular Graphic Enclosing Icon */}
              <div className="relative mb-6 flex items-center justify-center">
                {/* Rotating Dashed Outer Ring */}
                <div className="absolute -inset-3 rounded-full border-[2px] border-dashed border-muted-foreground/30 group-hover:border-primary/50 group-hover:rotate-[180deg] transition-all duration-700 ease-in-out" />
                
                {/* Inner Icon Background Container */}
                <div className="w-16 h-16 rounded-full bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center text-primary transition-colors duration-300">
                  <tool.icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
              </div>
              
              {/* Tool Title */}
              <span className="text-lg font-semibold text-foreground text-center tracking-tight">
                {tool.name}
              </span>
            </div>
          ))}
        </div>
        
        {/* Fade Out Gradients for Carousel edges (Optional) */}
        <div className="absolute top-0 bottom-10 left-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-10 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </section>
  );
}
