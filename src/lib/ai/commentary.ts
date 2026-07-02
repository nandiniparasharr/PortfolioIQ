import "server-only";
import type { PortfolioAnalytics, PortfolioCommentary } from "@/types";
import { formatPercent, formatSignedPercent } from "@/lib/format";

/**
 * Hybrid AI commentary layer.
 *
 * Architecture: analytics are ALWAYS computed deterministically first. This
 * module only *interprets* those numbers. When an OpenAI-compatible endpoint
 * is configured, it phrases the already-computed figures into professional
 * prose; otherwise a deterministic template generator produces the same
 * structured commentary. The model is never asked to invent numbers — it is
 * given the computed analytics and constrained to interpretation only.
 */

function topSectors(a: PortfolioAnalytics, n = 2): string {
  return a.allocation.bySector
    .slice(0, n)
    .map((s) => `${s.label} (${formatPercent(s.weight, 1)})`)
    .join(" and ");
}

/** Deterministic, template-based commentary. */
export function deterministicCommentary(a: PortfolioAnalytics): PortfolioCommentary {
  const perf = a.performance;
  const div = a.diversification;
  const risk = a.risk;
  const executiveSummary = [
    `The portfolio comprises ${div.holdingsCount} position${div.holdingsCount === 1 ? "" : "s"} across ${div.sectorCount} sector${div.sectorCount === 1 ? "" : "s"}, with a composite health score of ${a.scores.health}/100.`,
    `On a trailing basis it has delivered an annualized return of ${formatSignedPercent(perf.annualizedReturn)} against annualized volatility of ${formatPercent(perf.annualizedVolatility)}, for a Sharpe ratio of ${perf.sharpeRatio.toFixed(2)}.`,
    `Exposure is led by ${topSectors(a)}, and the book carries a market beta of ${perf.beta.toFixed(2)}.`,
  ].join(" ");

  const riskCommentary = [
    `Realized annualized volatility stands at ${formatPercent(perf.annualizedVolatility)} with a maximum peak-to-trough drawdown of ${formatPercent(perf.maxDrawdown)}.`,
    `On a one-day horizon, historical Value at Risk (95%) is ${formatPercent(risk.valueAtRisk95)} and Expected Shortfall is ${formatPercent(risk.conditionalVaR95)}, implying a loss beyond VaR of that magnitude in the tail.`,
    `The portfolio's beta of ${perf.beta.toFixed(2)} indicates ${perf.beta > 1.1 ? "above-market" : perf.beta < 0.9 ? "below-market" : "broadly market-like"} sensitivity to broad equity moves.`,
  ].join(" ");

  const diversificationCommentary = [
    `The Herfindahl-Hirschman Index of ${div.hhi.toFixed(3)} corresponds to ${div.effectiveHoldings.toFixed(1)} effective holdings.`,
    `The five largest positions represent ${formatPercent(div.concentrationTop5)} of capital, and the average pairwise correlation across holdings is ${risk.averageCorrelation.toFixed(2)}.`,
    div.score >= 65
      ? "Diversification is healthy, spreading idiosyncratic risk across multiple uncorrelated drivers."
      : "Diversification is limited; returns are concentrated in a small number of correlated drivers.",
  ].join(" ");

  const strengths: string[] = [];
  if (perf.sharpeRatio >= 1) strengths.push(`Attractive risk-adjusted returns (Sharpe ${perf.sharpeRatio.toFixed(2)}).`);
  if (div.score >= 65) strengths.push("Well-diversified across positions and sectors.");
  if (perf.maxDrawdown <= 0.2) strengths.push(`Contained drawdowns (max ${formatPercent(perf.maxDrawdown)}).`);
  if (perf.annualizedReturn >= 0.1) strengths.push(`Strong absolute performance (${formatSignedPercent(perf.annualizedReturn)} annualized).`);
  if (strengths.length === 0) strengths.push("Transparent, fully-attributed risk and return profile.");

  const weaknesses: string[] = [];
  if (div.concentrationTop5 > 0.6) weaknesses.push(`Concentration risk: top 5 holdings are ${formatPercent(div.concentrationTop5)} of the book.`);
  if (risk.averageCorrelation > 0.6) weaknesses.push(`High average correlation (${risk.averageCorrelation.toFixed(2)}) limits diversification benefit.`);
  if (perf.annualizedVolatility > 0.25) weaknesses.push(`Elevated volatility (${formatPercent(perf.annualizedVolatility)} annualized).`);
  if (perf.sharpeRatio < 0.5) weaknesses.push(`Weak risk-adjusted returns (Sharpe ${perf.sharpeRatio.toFixed(2)}).`);
  if (div.sectorCount <= 2 && div.holdingsCount > 1) weaknesses.push(`Narrow sector breadth (${div.sectorCount} sectors).`);
  if (weaknesses.length === 0) weaknesses.push("No material structural weaknesses detected in the current window.");

  const recommendations: PortfolioCommentary["recommendations"] = [];
  if (div.concentrationTop5 > 0.6) {
    recommendations.push({
      title: "Reduce single-name concentration",
      detail: `Trim the largest positions to bring top-5 weight below 50% and raise the effective number of holdings above ${Math.ceil(div.effectiveHoldings + 2)}.`,
      priority: 1,
    });
  }
  if (risk.averageCorrelation > 0.6 || div.sectorCount <= 3) {
    recommendations.push({
      title: "Broaden diversifying exposures",
      detail: "Add positions in under-represented sectors or lower-correlation assets to reduce common-factor risk.",
      priority: recommendations.length === 0 ? 1 : 2,
    });
  }
  if (perf.maxDrawdown > 0.3 || perf.annualizedVolatility > 0.28) {
    recommendations.push({
      title: "Calibrate portfolio risk",
      detail: `Consider a modest allocation to defensive or low-beta assets to temper the ${formatPercent(perf.maxDrawdown)} drawdown profile.`,
      priority: recommendations.length === 0 ? 1 : (Math.min(recommendations.length + 1, 3) as 1 | 2 | 3),
    });
  }
  while (recommendations.length < 3) {
    const fillers = [
      {
        title: "Establish a rebalancing policy",
        detail: "Define target weights and rebalance on a quarterly or threshold basis to control drift and lock in diversification.",
      },
      {
        title: "Monitor factor and rate sensitivity",
        detail: `With a beta of ${perf.beta.toFixed(2)}, track sensitivity to broad market and rate regimes and stress-test under adverse scenarios.`,
      },
      {
        title: "Review cost-basis and tax lots",
        detail: "Use unrealized gain/loss attribution to harvest losses and manage realized-gain exposure efficiently.",
      },
    ];
    const next = fillers[recommendations.length % fillers.length]!;
    recommendations.push({
      title: next.title,
      detail: next.detail,
      priority: Math.min(recommendations.length + 1, 3) as 1 | 2 | 3,
    });
  }

  return {
    executiveSummary,
    riskCommentary,
    diversificationCommentary,
    strengths,
    weaknesses,
    recommendations: recommendations.slice(0, 3),
    generatedBy: "deterministic",
  };
}

