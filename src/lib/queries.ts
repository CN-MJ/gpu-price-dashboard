import { ensureData } from "./collect";
import { sql } from "./db";
import type { Category } from "./catalog";

export type ProductRow = {
  id: string;
  category: Category;
  brand: string;
  model: string;
  specs: string;
  min_price_cents: number | null;
  platform: string | null;
  shop_name: string | null;
  yesterday_price_cents: number | null;
  is_demo: boolean | null;
};

export type OfferRow = {
  id: string;
  platform: string;
  shop_name: string;
  price_cents: number;
  url: string;
  in_stock: boolean;
  scraped_at: string;
  is_demo: boolean;
};

export type SnapshotRow = {
  snapshot_date: string;
  min_price_cents: number;
  platform: string;
  shop_name: string;
};

export type PlatformSnapshotRow = {
  snapshot_date: string;
  platform: string;
  min_price_cents: number;
  shop_name: string;
};

export type PlatformCompareRow = {
  platform: string;
  min_price_cents: number;
  shop_name: string;
  offer_count: number;
};

export type NewsRow = {
  id: string;
  title: string;
  source: string;
  region: "domestic" | "international";
  url: string;
  published_at: string;
  summary: string;
};

export type ProductDetail = {
  id: string;
  category: Category;
  brand: string;
  model: string;
  specs: string;
};

export async function listProductsByCategory(
  category?: Category,
): Promise<ProductRow[]> {
  await ensureData();
  const params: unknown[] = [];
  let where = "";
  if (category) {
    params.push(category);
    where = `where p.category = $1`;
  }
  return sql<ProductRow>(
    `select
       p.id, p.category, p.brand, p.model, p.specs,
       o.min_price_cents, o.platform, o.shop_name, o.is_demo,
       y.min_price_cents as yesterday_price_cents
     from products p
     left join lateral (
       select price_cents as min_price_cents, platform, shop_name, is_demo
       from offers
       where product_id = p.id and in_stock = true
       order by price_cents asc
       limit 1
     ) o on true
     left join lateral (
       select min_price_cents
       from price_snapshots
       where product_id = p.id
         and snapshot_date = (current_date - interval '1 day')
       limit 1
     ) y on true
     ${where}
     order by p.category, o.min_price_cents nulls last, p.brand, p.model`,
    params,
  );
}

export async function getProduct(id: string): Promise<ProductDetail | null> {
  await ensureData();
  const rows = await sql<ProductDetail>(
    `select id, category, brand, model, specs from products where id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function listOffers(productId: string): Promise<OfferRow[]> {
  await ensureData();
  return sql<OfferRow>(
    `select id, platform, shop_name, price_cents, url, in_stock, scraped_at::text, is_demo
     from offers
     where product_id = $1
     order by price_cents asc`,
    [productId],
  );
}

export async function listSnapshots(
  productId: string,
): Promise<SnapshotRow[]> {
  await ensureData();
  return sql<SnapshotRow>(
    `select snapshot_date::text, min_price_cents, platform, shop_name
     from price_snapshots
     where product_id = $1
     order by snapshot_date asc`,
    [productId],
  );
}

/** Daily per-platform lows for multi-line price curves. */
export async function listPlatformSnapshots(
  productId: string,
): Promise<PlatformSnapshotRow[]> {
  await ensureData();
  return sql<PlatformSnapshotRow>(
    `select snapshot_date::text, platform, min_price_cents, shop_name
     from platform_snapshots
     where product_id = $1
     order by snapshot_date asc, platform asc`,
    [productId],
  );
}

/** Today's best price per platform (from current offers). */
export async function listPlatformCompare(
  productId: string,
): Promise<PlatformCompareRow[]> {
  await ensureData();
  const offers = await listOffers(productId);
  const map = new Map<string, PlatformCompareRow>();
  for (const o of offers.filter((x) => x.in_stock)) {
    const cur = map.get(o.platform);
    if (!cur) {
      map.set(o.platform, {
        platform: o.platform,
        min_price_cents: o.price_cents,
        shop_name: o.shop_name,
        offer_count: 1,
      });
      continue;
    }
    cur.offer_count += 1;
    if (o.price_cents < cur.min_price_cents) {
      cur.min_price_cents = o.price_cents;
      cur.shop_name = o.shop_name;
    }
  }
  return [...map.values()].sort(
    (a, b) => a.min_price_cents - b.min_price_cents,
  );
}

export async function listNews(
  region?: "domestic" | "international",
): Promise<NewsRow[]> {
  await ensureData();
  if (region) {
    return sql<NewsRow>(
      `select id, title, source, region, url, published_at::text, summary
       from news_items where region = $1
       order by published_at desc`,
      [region],
    );
  }
  return sql<NewsRow>(
    `select id, title, source, region, url, published_at::text, summary
     from news_items
     order by published_at desc`,
  );
}

export async function getHighlights(limit = 6): Promise<ProductRow[]> {
  const all = await listProductsByCategory();
  return all
    .filter((p) => p.min_price_cents != null)
    .sort((a, b) => {
      const da =
        (a.yesterday_price_cents ?? a.min_price_cents!) - a.min_price_cents!;
      const db =
        (b.yesterday_price_cents ?? b.min_price_cents!) - b.min_price_cents!;
      return db - da;
    })
    .slice(0, limit);
}

export async function getDataStatus() {
  const status = await ensureData();
  return status;
}
