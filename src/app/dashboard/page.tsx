import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Executive portfolio analytics: allocation, performance, risk, diversification and AI commentary.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
