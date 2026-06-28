"use client";

import * as React from "react";
import Link from "next/link";
import { BarChart3, Sparkles, Upload, PencilLine, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HoldingForm } from "@/components/portfolio/holding-form";
import { CsvUpload } from "@/components/portfolio/csv-upload";
import { HoldingsEditor } from "@/components/portfolio/holdings-editor";
import { usePortfolioStore } from "@/store/portfolio";
import { SAMPLE_PORTFOLIO } from "@/lib/sample-portfolio";

export default function PortfolioPage() {
  const holdings = usePortfolioStore((s) => s.holdings);
  const addHoldings = usePortfolioStore((s) => s.addHoldings);
  const clear = usePortfolioStore((s) => s.clear);

  // Preselect the entry method from the landing page (?method=upload|manual).
  const [tab, setTab] = React.useState("upload");
  React.useEffect(() => {
    const method = new URLSearchParams(window.location.search).get("method");
    if (method === "manual" || method === "upload") setTab(method);
  }, []);

  const loadSample = () => {
    clear();
    addHoldings(SAMPLE_PORTFOLIO);
  };

  const hasHoldings = holdings.length > 0;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 grid-texture" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-2xs font-semibold uppercase tracking-wider text-primary">
              Portfolio Builder
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Build your portfolio</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Upload a file or add positions by hand. Everything stays in your
              browser for this session — nothing is uploaded or stored.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadSample}>
              <Sparkles className="h-3.5 w-3.5" />
              Load sample
            </Button>
            <Button asChild size="sm" disabled={!hasHoldings}>
              <Link href={hasHoldings ? "/dashboard" : "#"} aria-disabled={!hasHoldings}>
                <BarChart3 className="h-3.5 w-3.5" />
                Analyze portfolio
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Add holdings</CardTitle>
                <CardDescription>Choose how you&apos;d like to enter positions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList className="mb-5 w-full">
                    <TabsTrigger value="upload" className="flex-1 gap-1.5">
                      <Upload className="h-3.5 w-3.5" />
                      Upload file
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="flex-1 gap-1.5">
                      <PencilLine className="h-3.5 w-3.5" />
                      Add manually
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload">
                    <CsvUpload />
                  </TabsContent>
                  <TabsContent value="manual">
                    <HoldingForm />
                  </TabsContent>
                </Tabs>

                <div className="mt-5 flex items-start gap-2 rounded-lg border border-border bg-surface-muted/60 p-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-2xs leading-relaxed text-muted-foreground">
                    Ticker, quantity and cost per share are required. Purchase date
                    is optional and used for cost-basis context.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="glass">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Your holdings</CardTitle>
                  <CardDescription>Edit quantities and cost basis inline, or remove positions.</CardDescription>
                </div>
                {hasHoldings && (
                  <span className="rounded-md bg-primary/15 px-2 py-1 text-2xs font-medium text-primary">
                    {holdings.length} position{holdings.length === 1 ? "" : "s"}
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <HoldingsEditor />
                {hasHoldings && (
                  <div className="mt-5 flex justify-end">
                    <Button asChild>
                      <Link href="/dashboard">
                        <BarChart3 className="h-4 w-4" />
                        Analyze {holdings.length} holding{holdings.length === 1 ? "" : "s"}
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
