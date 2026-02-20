1. Overview (short)

Goal: non-custodial web app that consumes Deriverse on-chain trade events for a wallet, computes auditable analytics, displays rich visualisations, supports annotations and an LLM-powered assistant, and provides a scenario simulator.

Key constraints: single-user (solo buildable), trustless on-chain source of truth, strong security and privacy, high accuracy of metric calculations.

2. Primary user journeys (high level)

Connect wallet → Dashboard view

Dashboard exploration → filter / deep-dive

Select trade → Annotate / tag / mark reviewed

Ask AI assistant a question → receive chart & summary

Run scenario simulator → review hypothetical equity

Export CSV / PNG → share / archive

Each journey is expanded below with step-by-step flows, UI states and failure handling.

3. User flows — detailed step-by-step
Flow A — First-time user: Connect wallet & initial ingestion

User opens app landing page.

UI shows CTA: “Connect Wallet”.

User clicks and selects a Solana wallet (Phantom/Solflare).

Frontend calls POST /api/auth/challenge with wallet_address.

Server returns challenge string (nonce).

Frontend asks wallet to sign challenge (wallet UI).

Wallet returns signature.

Frontend calls POST /api/auth/verify { wallet_address, signature }.

Server verifies signature, issues JWT (short-lived, e.g. 1h) and a refresh token stored in secure cookie (httpOnly, Secure).

Frontend stores JWT in memory and uses it for API calls.

Server enqueues a backfill job for this wallet (if no prior data) and returns current ingest status (queued/in progress).

Frontend shows progress UI: “Initial import queued — we will fetch and reconcile your history”.

Worker picks up job, fetches on-chain transactions, parses trades, stores canonical trades; as aggregates become available, the frontend polls /api/v1/summary and populates the dashboard progressively.

When ready the UI shows full KPIs, equity curve and trade table.

Failure states and mitigations

Wallet refused to sign: show friendly error, allow retry.

Network error during verify: retry with exponential backoff, show offline banner.

Ingest fails for a wallet: mark status “error” with last error (log id) and provide a “reprocess” button.

Flow B — Daily use: incremental sync and quick refresh

User connects wallet (or is already connected).

Frontend periodically (or on demand) calls GET /api/v1/summary?wallet=....

Backend checks cache: if cached within TTL (e.g. 60s) return cached aggregates; if stale, trigger a quick incremental ingest for new slots and return last cached snapshot plus ingestStatus: processing.

Frontend displays KPIs; if ingest is running, display small “processing recent txs” indicator.

If user performs actions (annotate, request simulation or AI), frontend calls corresponding API endpoints.

Failure handling

Rate limited by RPC: queue ingest jobs and backoff. Show “data may be slightly delayed”.

Flow C — Annotate trade

User clicks a trade row → opens modal.

User types note, selects tags, clicks Save.

Frontend encrypts note client-side (optional for max privacy) OR sends to server and server encrypts before storing.

API responds with updated trade object and 200 OK.

UI immediately displays saved note; server emits websocket event so other sessions are kept in sync.

Privacy choice

Default: server-side encryption with KMS key; offer “client-side encryption” toggle for advanced users (private notes never leave the browser unencrypted).

Flow D — Ask AI (LLM) assistant

User opens AI modal and enters a query (e.g. “Show my worst month in the past year — and why”).

Frontend calls POST /api/v1/ai/query with { wallet, query, contextOptions }.

Backend builds a restricted context from precomputed aggregates and a small sample of trades (never raw encrypted notes unless explicit consent).

Backend calls LLM API (with prompts engineered to constrain hallucination) and returns: { answer_text, charts: [chartSpec], references: [metricsUsed] }.

Frontend renders text and charts. Provide “Explain sources” button that lists the exact metrics/rows used.

Safety controls

Max prompt tokens per user per day; caching; user must opt in to share notes.

Flow E — Scenario simulator

