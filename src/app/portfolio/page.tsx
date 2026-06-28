"use client";

import Link from "next/link";
import { BarChart3, Sparkles } from "lucide-react";
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

  const loadSample = () => {
    clear();
    addHoldings(SAMPLE_PORTFOLIO);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Portfolio Input</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add positions manually or import a CSV. Data stays in your browser for this session.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadSample}>
            <Sparkles className="h-3.5 w-3.5" />
            Load sample
          </Button>
          <Button asChild size="sm" disabled={holdings.length === 0}>
            <Link
              href={holdings.length === 0 ? "#" : "/dashboard"}
              aria-disabled={holdings.length === 0}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Analyze portfolio
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Add holdings</CardTitle>
              <CardDescription>Manual entry or CSV import.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="manual">
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="manual" className="flex-1">Manual</TabsTrigger>
                  <TabsTrigger value="csv" className="flex-1">CSV Import</TabsTrigger>
                </TabsList>
                <TabsContent value="manual">
                  <HoldingForm />
                </TabsContent>
                <TabsContent value="csv">
                  <CsvUpload />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Holdings</CardTitle>
              <CardDescription>
                Edit quantities and cost basis inline, or remove positions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HoldingsEditor />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
