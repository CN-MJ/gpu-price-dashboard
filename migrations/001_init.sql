create table if not exists products (
  id text primary key,
  category text not null check (category in ('gpu', 'ram', 'storage', 'cpu')),
  brand text not null,
  model text not null,
  specs text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists offers (
  id text primary key,
  product_id text not null references products(id),
  platform text not null,
  shop_name text not null,
  price_cents integer not null check (price_cents > 0),
  url text not null default '',
  in_stock boolean not null default true,
  scraped_at timestamptz not null default now(),
  is_demo boolean not null default true
);

create index if not exists offers_product_id_idx on offers(product_id);
create index if not exists offers_price_idx on offers(product_id, price_cents);

create table if not exists price_snapshots (
  id text primary key,
  product_id text not null references products(id),
  snapshot_date date not null,
  min_price_cents integer not null check (min_price_cents > 0),
  platform text not null,
  shop_name text not null,
  unique (product_id, snapshot_date)
);

create index if not exists price_snapshots_product_date_idx
  on price_snapshots(product_id, snapshot_date desc);

create table if not exists news_items (
  id text primary key,
  title text not null,
  source text not null,
  region text not null check (region in ('domestic', 'international')),
  url text not null,
  published_at timestamptz not null,
  summary text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists news_items_published_idx on news_items(published_at desc);

create table if not exists app_meta (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