/** Build the compact analytics payload handed to the LLM. */
function analyticsDigest(a: PortfolioAnalytics): Record<string, unknown> {
  return {
    healthScore: a.scores.health,
    riskScore: a.scores.risk,
    diversificationScore: a.scores.diversification,
    totalValue: Math.round(a.totalValue),
    holdings: a.diversification.holdingsCount,
    sectors: a.diversification.sectorCount,
    annualizedReturn: a.performance.annualizedReturn,
    annualizedVolatility: a.performance.annualizedVolatility,
    sharpe: a.performance.sharpeRatio,
    sortino: a.performance.sortinoRatio,
    maxDrawdown: a.performance.maxDrawdown,
    beta: a.performance.beta,
    var95: a.risk.valueAtRisk95,
    cvar95: a.risk.conditionalVaR95,
    hhi: a.diversification.hhi,
    effectiveHoldings: a.diversification.effectiveHoldings,
    top5Concentration: a.diversification.concentrationTop5,
    averageCorrelation: a.risk.averageCorrelation,
    topSectors: a.allocation.bySector.slice(0, 5),
    topHoldings: a.allocation.byHolding.slice(0, 5),
  };
}

const SYSTEM_PROMPT = `You are a senior portfolio strategist.
You will receive a JSON object of pre-computed portfolio analytics.
Write concise, professional commentary.
Rules:
- NEVER invent or alter numbers. Use only the figures provided.
- Reference specific metrics where relevant.
- No filler, no hedging, no generic AI phrasing ("In conclusion", "It's important to note").
- Output STRICT JSON matching the requested schema. No markdown.`;

interface LlmConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

function llmConfig(): LlmConfig | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  };
}

/** Generate commentary, preferring the LLM when configured. */
export async function generateCommentary(
  a: PortfolioAnalytics,
): Promise<PortfolioCommentary> {
  const config = llmConfig();
  if (!config) return deterministicCommentary(a);

  try {
    const userPrompt = `Portfolio analytics (JSON):\n${JSON.stringify(
      analyticsDigest(a),
    )}\n\nReturn STRICT JSON with keys: executiveSummary (string), riskCommentary (string), diversificationCommentary (string), strengths (string[]), weaknesses (string[]), recommendations (array of {title, detail, priority:1|2|3}, exactly 3, priority 1 = most important).`;

    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) return deterministicCommentary(a);
    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (typeof content !== "string") return deterministicCommentary(a);
    const parsed = JSON.parse(content);

    // Defensive validation: fall back if the model returned a bad shape.
    if (
      typeof parsed.executiveSummary !== "string" ||
      !Array.isArray(parsed.recommendations)
    ) {
      return deterministicCommentary(a);
    }
    return {
      executiveSummary: parsed.executiveSummary,
      riskCommentary: parsed.riskCommentary ?? "",
      diversificationCommentary: parsed.diversificationCommentary ?? "",
      strengths: parsed.strengths ?? [],
      weaknesses: parsed.weaknesses ?? [],
      recommendations: parsed.recommendations.slice(0, 3),
      generatedBy: "llm",
    };
  } catch {
    return deterministicCommentary(a);
  }
}
