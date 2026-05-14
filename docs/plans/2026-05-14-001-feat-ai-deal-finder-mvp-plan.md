---
title: "feat: Build AI Deal Finder MVP (Chrome Extension + Companion Website)"
type: feat
status: active
date: 2026-05-14
origin: docs/brainstorms/ai-deal-finder-requirements.md
---

# feat: Build AI Deal Finder MVP (Chrome Extension + Companion Website)

## Summary

Build a monorepo containing two deliverables: (1) a Chrome Extension (Manifest V3 + React) that detects product pages on Amazon/Shopee/Lazada and displays an AI-powered popup with review summaries and price comparisons, and (2) a Next.js 15 companion website that hosts the AI API layer, product detail pages, and revenue surfaces (Google AdSense + affiliate links). The extension calls the website's API for all AI processing — API keys never touch the extension bundle.

---

## Problem Frame

Online shoppers waste time opening multiple tabs to compare prices and reading hundreds of reviews to make a purchase decision. AI Deal Finder solves this in one click, directly on the product page. (See origin: `docs/brainstorms/ai-deal-finder-requirements.md`)

---

## Requirements

- R1. Chrome Extension detects product pages on Amazon, Shopee Thailand, and Lazada Thailand
- R2. Extension popup displays an AI-generated pros/cons summary of product reviews
- R3. Extension popup shows price comparison from at least 2 other sources
- R4. Companion website has full product detail pages with price comparison + review summary
- R5. Companion website is monetized via Google AdSense and affiliate links
- R6. All AI processing happens server-side (OpenAI key never exposed in extension)
- R7. AI summary supports both English and Thai language content

---

## Scope Boundaries

- Firefox, Safari, and other browsers — Chrome only for MVP
- User accounts / authentication — no login required in MVP
- Price Alert email notifications (P2 feature — deferred)
- "Best Time to Buy" AI recommendation (P2 feature — deferred)
- Custom price scraper — use third-party API in MVP
- Subscription / paid tier — ads + affiliate only for MVP
- Mobile app

### Deferred to Follow-Up Work

- Fake Review Detector score (P1): separate unit after MVP validates core value
- Price History Chart (P1): requires price data accumulation over time — add in v1.1
- Deal Blog / SEO content (P1): add after AdSense approval

---

## Context & Research

### Relevant Code and Patterns

- No existing codebase — greenfield project
- Follow Next.js App Router conventions for all website code
- Chrome Extension Manifest V3 service worker pattern (no persistent background pages)
- Supabase client: use `@supabase/ssr` for Next.js server components

### Institutional Learnings

- No existing `docs/solutions/` — new project

### External References

