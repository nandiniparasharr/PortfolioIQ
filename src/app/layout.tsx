import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: {
    default: "PortfolioIQ — Portfolio Analytics",
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
    title: "PortfolioIQ — Portfolio Analytics",
    description:
      "Allocation, performance, risk and diversification analytics with transparent, documented methodology.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0c10" },
    { media: "(prefers-color-scheme: light)", color: "#f4f7fa" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
