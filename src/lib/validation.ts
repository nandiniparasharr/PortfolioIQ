import { z } from "zod";

/** Validation schema for a single manually-entered holding. */
export const holdingFormSchema = z.object({
  ticker: z
    .string()
    .trim()
    .min(1, "Ticker is required")
    .max(12, "Ticker is too long")
    .regex(/^[A-Za-z][A-Za-z0-9.\-]*$/, "Enter a valid ticker symbol")
    .transform((v) => v.toUpperCase()),
  quantity: z.coerce
    .number({ invalid_type_error: "Quantity must be a number" })
    .positive("Quantity must be greater than zero")
    .finite(),
  purchasePrice: z.coerce
    .number({ invalid_type_error: "Cost per share is required" })
    .positive("Cost per share must be greater than zero")
    .finite(),
  purchaseDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type HoldingFormValues = z.infer<typeof holdingFormSchema>;

/** Schema for the API request payload (an array of holdings). */
export const analyzeRequestSchema = z.object({
  holdings: z
    .array(
      z.object({
        id: z.string(),
        ticker: z.string().min(1).transform((v) => v.toUpperCase()),
        quantity: z.number().positive(),
        purchasePrice: z.number().positive().optional(),
        purchaseDate: z.string().optional(),
      }),
    )
    .min(1, "At least one holding is required")
    .max(100, "Portfolios are limited to 100 holdings"),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
