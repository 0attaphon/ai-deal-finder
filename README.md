# AI Deal Finder

Chrome Extension + Companion Website that gives shoppers instant AI-powered review summaries and price comparisons on Amazon, Shopee, and Lazada.

**Revenue model:** Google AdSense + Affiliate commissions (Amazon Associates, Shopee Affiliate, Lazada Affiliate)

---

## Project Structure

```
ai-deal-finder/
├── extension/     # Chrome Extension (Manifest V3 + React + Vite)
└── website/       # Next.js 15 companion website (AdSense + Affiliate)
```

---

## Quick Start

### 1. Clone and install dependencies

```bash
git clone https://github.com/ple41080/ai-deal-finder.git
cd ai-deal-finder
npm install
```

### 2. Set up environment variables

```bash
cp .env.example website/.env.local
# Fill in your API keys in website/.env.local
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in SQL Editor:
   ```
   website/supabase/migrations/001_initial_schema.sql
   ```
3. Copy your project URL and keys to `.env.local`

### 4. Run the website locally

```bash
npm run dev:website
# → http://localhost:3000
```

### 5. Build and load the extension

```bash
# Add VITE_SITE_URL=http://localhost:3000 to extension/.env.local
npm run build:extension
# Load extension/dist/ as unpacked extension in chrome://extensions
```

---

## Environment Variables

See `.env.example` for all required variables.

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key (server-side only) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `PRICE_API_KEY` | RapidAPI key for price comparison |
| `AMAZON_AFFILIATE_TAG` | Amazon Associates tag |
| `SHOPEE_AFFILIATE_ID` | Shopee Affiliate ID |
| `LAZADA_AFFILIATE_ID` | Lazada Affiliate ID |
| `NEXT_PUBLIC_SITE_URL` | Deployed website URL |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Google AdSense publisher ID |

---

## Deployment

### Website → Vercel

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy — done!

### Extension → Chrome Web Store

```bash
npm run build:extension
# Zip extension/dist/ and upload to Chrome Web Store Developer Dashboard
```

---

## Revenue Setup Checklist

- [ ] Apply for [Amazon Associates](https://affiliate-program.amazon.com/)
- [ ] Apply for [Shopee Affiliate](https://affiliate.shopee.co.th/)
- [ ] Apply for [Lazada Affiliate](https://affiliate.lazada.co.th/)
- [ ] Apply for [Google AdSense](https://www.google.com/adsense/) after website goes live
- [ ] Find price comparison API on [RapidAPI](https://rapidapi.com/search/price-comparison)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Extension | Chrome MV3, React 18, Tailwind CSS, Vite + crxjs |
| Website | Next.js 15 (App Router), Tailwind CSS, shadcn/ui |
| Database | Supabase (PostgreSQL) |
| AI | OpenAI GPT-4o-mini |
| Deploy | Vercel (website) + Chrome Web Store (extension) |
