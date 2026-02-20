Product Requirements Document (PRD)

Project: Deriverse Trading Analytics Dashboard & Journal
Author: (Prepared for) Ridwanullahi / Adam
Purpose: Deliver a world-class, full-stack, on-chain trading analytics dashboard and journal for Deriverse traders that is accurate, secure, highly usable and demonstrably innovative. The product is designed to win the Deriverse hackathon by maximising comprehensiveness, accuracy, clarity, innovation, code quality and security.

1. Executive summary

Build a non-custodial, responsive web application that ingests on-chain Deriverse trades and presents professional analytics and a journal. The app combines required metrics with advanced features such as AI insights, risk adjusted metrics, scenario simulation, and community benchmarking. All calculations derive from verifiable on-chain events. The product is solo-buildable by an experienced full-stack Web3 developer using standard tools and SDKs.

Key outcomes

Accurate, auditable PnL and trade metrics computed from Solana on-chain data.

A trading journal that links qualitative notes to quantitative outcomes.

AI assistant for natural language queries and automated trade analysis.

Risk metrics and scenario simulator to demonstrate trader skill and robustness.

Clean, accessible UI with downloadable exports and mobile responsiveness.

Success criteria (how judges will evaluate)

All requested features are present and function correctly.

Analytics calculations are auditable and match on-chain events.

UI is clear, professional and mobile friendly.

Innovative extras are implemented and demonstrably useful.

Code is structured, documented and uses security best practices.

2. Objectives and scope

Primary objectives

Provide an accurate and auditable analytics suite built on Deriverse on-chain trades.

Provide a professional trading journal connecting trade data to trader reasoning.

Add high impact innovations: AI Q&A, risk adjusted metrics, scenario simulator, community benchmarks and gamified milestones.

In scope (MVP)

Wallet connection and user onboarding (read only).

On-chain trade ingestion and reconciliation.

Core analytics: total PnL, equity curve, drawdown, win rate, trade counts, average win/loss, largest gain/loss, average duration, long/short ratio, time-based metrics, fee breakdown and order-type performance.

Trade history table with annotation capability.

Symbol filters and date range selectors.

Export CSV and PNG of charts.

Basic responsive UI and deployment to a public URL.

GitHub repository and demonstration video for submission.

Out of scope for MVP but planned as stretch

Full social features with persistent public leaderboards requiring opt in.

Auto-trade execution or custodial features.

On-chain smart contract deployment by our app.

Complex third-party exchange connectors beyond Deriverse.

3. Target users and personas

Primary user: Active on-chain trader on Deriverse

Tech savvy, trades spot, perpetual and options. Wants auditable analytics and strategy improvement.

Secondary user: Aspiring trader

Wants learning tools, AI insights and journal reminders.

Tertiary user: Quant analyst

Wants raw export and risk metrics for further analysis.

Persona examples

“Pro Paolo” — frequent trader, cares about drawdown control and Sharpe ratio.

“Learner Lara” — journals trades and requests plain language summaries.

4. Key user journeys (flows)

Connect wallet flow

User clicks Connect Wallet, signs a challenge message, app links wallet address to user profile.

Ingest and reconcile trades

After connection, backend pulls on-chain Deriverse transactions for that wallet, parses trades, computes metrics and populates the dashboard.

Review performance

User sees top-level KPIs, equity curve and drawdown, filters by symbol and timeframe, opens trade table.

Annotate a trade

User selects a trade, writes a note, tags the trade by strategy, and saves. Annotation is stored encrypted per user.

Ask AI a question

User opens AI assistant, types “Which strategy has the highest expectancy?” and receives a chart and concise explanation.

Run scenario simulation

User opens simulator, changes trade size multiplier or stop loss rules and inspects the recomputed equity curve.

Export / share

User exports CSV, downloads PNGs and records a short shareable performance summary.

5. Features list — detailed
5.1 Core analytics (MVP)

For each item include a brief acceptance criterion.

Total PnL and equity curve

Acceptance: Equity curve plotted per selected timeframe and reconciles to summed PnL of parsed trades.

Drawdown visualization (max drawdown, drawdown periods)

Acceptance: Max drawdown shows absolute and percentage values and drawdown periods are highlighted on the equity chart.

Win rate and trade count

Acceptance: Win rate = number of trades with PnL > 0 divided by total closed trades; trade count matches on-chain count.

Average win / average loss; largest gain/loss

Acceptance: Numeric values and histogram of trade PnL.

Average trade duration

Acceptance: Mean duration computed as average of (close_time - open_time) for all closed trades.

Long / short ratio and directional bias tracking

Acceptance: Directional metrics computed from trade side metadata.

Fee composition and cumulative fees

