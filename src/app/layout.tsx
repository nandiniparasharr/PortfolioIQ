import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: {
    default: "PortfolioIQ — Institutional Portfolio Analytics",
    template: "%s · PortfolioIQ",
  },
  description:
    "Institutional-grade portfolio analytics: allocation, performance, risk, diversification and AI-assisted commentary. Built for rigorous, transparent portfolio analysis.",
  keywords: [
    "portfolio analytics",
    "risk analytics",
    "value at risk",
    "Sharpe ratio",
    "asset allocation",
    "quantitative finance",
  ],
  authors: [{ name: "PortfolioIQ" }],
  openGraph: {
    title: "PortfolioIQ — Institutional Portfolio Analytics",
    description:
      "Allocation, performance, risk and diversification analytics with transparent, documented methodology.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0c10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
