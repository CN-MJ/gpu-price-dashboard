-- Per-platform daily lows (same-day recollect overwrites via unique key)
create table if not exists platform_snapshots (
  id text primary key,
  product_id text not null references products(id),
  snapshot_date date not null,
  platform text not null,
  min_price_cents integer not null check (min_price_cents > 0),
  shop_name text not null default '',
  unique (product_id, snapshot_date, platform)
);

create index if not exists platform_snapshots_product_date_idx
  on platform_snapshots(product_id, snapshot_date desc);