Acceptance: Fees broken down by maker/taker and by market type, cumulative fees shown as time series.

Order type performance

Acceptance: Performance segmented by order type (market, limit) where available.

Symbol filtering and date range selection

Acceptance: Filters apply to all charts and tables.

Time-based metrics (session and time of day)

Acceptance: Heatmap and bar charts showing PnL distribution by hour and by user-defined sessions.

Trade history table with annotation and sorting

Acceptance: Table includes timestamp, symbol, side, size, price, fees, PnL, duration, tags and note field.

5.2 Journal and annotation features

Add notes to each trade, add strategy tags, mark trade as reviewed.

Aggregate journal analytics by tag.
Acceptance: Tag filters and tag-based PnL comparison charts.

5.3 Advanced analytics and innovation

Risk adjusted metrics: Sharpe ratio, Sortino ratio, volatility, max drawdown to show risk adjusted returns.

Acceptance: Sharpe and Sortino computed with standard formulas and documented assumptions about risk-free rate and return frequency.

AI assistant for natural language queries and automated trade analysis

Acceptance: Natural language queries return a chart and a short explanation with references to the data used.

Scenario simulator / what-if engine

Acceptance: Users can modify scalar parameters, rerun calculations and visualise hypothetical equity curves.

Community benchmarks (anonymised)

Acceptance: Benchmarks display group medians and percentiles while protecting identity.

Gamification and achievements

Acceptance: Badges and milestone progress in profile page.

5.4 Admin and utility features

Export to CSV, download chart PNGs, and export journal as JSON.

Settings for privacy, risk-free rate, and default timezone.

Help / documentation pages and demo mode with sample dataset.

6. Functional requirements — computations and definitions

Provide deterministic formulas and pseudocode for the most load-bearing metrics. Ensure auditable reproducibility.

Note: All time series are computed at daily frequency by default and allow higher resolution when requested.

6.1 Trade object model (canonical)
Trade {
  id: string  // unique identifier derived from tx signature + log index
  wallet_address: string
  market: string   // e.g. DERIV/BTC-PERP
  symbol: string
  side: 'long' | 'short'
  order_type: 'market' | 'limit' | 'other'
  size: float
  entry_price: float
  exit_price: float
  entry_time: ISO8601
  exit_time: ISO8601
  pnl: float  // realised PnL in base currency or USD
  fees: float
  fees_breakdown: { maker: float, taker: float, other: float }
  tags: [string]
  notes: string encrypted
  metadata: {...}
}

6.2 Total PnL

Definition: Sum of pnl of closed trades within filter.

Pseudocode:

total_pnl = sum(trade.pnl for trade in trades_filtered)

6.3 Equity curve and drawdown

Build daily equity series by cumulative sum of PnL plus initial capital (optional).

Max drawdown computed by scanning equity series:

For each t compute peak = max(equity[0..t])

drawdown[t] = (equity[t] - peak) / peak

max_drawdown = min(drawdown) // negative value

Output absolute and percentage.

6.4 Win rate and expectancy

win_rate = count(trade where pnl > 0) / count(closed trades)

average_win = mean(pnl where pnl > 0)

average_loss = mean(pnl where pnl < 0)

expectancy = (win_rate * average_win) - ((1 - win_rate) * abs(average_loss))

6.5 Average trade duration

duration per trade = exit_time - entry_time in minutes/hours

average = mean(duration for closed trades)

6.6 Sharpe ratio (simplified)

Compute periodic returns from equity series.

Sharpe = (mean(returns) - rf_periodic) / std(returns)

Document rf_periodic assumptions (e.g. annualised risk free 0.01 converted to periodic).

6.7 Sortino ratio

Sortino = (mean(returns) - rf_periodic) / std(negative_returns)

6.8 Fee composition

fee_total = sum(trade.fees)

fee_by_type calculated from fees_breakdown aggregated across trades.

6.9 Time-of-day metrics

Group trades by hour of day based on exit_time timezone setting and sum pnl per hour.

All formulas must be included in the repo README and inlined near the calculation code for transparency.

7. Non functional requirements

Accuracy: Calculations must reconcile with on-chain data to within zero tolerance for integer fields and to accepted floating point precision for derived fields. Provide unit tests against known sample data.

Performance: Dashboard initial load for a user with up to 10k parsed trades should render summary KPIs within 2 seconds on production hardware. (Implementation note: implement caching.)

Scalability: Backend must support parallel processing of multiple users. Pipeline should be able to reprocess an individual wallet incrementally.

Security: No private keys stored. Notes encrypted at rest. All endpoints authenticated and rate limited.

Privacy: Journal notes are private by default; community benchmarks are opt in and fully anonymised.

