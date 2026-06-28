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
  /** When true, the item is locked until at least one holding exists. */
  requiresPortfolio?: boolean;
}

/** Primary navigation. */
export const PRIMARY_NAV: NavItem[] = [
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: Wallet,
    description: "Holdings input & management",
  },
  {
    label: "Analytics",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Executive analytics overview",
    requiresPortfolio: true,
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