- [Chrome Extension MV3 Migration Guide](https://developer.chrome.com/docs/extensions/develop/migrate)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Supabase + Next.js guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [OpenAI API pricing](https://openai.com/api/pricing/) — GPT-4o-mini ~$0.15/1M input tokens
- [Google AdSense policies](https://support.google.com/adsense/answer/48182) — requires original content

---

## Key Technical Decisions

- **Monorepo over separate repos:** Single repo with `extension/` and `website/` workspaces simplifies sharing types and deployment coordination for a solo dev
- **Extension calls website API (not OpenAI directly):** Keeps OpenAI API key server-side; also lets us cache results in Supabase to reduce API costs on repeated lookups
- **Vite for extension bundling:** Faster DX than webpack; `crxjs/vite-plugin` handles MV3 asset pipeline cleanly
- **Content script + popup combo:** Content script reads product DOM (title, ASIN/product ID, existing reviews) and sends structured data to popup via `chrome.runtime.sendMessage`; popup renders React UI
- **Third-party price API for MVP:** Avoids scraper maintenance burden; RapidAPI marketplace has Amazon/Shopee price comparison APIs; switch to custom scraper only if API costs become a problem at scale
- **Supabase for caching AI results:** Cache review summaries by product ID + timestamp to avoid duplicate OpenAI calls; dramatically lowers per-user cost at scale
- **Deploy website first:** AdSense approval requires existing content; build and publish website with placeholder product pages before extension goes live

---

## Open Questions

### Resolved During Planning

- **Where does OpenAI key live?** Server-side in Next.js API route, stored as Vercel environment variable. Extension never touches it.
- **How does extension get product data?** Content script runs on matching URL patterns, reads DOM for product title/ID/reviews, sends to popup/service worker via chrome.runtime API.
- **Monorepo tooling?** npm workspaces (no Turborepo needed for 2 packages at this scale).

### Deferred to Implementation

- **Which third-party price API?** Evaluate RapidAPI options at implementation time — pricing and coverage vary. Budget: under $20/month for MVP traffic.
- **Exact DOM selectors for Shopee/Lazada:** Product page structure changes frequently; implement with resilient fallback selectors and a "could not read page" graceful state.
- **AdSense auto-ads vs. manual placement:** Decide at implementation based on AdSense approval requirements.

---

## Output Structure

```
ai-deal-finder/
├── package.json                  # npm workspaces root
├── extension/
│   ├── package.json
│   ├── vite.config.ts
│   ├── manifest.json             # MV3 manifest
│   ├── src/
│   │   ├── popup/
│   │   │   ├── index.html
│   │   │   ├── main.tsx
│   │   │   └── components/
│   │   │       ├── ReviewSummary.tsx
│   │   │       ├── PriceComparison.tsx
│   │   │       └── LoadingState.tsx
│   │   ├── content/
│   │   │   └── index.ts          # content script
│   │   └── background/
│   │       └── service-worker.ts
├── website/
│   ├── package.json
│   ├── next.config.ts
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── product/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── api/
│   │   │       ├── summarize/
│   │   │       │   └── route.ts
│   │   │       └── prices/
│   │   │           └── route.ts
│   │   ├── components/
│   │   │   ├── ReviewSummaryCard.tsx
│   │   │   ├── PriceComparisonTable.tsx
│   │   │   └── AffiliateButton.tsx
│   │   └── lib/
│   │       ├── supabase.ts
│   │       ├── openai.ts
│   │       └── price-api.ts
│   └── supabase/
│       └── migrations/
│           └── 001_initial_schema.sql
└── docs/
    ├── brainstorms/
    └── plans/
```

---

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
User visits Amazon/Shopee/Lazada product page
        │
        ▼
[Content Script] reads DOM
  - product title
  - product ID (ASIN / Shopee itemid)
  - first N reviews (up to ~10)
        │
        │  chrome.runtime.sendMessage(productData)
        ▼
[Extension Popup] (React)
  - shows loading state immediately
  - calls companion website API:
      POST /api/summarize  → AI pros/cons
      GET  /api/prices     → price comparison
        │
        ▼
[Next.js API Routes] (server-side)
  /api/summarize:
    1. Check Supabase cache (product_id + <24h)
    2. If cache miss: call OpenAI GPT-4o-mini
    3. Store result in Supabase
    4. Return { pros[], cons[], rating_confidence }

  /api/prices:
    1. Call third-party price API (RapidAPI)
    2. Return [{ store, price, currency, url }]
        │
        ▼
[Extension Popup] renders results
  + "View full comparison →" link to website product page
        │
        ▼
[Companion Website] /product/[id]
  - Full review summary
  - Price table with affiliate links
  - Google AdSense ads
```

---

## Implementation Units

- U1. **Monorepo Scaffold**

**Goal:** Initialize the npm workspaces monorepo with both `extension/` and `website/` packages, shared TypeScript config, and root-level tooling.

**Requirements:** R1, R4 (foundation for all features)

**Dependencies:** None

**Files:**
- Create: `package.json` (root workspace)
- Create: `tsconfig.base.json`
- Create: `extension/package.json`
- Create: `website/package.json`
- Create: `.gitignore`
- Create: `.env.example`

**Approach:**
- Root `package.json` declares `"workspaces": ["extension", "website"]`
- Shared base tsconfig extended by each package
- `.env.example` documents all required env vars: `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PRICE_API_KEY`, `NEXT_PUBLIC_SITE_URL`

**Patterns to follow:**
- npm workspaces (no extra tooling needed at this scale)

**Test scenarios:**
- Test expectation: none — scaffolding only; verified by `npm install` succeeding and both packages resolvable

**Verification:**
- `npm install` from root installs all workspace deps without errors
- Both `extension/` and `website/` directories exist with valid `package.json`

---

- U2. **Supabase Database Schema**

**Goal:** Create the database schema for caching AI summaries and storing product/price data.

**Requirements:** R6 (server-side caching to protect API key usage)

**Dependencies:** U1

**Files:**
- Create: `website/supabase/migrations/001_initial_schema.sql`

**Approach:**
- `products` table: `id` (text PK, e.g. ASIN), `title`, `store` (amazon/shopee/lazada), `url`, `created_at`
- `review_summaries` table: `product_id` (FK), `pros` (jsonb array), `cons` (jsonb array), `confidence_score` (float), `language` (en/th), `cached_at` — cache TTL enforced at query time (24h)
- `price_history` table: `product_id` (FK), `store`, `price`, `currency`, `affiliate_url`, `checked_at` — stores latest price per store

**Patterns to follow:**
- Supabase migration file conventions (numbered SQL files)

**Test scenarios:**
- Happy path: insert product + summary, query by product_id within 24h → returns cached row
- Edge case: query summary older than 24h → application logic treats as cache miss (TTL logic in app layer, not DB)
- Edge case: product_id with no summary → returns null, triggers fresh OpenAI call

**Verification:**
- Supabase dashboard shows all three tables with correct columns and FK relationships
- `supabase db push` applies migration without errors

---

- U3. **Next.js Website Foundation**

**Goal:** Scaffold the Next.js 15 App Router website with Tailwind CSS, shadcn/ui, and Supabase client wired up.

**Requirements:** R4, R5

**Dependencies:** U1, U2

**Files:**
- Create: `website/next.config.ts`
- Create: `website/src/app/layout.tsx`
- Create: `website/src/app/page.tsx` (homepage — brief "What is AI Deal Finder?" landing)
- Create: `website/src/lib/supabase.ts` (server + client Supabase helpers)
- Create: `website/src/app/globals.css`

**Approach:**
- Use `create-next-app` output as base, then configure Tailwind + shadcn/ui
- Supabase client: two exports — `createServerClient` (for Server Components / API routes) and `createBrowserClient` (for client components), following `@supabase/ssr` pattern
- Homepage has minimal content: hero section explaining the extension + "Add to Chrome" button (links to Chrome Web Store — placeholder until published) + "How it works" section (3 steps)
- All pages include proper `<meta>` tags for SEO

**Patterns to follow:**
- Next.js App Router file conventions (`layout.tsx`, `page.tsx`, `route.ts`)
- shadcn/ui component installation pattern

**Test scenarios:**
- Happy path: `npm run dev` in `website/` starts without errors, homepage renders at `localhost:3000`
- Happy path: Supabase client connects to project (verify via a test query in `/api/health` route)

**Verification:**
- Website runs locally; homepage renders without console errors
- Supabase connection succeeds (health check API returns 200)

---

- U4. **OpenAI Review Summary API Route**

**Goal:** Build the `/api/summarize` endpoint that accepts product reviews, checks the Supabase cache, calls OpenAI GPT-4o-mini on cache miss, and returns structured pros/cons.

**Requirements:** R2, R6, R7

**Dependencies:** U2, U3

**Files:**
- Create: `website/src/app/api/summarize/route.ts`
- Create: `website/src/lib/openai.ts`
- Test: `website/src/app/api/summarize/route.test.ts`

**Approach:**
- `POST /api/summarize` accepts `{ productId, reviews: string[], language: "en" | "th" }`
- Cache check: query `review_summaries` where `product_id = productId AND cached_at > now() - interval '24 hours'`
- On cache miss: call OpenAI with a structured prompt asking for JSON `{ pros: string[], cons: string[], confidence: number }`
- System prompt instructs: summarize in the same language as `language` param; be concise (max 5 pros, 5 cons); flag if reviews seem fake (low confidence score)
- Store result in Supabase before returning
- Rate limit: 10 requests per IP per minute (use Vercel's `@vercel/kv` or a simple in-memory map for MVP)
- CORS: allow requests from the extension's origin (set `Access-Control-Allow-Origin` to extension ID origin)

**Patterns to follow:**
- Next.js App Router `route.ts` with `export async function POST(request: Request)`

**Test scenarios:**
- Happy path (cache miss): valid reviews array → calls OpenAI → returns `{ pros, cons, confidence }` → caches in Supabase
- Happy path (cache hit): same productId within 24h → returns cached result without calling OpenAI
- Edge case: empty reviews array → returns `{ pros: [], cons: [], confidence: 0 }` without calling OpenAI
- Edge case: `language: "th"` → pros/cons returned in Thai
- Error path: OpenAI API key missing → returns 500 with `{ error: "AI service unavailable" }`
- Error path: OpenAI rate limit hit → returns 503 with retry-after header
- Error path: malformed request body → returns 400

**Verification:**
- `POST /api/summarize` with sample reviews returns correct JSON shape
- Second call with same productId within 24h does NOT trigger another OpenAI call (verify via Supabase row `cached_at` unchanged)
- Unit tests pass

---

- U5. **Price Comparison API Route**

**Goal:** Build the `/api/prices` endpoint that fetches price data from a third-party API for a given product ID and store.

**Requirements:** R3

**Dependencies:** U2, U3

**Files:**
- Create: `website/src/app/api/prices/route.ts`
- Create: `website/src/lib/price-api.ts`
- Test: `website/src/app/api/prices/route.test.ts`

**Approach:**
- `GET /api/prices?productId=X&store=amazon|shopee|lazada` 
- `price-api.ts` wraps the chosen third-party API (abstracted behind an interface so the API provider can be swapped)
- Returns `[{ store: string, price: number, currency: string, affiliateUrl: string, available: boolean }]`
- Affiliate URLs generated by appending affiliate tag to the direct product URL (Amazon Associates tag, Shopee/Lazada affiliate IDs)
- Cache results in `price_history` table (5-minute TTL — prices change more frequently than reviews)
- Graceful degradation: if price API is unavailable, return what's cached or an empty array with `{ partialResults: true }`

**Patterns to follow:**
- Same `route.ts` pattern as U4

**Test scenarios:**
- Happy path: valid Amazon ASIN → returns price from Amazon + at least one comparison store
- Happy path: cached price (< 5 min old) → returns cached data without calling external API
- Edge case: product not found on comparison store → that store entry has `available: false`
- Error path: price API key invalid → returns 502 + cached data if available
- Error path: unknown store param → returns 400

**Verification:**
- `GET /api/prices?productId=B08N5WRWNW&store=amazon` returns price array
- Affiliate URLs contain correct affiliate tags

---

- U6. **Product Detail Page (Website)**

**Goal:** Build the `/product/[id]` page on the companion website that displays the full product comparison — review summary, price table, and affiliate links — with AdSense placements.

**Requirements:** R4, R5

**Dependencies:** U3, U4, U5

**Files:**
- Create: `website/src/app/product/[id]/page.tsx`
- Create: `website/src/components/ReviewSummaryCard.tsx`
- Create: `website/src/components/PriceComparisonTable.tsx`
- Create: `website/src/components/AffiliateButton.tsx`

**Approach:**
- Server Component fetches product data from Supabase + calls summarize/prices APIs server-side (avoids client waterfall)
- Page layout: product title → AI Review Summary card (pros/cons in styled lists) → Price Comparison table → AdSense banner → Affiliate CTA buttons
- `AffiliateButton` wraps affiliate URL and tracks clicks (UTM params in URL)
- AdSense placements: above-the-fold banner (728×90), in-content rectangle (336×280), sidebar (160×600 on desktop)
- Open Graph meta tags for social sharing
- Structured data (JSON-LD) for SEO: `Product` schema with price and review aggregate

**Patterns to follow:**
- Next.js Server Component data fetching pattern (async page component)
- shadcn/ui Card, Table, Button components

**Test scenarios:**
- Happy path: valid product ID → page renders with summary + prices + affiliate buttons
- Edge case: product ID not in Supabase → triggers fresh API calls; page still renders (may show loading state)
- Edge case: no prices available → Price Comparison section shows "Checking prices…" or "Prices unavailable"
- Happy path: affiliate button click → navigates to affiliate URL (verify UTM params present)

**Verification:**
- `/product/B08N5WRWNW` renders without errors in browser
- View source shows JSON-LD structured data
- Affiliate URLs contain correct tracking parameters

---

- U7. **Google AdSense + Affiliate Program Setup**

**Goal:** Integrate Google AdSense script into the website and configure affiliate link generation for Amazon Associates, Shopee Affiliate, and Lazada Affiliate.

**Requirements:** R5

**Dependencies:** U3, U6

**Files:**
- Modify: `website/src/app/layout.tsx` (add AdSense script)
- Create: `website/src/lib/affiliate.ts` (affiliate URL builder per store)
- Create: `website/src/components/AdSenseUnit.tsx`

**Approach:**
- AdSense: add `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js">` in root layout; use `AdSenseUnit` client component for each ad placement (client component needed because AdSense requires `useEffect` to initialize)
- `affiliate.ts` exports `buildAffiliateUrl(store, productUrl, productId)` — appends store-specific affiliate parameters
  - Amazon: append `?tag=AFFILIATE_TAG`
  - Shopee: use Shopee Affiliate deep link API
  - Lazada: use Lazada Affiliate link generator
- Affiliate IDs stored as environment variables, never hardcoded

**Patterns to follow:**
- Next.js `"use client"` pattern for components requiring browser APIs

**Test scenarios:**
- Test expectation: none for AdSense rendering (requires browser + real AdSense account)
- Happy path: `buildAffiliateUrl("amazon", url, asin)` → URL contains `tag=` param
- Happy path: `buildAffiliateUrl("shopee", url, itemId)` → Shopee affiliate deep link format
- Edge case: unknown store → returns original URL unchanged (no crash)

**Verification:**
- AdSense script present in page HTML (verify in browser dev tools)
- Affiliate URLs correctly formatted for each store (unit tests)

---

- U8. **Chrome Extension Scaffold (MV3 + React + Vite)**

**Goal:** Set up the Chrome Extension with Manifest V3, React popup, content script, and service worker, bundled via Vite with `crxjs/vite-plugin`.

**Requirements:** R1 (foundation for extension features)

**Dependencies:** U1

**Files:**
- Create: `extension/manifest.json`
- Create: `extension/vite.config.ts`
- Create: `extension/src/popup/index.html`
- Create: `extension/src/popup/main.tsx`
- Create: `extension/src/popup/App.tsx`
- Create: `extension/src/content/index.ts`
- Create: `extension/src/background/service-worker.ts`

**Approach:**
- `manifest.json` declares:
  - `manifest_version: 3`
  - `action` (popup): `popup/index.html`
  - `content_scripts`: runs on `*://*.amazon.com/dp/*`, `*://*.shopee.th/*`, `*://*.lazada.co.th/*`
  - `background.service_worker`: `background/service-worker.js`
  - `permissions`: `["activeTab", "storage"]`
  - `host_permissions`: companion website URL (for fetch from content script)
- Vite + `@crxjs/vite-plugin` handles asset pipeline, injects correct script references into manifest
- Popup `App.tsx` has three states: `idle` (no product page), `loading`, `results` — renders placeholder for now
- Content script is a minimal stub that detects URL pattern and sends a ping to the popup

**Patterns to follow:**
- `crxjs/vite-plugin` documentation patterns for MV3

**Test scenarios:**
- Test expectation: none — scaffolding; verified by loading unpacked extension in Chrome
- Happy path: `npm run build` in `extension/` produces `dist/` folder with valid manifest

**Verification:**
- Load unpacked `dist/` in `chrome://extensions` — extension loads without errors
- Clicking extension icon on any page shows the popup (even if it's a placeholder UI)

---

- U9. **Content Script: Product Page Detection**

**Goal:** Implement the content script that detects when the user is on a supported product page, extracts product data (title, ID, reviews), and sends it to the popup.

**Requirements:** R1, R2 (provides data for AI summary)

**Dependencies:** U8

**Files:**
- Modify: `extension/src/content/index.ts`
- Create: `extension/src/content/extractors/amazon.ts`
- Create: `extension/src/content/extractors/shopee.ts`
- Create: `extension/src/content/extractors/lazada.ts`
- Create: `extension/src/content/types.ts`

**Approach:**
- Each extractor exports `extract(): ProductData | null` — reads DOM selectors specific to that store and returns structured data
- `ProductData` type: `{ store, productId, title, reviews: string[], productUrl }`
- Main `index.ts` detects which store based on `window.location.hostname`, calls the right extractor
- Sends result via `chrome.runtime.sendMessage({ type: "PRODUCT_DATA", payload: productData })`
- Resilient selectors: try primary selector, fall back to secondary; if both fail, return `null` (popup shows "Could not read this page")
- Re-runs on SPA navigation: listens for `popstate` + MutationObserver on `<title>` to handle dynamic route changes (Shopee/Lazada are SPAs)

**Patterns to follow:**
- MV3 content script messaging pattern (`chrome.runtime.sendMessage`)

**Test scenarios:**
- Happy path (Amazon): script on `/dp/B08N5WRWNW` page → extracts ASIN, title, up to 10 reviews
- Happy path (Shopee): script on Shopee product page → extracts itemid and title
- Edge case: page structure changed (selector returns null) → sends `{ type: "PRODUCT_DATA", payload: null }` gracefully
- Edge case: SPA navigation to new product → re-extracts and sends updated data
- Edge case: product page with no reviews → sends empty reviews array (not null)

**Verification:**
- On an Amazon product page, opening the popup shows the correct product title
- On a non-product page (Amazon homepage), popup shows "Open a product page to get started"

---

- U10. **Extension Popup UI**

**Goal:** Build the full React popup UI that receives product data from the content script, calls the companion website API, and renders the AI review summary and price comparison.

**Requirements:** R2, R3

**Dependencies:** U8, U9, U4, U5

**Files:**
- Modify: `extension/src/popup/App.tsx`
- Create: `extension/src/popup/components/ReviewSummaryCard.tsx`
- Create: `extension/src/popup/components/PriceComparisonRow.tsx`
- Create: `extension/src/popup/components/LoadingState.tsx`
- Create: `extension/src/popup/components/ErrorState.tsx`
- Create: `extension/src/popup/hooks/useProductData.ts`
- Create: `extension/src/popup/api.ts` (fetch wrapper for companion website API)

**Approach:**
- `useProductData` hook: listens for `chrome.runtime.onMessage` for `PRODUCT_DATA`; also requests active tab's data on mount via `chrome.tabs.sendMessage`
- On receiving `productData`: fires parallel fetches to `POST {SITE_URL}/api/summarize` and `GET {SITE_URL}/api/prices`
- `NEXT_PUBLIC_SITE_URL` baked into extension bundle at build time via Vite `define`
- Popup dimensions: fixed 380×520px (Chrome popup constraint)
- Layout: product title (truncated) → "AI Review Summary" section (pros ✓ / cons ✗) → "Price Comparison" list → "View full details →" link to companion website product page
- All text is 14px minimum for legibility; use Tailwind utility classes

**Patterns to follow:**
- React hooks for async data fetching with loading/error states
- Tailwind CSS for styling (same config as website for consistency)

**Test scenarios:**
- Happy path: popup opens on Amazon product page → shows loading → renders summary + prices within 3s
- Happy path: "View full details" link → opens `/product/[id]` on companion website in new tab
- Edge case: not on a product page → shows friendly "Open an Amazon, Shopee, or Lazada product page" message
- Edge case: API call fails (no internet) → shows error state with retry button
- Edge case: product has no reviews → summary shows "Not enough reviews to summarize"

**Verification:**
- Popup on Amazon product page shows AI summary and at least one price comparison within 5 seconds
- Popup on Google homepage shows the empty state message

---

- U11. **Vercel Deployment + Chrome Web Store Prep**

**Goal:** Deploy the companion website to Vercel with production environment variables and prepare the Chrome extension for Web Store submission.

**Requirements:** All (deployment makes everything live)

**Dependencies:** U1–U10

**Files:**
- Create: `website/vercel.json` (optional — configure headers for CORS)
- Create: `extension/store-assets/` (screenshots, promotional tile, description text)
- Modify: `website/next.config.ts` (add CORS headers for `/api/*` routes to allow extension origin)

**Approach:**
- **Website deployment:**
  - Push `website/` to Vercel via GitHub integration (automatic deploys on push)
  - Set production env vars in Vercel dashboard: `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PRICE_API_KEY`, `AMAZON_AFFILIATE_TAG`, `SHOPEE_AFFILIATE_ID`, `LAZADA_AFFILIATE_ID`
  - Add CORS headers on `/api/*` to allow requests from the Chrome extension (`chrome-extension://EXTENSION_ID`)
  - Apply for Google AdSense — requires site to be live with real content
- **Extension submission:**
  - Run `npm run build` in `extension/` to produce production bundle
  - Create 5 store screenshots (1280×800 or 640×400) showing popup on product pages
  - Write Chrome Web Store listing: title, description (140 chars short + 5000 chars detailed), privacy policy URL
  - Upload ZIP to Chrome Web Store developer dashboard
  - Set pricing: Free
  - Category: Shopping

**Patterns to follow:**
- Vercel deployment via Git integration (zero-config for Next.js)

**Test scenarios:**
- Test expectation: none — deployment; verified manually
- Happy path: `https://your-domain.vercel.app/product/[id]` renders in production
- Happy path: extension installed from Chrome Web Store → popup works on Amazon product page

**Verification:**
- Website live on Vercel with no build errors
- All environment variables set (check via `/api/health` returning 200)
- Extension ZIP uploads to Web Store without manifest errors
- CORS: extension can call website API from within Chrome (test in production)

---

## System-Wide Impact

- **Interaction graph:** Content script → popup via `chrome.runtime.sendMessage`; popup → Next.js API routes via `fetch`; API routes → Supabase (cache) + OpenAI + price API
- **Error propagation:** Any API failure should degrade gracefully — popup always shows something (cached data, partial results, or a friendly error), never a blank white screen
- **State lifecycle risks:** Supabase cache TTL enforced at query time (not row deletion) — stale rows accumulate over time; add a cleanup job in a future iteration
- **API surface parity:** The `/api/summarize` and `/api/prices` endpoints are also used by the website's own product page (U6) — changes to response shape affect both consumers
- **Integration coverage:** Extension ↔ website API communication must be tested in a real Chrome environment, not just unit tests

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Chrome Web Store review takes 1-3 weeks | Submit extension early; website can launch independently to start earning AdSense |
| Google AdSense approval requires "sufficient content" | Publish website with at least 10 product detail pages before applying |
| Third-party price API discontinues or raises prices | Abstract behind `price-api.ts` interface; can swap provider or build scraper without touching API route |
| OpenAI costs spike at scale | Supabase cache (24h TTL) reduces calls by ~80% for popular products; monitor via OpenAI usage dashboard |
| Shopee/Lazada DOM structure changes break content script | Use resilient fallback selectors; add a "report broken page" button in popup to collect failures |
| Chrome extension CSP blocks inline scripts | MV3 requires all scripts to be in separate files — Vite + crxjs handles this; do not use `eval` or inline scripts |
| Affiliate program approval (Amazon Associates requires sales within 180 days) | Sign up for Amazon Associates early; Shopee/Lazada affiliate programs typically approve faster |

---

## Documentation / Operational Notes

- **Environment variables:** Document all required env vars in `README.md` and `.env.example` before sharing the repo
- **AdSense:** Apply for AdSense immediately after website goes live — approval takes 1-4 weeks
- **Affiliate programs:** Apply to Amazon Associates, Shopee Affiliate, Lazada Affiliate before building U5/U7 to have real affiliate tags ready
- **Monitoring:** Set up Vercel Analytics (free tier) from day one to track website traffic; watch OpenAI usage dashboard weekly
- **Extension updates:** Chrome Web Store requires re-submission for every manifest or permission change — plan permission set carefully in U8 to avoid re-review cycles

---

## Sources & References

- **Origin document:** [docs/brainstorms/ai-deal-finder-requirements.md](docs/brainstorms/ai-deal-finder-requirements.md)
- Chrome Extension MV3: https://developer.chrome.com/docs/extensions/develop/migrate
- crxjs/vite-plugin: https://crxjs.dev/vite-plugin
- Next.js App Router: https://nextjs.org/docs/app
- Supabase + Next.js SSR: https://supabase.com/docs/guides/auth/server-side/nextjs
- OpenAI pricing (GPT-4o-mini): https://openai.com/api/pricing/