Observability: Monitoring and logging for ingestion pipeline, calculated metrics and LLM query consumption.

Accessibility: WCAG AA compliant UI, keyboard navigable tables and charts with tooltips.

8. Technical architecture

High level components

Frontend: React + TypeScript, Next.js for server side rendering, Tailwind CSS for styles. Charting via Recharts or D3 for custom visualisations.

Wallet integration: Solana wallet adapter (Phantom, Solflare). Authentication via signed challenge to associate wallet address. No custodial keys.

Backend API: Node.js + TypeScript serverless functions (Vercel or AWS Lambda) or small Node/Express app.

Data pipeline: Worker service that fetches on-chain transactions using Solana RPC and/or Deriverse SDK. Normalises transactions into Trade objects and stores in DB.

Database: Supabase (Postgres) or managed Postgres. Use encryption for sensitive fields. Use Timescale or partitioning where needed for performance.

Cache layer: Redis for computed aggregates and query caching.

AI: LLM orchestration service to call GPT or other model provider. Backend composes prompts with summarised trade stats and recent chart snapshots. Controls for cost and rate limiting.

Monitoring: Sentry for errors, Prometheus + Grafana for metrics or hosted alternatives.

CI/CD: GitHub Actions for linting, tests, build and deploy.

Sequence of ingestion

User connects wallet.

Backend worker checks last processed slot for wallet.

Worker fetches new Deriverse transactions using transaction signature scanning and event log parsing.

Parse and map logs to Trade objects.

Persist trades and recompute affected aggregates. Invalidate caches.

Frontend requests updated aggregates.

Security design points

Use signed challenge messages for authentication.

Encrypt notes with server side key derivation using user wallet address as salt; consider client side encryption for maximum privacy.

Apply standard OWASP practices: input validation, parameterised queries, CSP headers.

Limit LLM prompt context size and never pass raw private notes to third party without explicit permission.

9. Data model and storage design

Primary tables

users: wallet_address, preferences, notification settings.

trades: trade canonical model, indexed by wallet_address and close_time.

aggregates: precomputed daily or time bucketed aggregates for fast charting.

tags, notes: encrypted or access controlled.

audit_log: ingestion runs, tx signatures processed, reconciliation results.

Indexing and partitions

Index trades on wallet_address + close_time.

Partition by month or by wallet if volume warranted.

Backfill and reprocessing

Provide a reprocess endpoint accepts wallet and slot range. Worker replays and reconciles using deterministic mapping. Log changes.

10. API contract (examples)
Authentication

POST /api/auth/challenge -> body: { wallet_address } -> returns challenge string

POST /api/auth/verify -> body: { wallet_address, signature } -> returns JWT session token

Fetch summaries

GET /api/v1/summary?wallet=<address>&from=YYYY-MM-DD&to=YYYY-MM-DD

Response: top KPIs, equity points preview, drawdown summary, risk metrics.

Fetch trades

GET /api/v1/trades?wallet=<address>&symbol=&limit=&offset=

Response: paginated trade objects.

Add annotation

POST /api/v1/trades/{tradeId}/note -> body: { note, tags } (note encrypted at rest)

Run scenario

POST /api/v1/simulate -> body: { wallet, multiplier, stop_loss_pct, start_date, end_date } -> returns recalculated equity series

AI Query

POST /api/v1/ai/query -> body: { wallet, query_text, context_options } -> returns { answer_text, charts, tokens_used }

Rate limits and quotas must be enforced and documented.

11. AI assistant design

Capabilities

Natural language Q&A about historical performance.

Automated trade annotations: given a trade, generate a short commentary.

Trend and anomaly detection suggestions.

Safety and privacy

Limit context: only use aggregated data or per-trade data with explicit user consent.

Do not send raw journal notes to the LLM unless user explicitly permits.

Cache LLM responses for repeat queries and account for token cost in telemetry.

Prompt engineering patterns (examples to store in repo)

System prompt: “You are a trading analytics assistant. Use only the provided summary statistics and time series. Provide short succinct answers and reference which metric you used.”

Input payload: { equity_series, top_stats, recent_trades_sample }

12. UX and UI design guidelines

Visual language

Clean, minimal, professional dashboard; emphasise readability and clarity.

Use a neutral palette and high contrast for charts and tooltips.

Fonts: use a legible sans serif at accessible sizes.

Key screens

Landing / Connect Wallet

Overview dashboard with top KPIs and equity chart

Detailed analytics page with tabs (Performance, Time-of-day, Fees, Orders)

Trade table with annotation modal

Journal and tags management

AI assistant modal

Simulator modal

Settings and export

Accessibility

Keyboard navigation for the table and chart tooltips.

