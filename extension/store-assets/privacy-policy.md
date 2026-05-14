# Privacy Policy — AI Deal Finder

*Last updated: May 14, 2026*

## What data we collect

AI Deal Finder reads the following information **only from product pages** you visit on Amazon, Shopee, and Lazada:

- Product title
- Product ID (e.g. Amazon ASIN)
- Customer review text visible on the page
- Product page URL

**We do NOT collect:**
- Your browsing history on other sites
- Personal information (name, email, address)
- Payment information
- Login credentials

## How we use the data

Product information is sent to our server (hosted on Vercel) to:
1. Generate an AI-powered review summary using OpenAI
2. Fetch price comparison data

Results are cached for 24 hours to reduce API costs. Cached data is stored in our database (Supabase) by product ID only — not linked to any user identity.

## Third-party services

- **OpenAI**: Review text is sent to OpenAI's API to generate summaries. See [OpenAI Privacy Policy](https://openai.com/privacy).
- **Vercel**: Our API is hosted on Vercel. See [Vercel Privacy Policy](https://vercel.com/legal/privacy-policy).
- **Supabase**: Database for caching results. See [Supabase Privacy Policy](https://supabase.com/privacy).

## Affiliate links

Product links on our website may contain affiliate tracking codes. Clicking these earns us a small commission at no extra cost to you.

## Contact

For privacy concerns: [your-email@domain.com]
