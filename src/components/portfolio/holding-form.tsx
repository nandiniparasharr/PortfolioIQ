"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { holdingFormSchema, type HoldingFormValues } from "@/lib/validation";
import { usePortfolioStore } from "@/store/portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TickerAutocomplete } from "./ticker-autocomplete";

/** Manual single-holding entry form with validation. */
export function HoldingForm() {
  const addHolding = usePortfolioStore((s) => s.addHolding);
  const {
    control,
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<HoldingFormValues>({
    resolver: zodResolver(holdingFormSchema),
    defaultValues: { ticker: "", quantity: undefined, purchasePrice: undefined, purchaseDate: "" } as Partial<HoldingFormValues> as HoldingFormValues,
  });

  const onSubmit = (values: HoldingFormValues) => {
    addHolding({
      ticker: values.ticker,
      quantity: values.quantity,
      purchasePrice: values.purchasePrice,
      purchaseDate: values.purchaseDate || undefined,
    });
    reset();
    setFocus("ticker");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ticker">Ticker</Label>
          <Controller
            control={control}
            name="ticker"
            render={({ field }) => (
              <TickerAutocomplete value={field.value ?? ""} onChange={field.onChange} />
            )}
          />
          {errors.ticker && (
            <p className="text-2xs text-negative">{errors.ticker.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="100"
            className="tabular"
            {...register("quantity")}
          />
          {errors.quantity && (
            <p className="text-2xs text-negative">{errors.quantity.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="purchasePrice">Cost per share</Label>
          <Input
            id="purchasePrice"
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="152.30"
            className="tabular"
            {...register("purchasePrice")}
          />
          {errors.purchasePrice && (
            <p className="text-2xs text-negative">{errors.purchasePrice.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="purchaseDate">Purchase date (optional)</Label>
          <Input id="purchaseDate" type="date" className="tabular" {...register("purchaseDate")} />
          {errors.purchaseDate && (
            <p className="text-2xs text-negative">{errors.purchaseDate.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        <Plus className="h-4 w-4" />
        Add holding
      </Button>
    </form>
  );
}