User opens simulator modal.

Selects parameters (multiplier on trade size, stop loss % applied to each historical trade, exclude highest-loss trades, etc).

Frontend posts params to POST /api/v1/simulate.

Backend replays trade stream applying transformations and returns a synthetic equity series; frontend renders chart and diff vs actual.

Allow export of simulated series CSV.

Edge cases

Partial fills: simulator respects original realised PnL calculation logic (see section 6). Document assumptions.

4. System architecture (component-level)

Top-level components:

Frontend: Next.js (React, TypeScript) — UI, wallet integration, client-side encryption, charting.

API layer: Serverless functions (Vercel/AWS Lambda) or small Node/Express service for auth, summary endpoints, annotation, AI orchestration.

Ingestion workers: Node.js workers (serverless queue consumers or containerised workers) to fetch on-chain transactions, parse events, and normalise into Trade objects.

Database: Postgres (Supabase) with time-series partitioning or Timescale extension.

Cache: Redis for aggregates and rate limiting.

Queue: BullMQ / Redis queues (or SQS) for background jobs (initial backfill, incremental ingest, simulator requests).

LLM gateway: Backend wrapper for LLM provider (OpenAI or other) with prompt templates, privacy filters and usage throttling.

Monitoring & logs: Sentry, CloudWatch/Datadog/Prometheus + Grafana.

Storage: Object storage (S3) for static exports, demo recordings and archived CSVs.

CI/CD: GitHub Actions for tests and deployment.

Secrets/KMS: Cloud KMS (AWS KMS / Google KMS) for encryption keys.

Static hosting: Vercel/Netlify for frontend (with serverless API) or self-hosted on a container platform.

Component responsibilities (concise)

Frontend: wallet connect, signed challenge, query APIs, charts, annotations, client-side encryption option.

API: authentication, session management, expose summary/trade endpoints, enqueue ingestion jobs, run simulation orchestrations, proxy to LLM, serve docs.

Ingest Worker: fetch txs, parse into trade model, persist trades, compute deltas and aggregates.

Aggregators: compute rolling aggregates and precompute daily buckets for charts.

Cache: hold frequently used aggregate snapshots to meet performance SLAs.

Queue: manage rate-limited, idempotent tasks.

DB: authoritative storage of canonical trades, tags, user settings and audit logs.

LLM gateway: sanitise prompts, limit context, cache responses.

Observability: tracing and error alerts.

5. Data flow and sequence (detailed)
Typical sequence for ingestion

User authorises and worker enqueues backfillWallet(wallet_address) job.

Worker queries lastProcessedSlot(wallet) from audit_log.

Worker calls Solana RPC / Deriverse SDK: getSignaturesForAddress(wallet, before/after cursor) or scanning marketplace events for that wallet.

For each signature, get transaction details -> parse logs to find Deriverse event(s) -> map events to TradeCandidate records.

For each TradeCandidate:

Determine if it is an open/close/partial fill event or fee-only event.

If close event creates realised PnL, compute realised pnl in base currency and convert to USD (or chosen quote) using price oracle from that timestamp (on-chain or external oracle).

Create canonical Trade ID: deterministic hash of {txSignature, logIndex, eventType}.

Persist new or updated Trade in DB (UPSERT by canonical ID).

After batch persists, recompute daily aggregates for affected days and users; update Redis cache for the wallet summary key: wallet:summary:<address>.

Mark job complete and write audit_log entries.

Cache keys (examples)

wallet:summary:<address> — JSON top-level KPIs (TTL 60s).

wallet:equity:<address>:<from>:<to> — series for fast querying (TTL longer, e.g. 5m).

agg:daily:<wallet>:YYYY-MM-DD — precomputed daily aggregate.

6. Data model (SQL schemas)

Below are example Postgres schemas. Adjust types to your chosen DB.

