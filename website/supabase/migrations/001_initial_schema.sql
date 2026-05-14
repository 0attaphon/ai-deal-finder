-- AI Deal Finder — Initial Schema
-- Run this in Supabase SQL Editor or via: supabase db push

create table if not exists products (
  id          text primary key,             -- ASIN / shopee-itemId / lazada itemId
  title       text,
  store       text not null,                -- 'amazon' | 'shopee' | 'lazada'
  url         text,
  created_at  timestamptz default now()
);

create table if not exists review_summaries (
  id               bigserial primary key,
  product_id       text not null references products(id) on delete cascade,
  language         text not null default 'en',   -- 'en' | 'th'
  pros             jsonb not null default '[]',
  cons             jsonb not null default '[]',
  confidence_score float not null default 0,
  cached_at        timestamptz default now(),
  unique (product_id, language)
);

create table if not exists price_history (
  id           bigserial primary key,
  product_id   text not null references products(id) on delete cascade,
  store        text not null,
  price        numeric(12, 2) not null,
  currency     text not null default 'THB',
  affiliate_url text,
  checked_at   timestamptz default now()
);

-- Index for fast cache lookups
create index if not exists idx_review_summaries_product_lang
  on review_summaries (product_id, language, cached_at desc);

create index if not exists idx_price_history_product_checked
  on price_history (product_id, checked_at desc);