Colour blind friendly palettes for charts.

ARIA labels where required.

Wireframe deliverables

Create 6 key screen wireframes as PNGs/GIFs for the hackathon submission.

Demo script

90 second narrative: connect wallet, show equity curve and drawdown, annotate two trades, ask AI a question, run a quick scenario and export CSV.

13. Testing strategy and quality assurance

Automated tests

Unit tests for metric calculations (edge cases included).

Integration tests for API endpoints with sample chain data.

End to end tests for essential flows (connect wallet, ingest, view dashboard).

Acceptance tests (sample)

For a provided sample dataset, computed equity curve must match reference CSV within tolerance.

Reconciliation test: reprocessing a slot range must be idempotent.

Manual QA

Usability testing on desktop and mobile devices.

Security review for storage of notes, encryption, and authentication flows.

Code quality

TypeScript with strict mode.

ESLint and Prettier config.

Documented functions and public interfaces.

14. Security checklist (must pass before submission)

Wallet authentication uses challenge token sign and signature verification.

No secret keys committed to repo.

Notes encryption at rest and in transit.

Input sanitisation on all endpoints.

Rate limiting and abuse detection for AI endpoints.

Dependency audit and use only well maintained libraries.

CORS locked to deployment domain for production.

Documented threat model and mitigations in README.

15. Deliverables for hackathon submission

Minimum deliverables

Public GitHub repository with working code, README and instructions to run locally.

Live deployed demo URL and a short demo video (90 to 180 seconds) highlighting features.

Short README section explicitly listing which hackathon requirements are implemented and where to find them in code.

Social media link (Twitter/X) linked on the submission page.

Recommended extras to impress judges

GIFs showing key interactions.

Unit test coverage badge.

Documentation of metric formulas and verification steps.

Exported sample dataset and a one page technical appendix explaining how on-chain mapping was done.

Submission checklist

 GitHub link public and contains README and license.

 Live demo deployed and accessible.

 Demo video uploaded and linked.

 All required metrics implemented and easy to find in UI.

 Security checklist documented.

16. Project governance and code organisation

Suggested repo structure

/apps/frontend  // Next.js React app
/apps/api       // Serverless functions / express
/libs/core      // Shared types and calculation functions
/scripts/ingest  // Worker scripts for on-chain parsing
/tests           // Unit and integration tests
/docs            // Metrics documentation and demo script


Coding standards

Strict TypeScript types on trade model and API contracts.

Calculation functions pure and fully unit tested.

Clear README with architecture diagram and deployment steps.

17. Acceptance criteria and definition of done

A feature is done when

Code is merged, linted and passes tests.

Demonstration of the feature in the deployed demo.

Documentation explains the algorithm and any assumptions.

Security checklist entries relevant to feature passed.

Final acceptance for hackathon submission

All required metrics implemented and verifiably accurate against sample on-chain data.

AI assistant demonstrates at least three informative queries.

Simulator produces plausible scenario outputs.

Public GitHub link, live demo and demo video provided.

18. Risks and mitigations

Risk: On-chain parsing complexity and edge cases

Mitigation: Start with canonical event signatures from Deriverse SDK; implement deterministic mapping and extensive reconciliation tests.

Risk: LLM cost and privacy concerns

Mitigation: Aggregate data before sending prompts; cache responses; prompt user consent before sending any private notes.

Risk: Large historical data sizes slow queries

Mitigation: Precompute daily aggregates, paginate trade table, use indexing and caching.

Risk: Time to produce polished UI

Mitigation: Use UI kits and Tailwind to accelerate visual polish; prioritise clarity over decorative features for judges.

19. Next steps and immediate action items (no time estimates)

Create repo skeleton and CI pipeline.

Implement wallet connect and challenge flow.

Implement basic ingestion pipeline and parse small sample wallets.

Implement core calculation library and unit tests.

Build overview dashboard with equity and KPI tiles.

Add trade table and annotation persistence.

Integrate AI assistant with minimal prompts and safeguards.

Prepare demo video and submission assets.

20. Appendix — calculation pseudocode examples
Max drawdown pseudocode
equity = cumulative_sum(daily_pnl) + initial_capital
peak = -inf
max_dd = 0
for t in 0..len(equity)-1:
  if equity[t] > peak:
    peak = equity[t]
  dd = (equity[t] - peak) / peak
  if dd < max_dd:
    max_dd = dd
return max_dd  // negative number reflecting max drawdown

Sharpe ratio pseudocode (periodic)
returns = [equity[t] / equity[t-1] - 1 for t in 1..N]
mean_r = mean(returns)
std_r = std(returns)
rf = rf_annualised_converted_to_period
sharpe = (mean_r - rf) / std_r