-- users table
CREATE TABLE users (
  wallet_address TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  preferences JSONB DEFAULT '{}',
  encrypted_notes_key TEXT, -- pointer or metadata for client-side encrypted key
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- trades table (canonical)
CREATE TABLE trades (
  id TEXT PRIMARY KEY, -- deterministic id = sha256(tx_sig || log_index || event_type)
  wallet_address TEXT NOT NULL REFERENCES users(wallet_address),
  market TEXT NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL, -- 'long'|'short'
  order_type TEXT,
  size NUMERIC,
  entry_price NUMERIC,
  exit_price NUMERIC,
  entry_time TIMESTAMPTZ,
  exit_time TIMESTAMPTZ,
  pnl NUMERIC, -- realised PnL in quote currency (e.g. USD)
  pnl_currency TEXT DEFAULT 'USD',
  fees NUMERIC DEFAULT 0,
  fees_breakdown JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  note_encrypted BYTEA, -- encrypted blob if using server-side encryption
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_trades_wallet_time ON trades(wallet_address, exit_time DESC);
CREATE INDEX idx_trades_symbol ON trades(symbol);


Aggregates:

CREATE TABLE daily_aggregates (
  wallet_address TEXT NOT NULL,
  day DATE NOT NULL,
  total_pnl NUMERIC,
  trades_count INT,
  wins_count INT,
  losses_count INT,
  fees_total NUMERIC,
  avg_trade_duration_seconds NUMERIC,
  volatility NUMERIC,
  PRIMARY KEY (wallet_address, day)
);


Audit log:

CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT,
  job_type TEXT,
  job_payload JSONB,
  status TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  details JSONB
);

7. Ingestion & reconciliation — pseudocode (idempotent and deterministic)

Goals: idempotency, determinism, reproducibility.

# Pseudocode
def ingest_wallet(wallet_address, from_slot=None, to_slot=None):
    last_processed_slot = get_last_processed_slot(wallet_address)
    start_slot = from_slot or last_processed_slot + 1
    signatures = rpc.get_signatures_for_address(wallet_address, start_slot, to_slot)
    for sig in signatures:
        tx = rpc.get_transaction(sig)
        trade_events = parse_deriverse_events(tx)   # returns list of event dicts
        for ev in trade_events:
            canonical_id = sha256(sig + '|' + ev.log_index + '|' + ev.event_type)
            trade = map_event_to_trade(ev, tx)
            # convert pnl to preferred currency using on-chain oracle snapshot or external price fetch at ev.timestamp
            trade.pnl = convert_to_quote_currency(trade.pnl, ev.timestamp)
            upsert_trade(canonical_id, trade)  # UPSERT ensures idempotency
    recompute_aggregates_for_wallet(wallet_address, affected_days)
    save_audit_log(wallet_address, job details)


Reconciliation notes

Use deterministic canonical ids to avoid duplicates.

If event mapping yields partial fills, ensure trade object tracks partial_fill_sequence or related metadata so later events can update the same canonical trade rather than creating a new one.

Keep raw transaction signatures in metadata for traceability.

8. Metric calculation definitions & reference implementation notes

Win rate = count(pnl > 0) / count(pnl != 0) (exclude zero-pnl aborted orders).

Average win = mean of positive pnl values.

Average loss = mean of negative pnl values (absolute value where appropriate).

Expectancy = (win_rate * average_win) - ((1 - win_rate) * average_loss).

Equity curve: discrete cumulative sum of realised PnL ordered by exit_time. Optionally plus initial_capital.

Drawdown: compute peak so far and percentage drop from peak.

Sharpe (periodic): (mean(returns) - rf_periodic) / std(returns); document rf and frequency (daily/weekly).

All formulas are implemented in libs/core/metrics.ts (or equivalent) as pure functions with unit tests.

9. API contract (examples)
Auth (challenge/verify)

POST /api/auth/challenge
Body: { "wallet_address": "..." }
Response: { "challenge": "nonce-xyz" }

POST /api/auth/verify
Body: { "wallet_address":"...", "signature":"..." }
Response: { "token": "...", "refresh_token": "..." }

Summary

GET /api/v1/summary?wallet=...&from=YYYY-MM-DD&to=YYYY-MM-DD
Response:

{
  "wallet": "addr",
  "kpis": {
    "total_pnl": 1234.56,
    "win_rate": 0.54,
    "max_drawdown_pct": -0.12,
    "sharpe": 1.3,
    "trades_count": 124
  },
  "equity_preview": [{"ts":"2026-01-01T00:00:00Z","equity":1000},...],
  "status": "ready"
}

Trades listing

GET /api/v1/trades?wallet=...&symbol=BTC&limit=50&offset=0
Response: paginated trade objects (fields per Trade model).

Annotate

POST /api/v1/trades/{tradeId}/note
Body: { "note_encrypted": "<base64>", "tags": ["swing"] }
Response: 200 OK with updated trade.

AI query

POST /api/v1/ai/query
Body: { "wallet":"...", "query":"What is my worst month?", "contextOptions":{"includeLastNTrades":50} }
Response: { "answer_text": "...", "charts":[{...}], "metrics_references":["equity", "daily_pnl"] }

10. LLM prompt templates and safety

Use short, deterministic prompts and limit context size. Store templates in libs/ai/prompts.ts.

System prompt

You are a concise trading analytics assistant. Use only the structured data provided (metrics and timeseries) to answer. Do not invent facts. If information is missing, state what is missing and suggest how to obtain it.


User prompt wrapper

SYSTEM: <system_prompt>
DATA: <serialized top_n aggregates and 10 recent trades>
QUESTION: <user query>
INSTRUCTIONS: Keep answer < 200 words. Reference metrics used.


Privacy: never include user raw notes unless explicit consent granted with a scope indicator. Cache and rate limit queries.

Throttling: per-user daily token caps and per-request token caps. Monitor spending in observability layer.

11. Security architecture (details)
Authentication

Challenge/response signing using wallet signature for authentication.

JWT short lived for API; refresh token in httpOnly secure cookie.

All endpoints require JWT except public demo.

Data encryption

Two modes:

Server-side encryption: server stores note_encrypted as ciphertext using KMS-wrapped master key. Use AES-GCM symmetric encryption with per-note IVs.

Client-side encryption (optional advanced): derive symmetric key client-side from user wallet signature + salt (PBKDF2/Argon2), then encrypt notes in browser; server stores ciphertext and cannot decrypt.

Key material: managed by cloud KMS; rotate keys on schedule.

Least privilege & secrets

Use environment variables for API keys; gitignore .env.

Use KMS to wrap database encryption keys.

No private keys or seed phrases ever stored.

Endpoints & input validation

Validate all incoming payloads with strong schema (zod/Joi).

Parameterise SQL queries (use prepared statements / ORM).

Rate limit AI and ingest endpoints.

CORS

Restrict to known domains in production.

Logging

Avoid logging sensitive data (notes) in plaintext.

Log event ids and references for traceability.

12. Performance & scaling
Read heavy, write moderate

Dashboard is read-heavy (many fast aggregate reads). Use Redis for fast snapshot reads and precompute daily aggregates.

Strategies

Precompute daily aggregates when ingesting; use aggregates for charts and only compute finer metrics on demand.

Partition trades table by month if volume grows; index on (wallet_address, exit_time).

Use Redis for wallet:summary and wallet:equity caches.

Run ingestion workers horizontally; queue incoming jobs; set concurrency limits to avoid RPC rate limits.

RPC & rate-limit handling

Implement RPC backoff with exponential backoff and jitter.

Batch getTransaction calls when possible or use indexer / Deriverse SDK if available to reduce RPC load.

Use a small private indexer (optional) for large scale — runs an archive node that indexes Deriverse events into the DB.

13. Observability, monitoring & alerts

Errors: Sentry for frontend/backend exceptions.

Metrics: Prometheus metrics for ingest latency, transactions processed, LLM tokens consumed, Redis hit ratio.

Logs: Structured logs to CloudWatch / ELK with correlation id (trace id).

Dashboards: Grafana dashboard showing ingestion queue depth, average processing time, API latency, cache hit ratio.

Alerts:

Ingest failures ( > 5% error rate )

LLM cost spike ( > configured threshold )

Redis down / high latency

High error rate on auth endpoint

14. Testing strategy (concrete)

Unit tests for metric functions with edge cases (no trades, all losses, zero prices).

Integration tests for API endpoints using sample datasets and a Postgres test container.

E2E tests (Cypress) for wallet connect flow (mock wallet), annotation, AI query (mock AI).

Reconciliation tests: provide a canonical sample transaction file with expected trade outputs; ingest pipeline must produce identical trade objects.

Load tests: simulate many read requests for one wallet with 10k trades to ensure KPIs render within target.

15. CI/CD and release process

Repo: monorepo with apps/frontend, apps/api, libs/core.

GitHub Actions:

PR lint and unit tests.

On main push run full test suite, build containers.

Deploy frontend to Vercel (or Netlify) and API to Vercel Serverless or AWS Lambda.

Tagged release creates a release build and uploads demo artefacts.

Pre-release checklist: run dependency audit, run static security checks, regenerate docs and assets.

16. Failure modes, tricky edge cases & mitigations

Partial fills / multiple events per order

Use deterministic canonical id and track fill_sequence to update same trade record.

Orphan close events (close with no recorded open)

Create trade with entry_time = null, mark as inferred_open and surface in UI to allow user to mark/annotate.

Fees in multiple tokens

Convert fees to quote currency using on-chain snapshot price at fee timestamp.

Cross-currency conversion mismatches

Use highly reputable price source (on-chain oracle or consolidated external source) and log source for audit.

RPC rate limits

Use batching, local indexer, or small paid RPC node. Implement job retry with backoff.

LLM hallucination

Only feed aggregated and small sample of trades. Use system prompt preventing fabrication. Provide source references with each AI answer.

17. Deployment & environment checklist

Environments: local, staging, production with separate DBs, separate KMS keys and LLM keys.

Production checklist

Secrets rotated and stored in vault.

CORS and allowed origins configured.

Sentry DSN and monitoring dashboards set.

DBA run vacuum and check indexes.

KMS key rotation policy configured.

Cost alerts for LLM usage in place.

18. Developer deliverables (what to ship to judges)

Public GitHub repo with:

/apps/frontend with Next.js app and demo credentials / mock wallet instructions.

/apps/api with serverless functions and deployed endpoints.

/libs/core with metric implementations and unit tests.

/scripts/ingest worker and sample sample txs for testing.

/docs/metrics.md with formulae and verification examples (include sample inputs + expected outputs).

Deployed demo URL and a 90–180 second demo video.

demo/sample_dataset.csv and demo/reconciliation_report.md.

README checklist mapping each hackathon requirement to code locations.

19. Quick operational runbook (for judges or maintainers)

To reprocess wallet history: POST /admin/reprocess with { wallet, from_slot, to_slot }.

To clear cache: POST /admin/cache/flush?key=wallet:summary:<addr>.

To view ingest errors: check audit_log entries with status = 'error'.

To revoke LLM key: disable LLM_ENABLED env var; cached responses still served.

20. Appendix — helpful constants, keys and sample values

Cache TTLs:

summary KPIs: 60s

equity series (small ranges): 300s

precomputed daily aggregates: 12 hours

Ingest concurrency:

workers: 4 (start), scale to 16 if necessary

Rate limits:

AI queries: 10/min per user; 100/day default cap

API read endpoints: 60/min per IP

DB partition: monthly partitions by exit_time for trades table