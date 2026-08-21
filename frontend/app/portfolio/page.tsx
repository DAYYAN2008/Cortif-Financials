import { PortfolioPageContent } from "@/components/dashboard/portfolio-content";

export const metadata = {
  title: "Portfolio Assets — Cortif",
  description:
    "Manage your current holdings, track asset performance, and monitor your portfolio allocation in real time.",
};

export default function PortfolioPage() {
  return <PortfolioPageContent baseCurrency="USD" />;
}
