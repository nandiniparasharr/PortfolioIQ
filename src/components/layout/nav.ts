import {
  LayoutDashboard,
  Wallet,
  Activity,
  PieChart,
  ShieldAlert,
  Network,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

/** Primary navigation. Future modules (DCF, screener, factor models) slot in here. */
export const PRIMARY_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Executive analytics overview",
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: Wallet,
    description: "Holdings input & management",
  },
];

/** Dashboard section anchors, used for in-page navigation. */
export const DASHBOARD_SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "allocation", label: "Allocation", icon: PieChart },
  { id: "performance", label: "Performance", icon: Activity },
  { id: "risk", label: "Risk", icon: ShieldAlert },
  { id: "correlation", label: "Correlation", icon: Network },
];
