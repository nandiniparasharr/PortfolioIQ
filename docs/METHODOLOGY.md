# Analytics Methodology

This document specifies every metric Portfolio Prism computes. All formulas are
implemented in `src/lib/analytics/statistics.ts` (primitives) and
`src/lib/analytics/engine.ts` (orchestration), and validated in the test suite.

Notation:

- $P_t$ — closing price on trading day $t$.
- $r_t = \dfrac{P_t}{P_{t-1}} - 1$ — simple daily return.
- $n$ — number of return observations in the analysis window.
- $w_i$ — weight of position $i$ (market value ÷ total market value).
- $\bar{x}$ — sample mean of series $x$.
- Annualization uses **252** trading days per year.

The analysis window is the intersection of available trading days across all
holdings and the benchmark, so every series is aligned on common dates.

---

## 1. Valuation & weights

$$
\text{MV}_i = q_i \cdot P^{\text{last}}_i, \qquad
V = \sum_i \text{MV}_i, \qquad
w_i = \frac{\text{MV}_i}{V}
$$

Unrealized P&L is computed only where a cost basis is supplied:

$$
\text{Unrealized}_i = \text{MV}_i - q_i \cdot P^{\text{cost}}_i,
\qquad
\text{Return}_i = \frac{\text{Unrealized}_i}{q_i \cdot P^{\text{cost}}_i}
$$

---

## 2. Allocation

For each dimension $d \in \{\text{sector}, \text{region}, \text{market cap}, \text{holding}\}$,
weights are the sum of position weights mapped to each category. Weights within a
dimension sum to 1 (a tested invariant).

---

## 3. Return & volatility

**Sample variance / standard deviation** (Bessel-corrected):

$$
s^2 = \frac{1}{n-1}\sum_{t=1}^{n}(x_t - \bar{x})^2,
\qquad s = \sqrt{s^2}
$$

**Annualized volatility:**

$$
\sigma_{\text{ann}} = s_{\text{daily}} \cdot \sqrt{252}
$$

**Geometric annualized return:**

$$
R_{\text{ann}} = \left(\prod_{t=1}^{n}(1 + r_t)\right)^{252/n} - 1
$$

**Cumulative return:**

$$
R_{\text{cum}} = \prod_{t=1}^{n}(1 + r_t) - 1
$$

The portfolio return series is the weighted sum of aligned asset returns using
**current weights** held constant:
$r^{p}_t = \sum_i w_i\, r^{i}_t$.

---

## 4. Risk-adjusted performance

Let $r^{f}_{\text{daily}} = r^{f}_{\text{annual}} / 252$ (default annual
risk-free rate **4.3%**) and $e_t = r_t - r^{f}_{\text{daily}}$.

**Sharpe ratio:**

$$
\text{Sharpe} = \frac{\bar{e}}{s_e}\sqrt{252}
$$

**Sortino ratio** (downside deviation over negative excess only):

$$
\text{DD} = \sqrt{\frac{1}{|\mathcal{D}|}\sum_{t\in\mathcal{D}} e_t^2},
\quad \mathcal{D} = \{t : e_t < 0\},
\qquad
\text{Sortino} = \frac{\bar{e}}{\text{DD}}\sqrt{252}
$$

---

## 5. Drawdown

With equity $E_t = \prod_{k \le t}(1 + r_k)$ and running peak
$M_t = \max_{k \le t} E_k$:

$$
\text{MaxDD} = \max_t \frac{M_t - E_t}{M_t}
$$

Reported as a positive fraction (e.g. 0.32 = a 32% peak-to-trough decline).

---

## 6. Beta

Against the benchmark return series $r^{m}$:

$$
\beta = \frac{\operatorname{Cov}(r^{p}, r^{m})}{\operatorname{Var}(r^{m})}
$$

> **Implementation note.** Portfolio and benchmark series must be aligned on the
> same trading days. Misaligning them by even one day collapses the shared-factor
> covariance and drives β toward zero — the engine therefore aligns all series on
> the common-date intersection before computing β.

---

## 7. Value at Risk & Expected Shortfall

Historical (non-parametric), one-day horizon. Let $L_t = -r_t$ be losses sorted
ascending, and confidence $\alpha$ (0.95, 0.99):

$$
\text{VaR}_\alpha = L_{\lceil \alpha n \rceil},
\qquad
\text{CVaR}_\alpha = \frac{1}{|T|}\sum_{t \in T} L_t,
\quad T = \{t : L_t \ge \text{VaR}_\alpha\}
$$

CVaR (Expected Shortfall) is always ≥ VaR (a tested invariant). Both are
reported as positive loss fractions.

---

## 8. Correlation & contribution

**Pearson correlation** of two return series:

$$
\rho_{ij} = \frac{\operatorname{Cov}(r^{i}, r^{j})}{s_i\, s_j}
$$

The correlation matrix is symmetric with a unit diagonal. **Average correlation**
is the mean of the distinct off-diagonal entries.

**Risk contribution** of position $i$ to portfolio variance:

$$
\text{RC}_i = \frac{w_i \operatorname{Cov}(r^{i}, r^{p})}{\operatorname{Var}(r^{p})},
\qquad \sum_i \text{RC}_i = 1
$$

**Return contribution** is each position's weighted annualized return normalized
to the portfolio total.

---

## 9. Concentration & diversification

**Herfindahl-Hirschman Index** and **effective holdings**:

$$
\text{HHI} = \sum_i w_i^2 \in [1/N,\, 1],
\qquad
N_{\text{eff}} = \frac{1}{\text{HHI}}
$$

**Top-5 concentration** is the summed weight of the five largest positions.

**Diversification score** (0–100) blends, with weights 0.40 / 0.25 / 0.20 / 0.15:

- effective holdings (rewarded up to ~20 names),
- sector breadth (toward 8 sectors),
- low average correlation,
- raw holdings count (toward ~15).

---

## 10. Composite scores

**Risk score** (0–100, higher = riskier) blends annualized volatility (0.35),
max drawdown (0.25), 95% VaR (0.25) and |beta| (0.15), each normalized to a
sensible ceiling.

**Health score** (0–100) blends risk-adjusted performance (Sharpe, 0.35),
diversification (0.30), drawdown containment (0.20) and moderate risk
(0.15), mapped to a letter grade:

| Grade | Health |
| ----- | ------ |
| A     | ≥ 85   |
| B     | ≥ 70   |
| C     | ≥ 55   |
| D     | ≥ 40   |
| F     | < 40   |

Scores are heuristics for at-a-glance comparison; the underlying metrics in
sections 1–9 are the rigorous, model-free outputs.

---

## Assumptions & limitations

- Constant current weights for time-series analytics (ex-post simplification).
- One-day, non-parametric VaR; not horizon-scaled.
- Single currency (USD), equity-focused.
- With the synthetic provider, data is realistic and reproducible but not live
  market data.
