# Cumbre

Autonomous ecommerce intelligence and execution platform. Discovers products across
marketplaces, social platforms, and ad libraries; scores them with a transparent,
non-inflating Winner Score algorithm; and helps turn the best opportunities into a
brand, ad strategy, and store.

This is a real, running application — not a mockup. Every screen is backed by a
Postgres database and server-rendered data. Where a live third-party integration
isn't wired up yet (most external sources require paid/partner API access), the app
runs on clearly labeled **demo data** instead of pretending the integration is real.

## Stack

- **Next.js 16** (App Router, Turbopack, Server Components) + React 19 + TypeScript
- **Tailwind CSS v4** + hand-built shadcn/ui-style primitives (Radix UI under the hood)
- **Prisma 7** (driver-adapter mode) + PostgreSQL
- **Auth.js v5** (NextAuth) — email/password + Google OAuth, JWT sessions
- **TanStack Query v5** + **TanStack Table v9** + **Recharts v3**
- **AI provider abstraction** — Anthropic / OpenAI / Google, switchable per-org, with
  a zero-cost demo provider fallback when no API key is configured
- **Vitest** for unit tests

## Getting started

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL at minimum
npm run db:push           # create the schema (or db:migrate for real migrations)
npm run db:seed           # generate demo data + a login you can use immediately
npm run dev
```

Demo login after seeding: `demo@ecomhunter.ai` / `demo12345`

### Required environment variables

Only `DATABASE_URL` and `AUTH_SECRET` are required to run the app. Everything else
(AI provider keys, Shopify/Tiendanube app credentials, Redis, Sentry) is optional —
the corresponding feature runs in demo/disabled mode until it's configured. See
`.env.example` for the full list and what each one unlocks.

## Architecture

```
src/
  app/                    Next.js App Router routes
    (auth)/               Public login/register (no sidebar)
    (app)/                Authenticated app shell (sidebar + topbar)
    api/                  Route handlers (products list, translation)
  auth.ts                 Auth.js configuration
  proxy.ts                Route protection (Next 16's renamed middleware)
  components/
    ui/                   Design-system primitives (button, card, table, ...)
    shell/                Sidebar, topbar, nav config
    products/             Product card, winner score badge, AI analysis panel, ...
    radar/                Product Radar filters/table/chart
    agent/                AI Agent chat UI
  lib/
    ai/                   AIProvider abstraction — see below
    scoring/              Winner Score engine
    discovery/            ProductDiscoveryEngine
    agent/                AI Agent tools + orchestration
    calculators/          Profitability calculator (pure functions)
    actions/              Server actions (mutations)
    products/, session.ts, db.ts, api-session.ts   Data access helpers
  integrations/            One folder per data source adapter
    <source>/adapter.ts
    shared/                 Demo adapter factory + synthetic data generators
    registry.ts              All adapters, source of truth for the discovery engine
prisma/
  schema.prisma            36-model schema (see spec section 36)
  seed.ts                  Demo data generator
```

### AI provider abstraction (`src/lib/ai`)

`AIProvider` is one interface with `generateText`, `generateStructuredOutput`, and
domain methods (`analyzeProduct`, `generateCreative`, `generateBrand`,
`generateAdStrategy`, `generateStore`, `generateLandingPage`, `researchMarket`).
`BaseAIProvider` implements every domain method once, on top of
`generateStructuredOutput` — so `AnthropicProvider`, `OpenAIProvider`, and
`GoogleProvider` only need to implement the actual API call. `DemoAIProvider`
implements the full interface directly with clearly-labeled synthetic output and
costs nothing, so the app is fully explorable with zero API keys.

`getAIProvider(preference)` in `lib/ai/factory.ts` resolves which provider to use
per-organization (from Settings) and falls back to demo mode if the preferred
provider has no API key — the app never crashes or silently no-ops for missing
credentials.

### Product Discovery Engine (`src/integrations`, `src/lib/discovery`)

Every data source (Amazon, Mercado Libre, TikTok, Meta Ads Library, Google Trends,
suppliers, ...) implements the same `ProductSourceAdapter` interface and returns the
same normalized product shape. Each adapter is honestly categorized as
`OFFICIAL_API`, `PARTNER_API`, `PUBLIC_FEED`, `SEARCH_API`, `BROWSER_AUTOMATION`,
`SCRAPING`, `MANUAL_IMPORT`, or `DEMO_MOCK` — see each adapter file for exactly how
it's wired (or would be wired) to the real source. None of them scrape or bypass
auth/anti-bot systems; sources without a viable public API run on demo data until a
licensed/partner data provider is connected.

`ProductDiscoveryEngine.discover()` fans out to the selected adapters, normalizes
results into `Product` rows, computes the Winner Score, and records a
`ProductSnapshot` for trend history — a single adapter failing never aborts the run
for the others.

### Winner Score engine (`src/lib/scoring`)

Weighted-factor scoring (0–100) per spec: viral potential, trend momentum, margin,
problem-solving fit, ad potential, competition opportunity, supplier quality,
shipping simplicity, brand potential, impulse-purchase potential, and market growth,
minus penalties for saturation, legal risk, shipping complexity, return risk, and
seasonality. Missing inputs fall back to a neutral value (never an optimistic one)
and reduce the reported confidence score — a product can't reach a high score just
because its few known factors happen to be strong. See
`winner-score.test.ts` for the behavioral guarantees this makes.

## Development

```bash
npm run dev          # start the dev server
npm run test          # run unit tests (vitest)
npm run lint           # eslint
npm run build           # production build
npm run db:studio        # Prisma Studio (inspect the database)
```

## Build phases

This repo follows the phased build order from the product spec:

- **Phase 1 (done):** auth, database, dashboard, Winner Score, Product Radar,
  product detail, AI product analysis, watchlist, profitability calculator, AI Agent.
- **Phase 2 (partial):** discovery adapters for the easiest/most reliable sources are
  wired (in demo mode pending credentials); supplier search and brand generation are
  live from the product detail page and Brand Builder.
- **Phase 3–5:** competitor intelligence engine, ad intelligence feed, creative
  studio, and Shopify/Tiendanube store publishing are scaffolded (schema + nav +
  honest "planned" pages) but not yet built out — see the in-app pages for exactly
  what's implemented vs. planned.

## Demo data

Everything the seed script generates is flagged `isDemoData` / `dataConfidence:
"DEMO"` in the database and shown with a visible "Demo data" badge in the UI — it is
never presented as live market data.
