import type { CatalogProduct } from "../../catalog";
import { politeFetch, yuanToCents } from "../http";
import { searchQuery, titleMatchesProduct } from "../match";
import type { LiveOffer, PlatformId } from "../types";

type SmzdmRow = {
  article_id?: string;
  article_title?: string;
  article_price?: string;
  article_mall?: string;
  article_url?: string;
  article_is_sold_out?: string | number | boolean;
};

const MALL_MAP: Array<{ needle: RegExp; platform: PlatformId; shop: string }> = [
  { needle: /京东/, platform: "jd", shop: "京东（什么值得买公开源）" },
  { needle: /天猫|喵/, platform: "tmall", shop: "天猫（什么值得买公开源）" },
  { needle: /淘宝/, platform: "taobao", shop: "淘宝（什么值得买公开源）" },
  { needle: /拼多多|多多/, platform: "pdd", shop: "拼多多（什么值得买公开源）" },
];

function mapMall(mall: string): { platform: PlatformId; shop: string } | null {
  for (const rule of MALL_MAP) {
    if (rule.needle.test(mall)) return { platform: rule.platform, shop: rule.shop };
  }
  return null;
}

/**
 * Public SMZDM list API — aggregates deal posts attributed to major malls.
 * Not a partner API; rate-limited GET of a documented-style public JSON feed.
 * Used when direct JD/Tmall/PDD/Taobao HTML is blocked.
 */
export async function crawlSmzdm(
  products: CatalogProduct[],
): Promise<{ offers: LiveOffer[]; detail: string; status: "ok" | "blocked" | "error" | "empty" }> {
  const offers: LiveOffer[] = [];
  let lastError = "";
  let pagesOk = 0;

  // Cap products to keep crawl polite (full catalog ~36; still ok with 0.9s gap).
  for (const product of products) {
    const q = searchQuery(product);
    const url = `https://api.smzdm.com/v1/list?keyword=${encodeURIComponent(q)}&source_id=1`;
    try {
      const res = await politeFetch(url, {
        headers: { Accept: "application/json" },
      });
      const text = await res.text();
      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
        continue;
      }
      if (/probe\.js|captcha|access denied/i.test(text.slice(0, 500))) {
        return {
          offers,
          detail: "SMZDM blocked or challenged this client IP",
          status: "blocked",
        };
      }
      let data: { error_code?: string | number; data?: { rows?: SmzdmRow[] } };
      try {
        data = JSON.parse(text) as typeof data;
      } catch {
        lastError = "invalid JSON";
        continue;
      }
      const rows = data.data?.rows ?? [];
      pagesOk += 1;
      const perProduct: LiveOffer[] = [];
      for (const row of rows) {
        const title = row.article_title || "";
        const mall = row.article_mall || "";
        const mapped = mapMall(mall);
        if (!mapped) continue;
        if (!titleMatchesProduct(title, product)) continue;
        const cents = yuanToCents(row.article_price || "");
        if (!cents) continue;
        const soldOut =
          row.article_is_sold_out === true ||
          row.article_is_sold_out === 1 ||
          row.article_is_sold_out === "1";
        perProduct.push({
          productId: product.id,
          platform: mapped.platform,
          shopName: mapped.shop,
          priceCents: cents,
          url:
            row.article_url ||
            (row.article_id
              ? `https://www.smzdm.com/p/${row.article_id}/`
              : `https://search.smzdm.com/?c=home&s=${encodeURIComponent(q)}`),
          inStock: !soldOut,
          source: "smzdm",
        });
      }
      // Keep cheapest few per platform for this product
      const byPlatform = new Map<PlatformId, LiveOffer[]>();
      for (const o of perProduct) {
        const list = byPlatform.get(o.platform) ?? [];
        list.push(o);
        byPlatform.set(o.platform, list);
      }
      for (const list of byPlatform.values()) {
        list
          .sort((a, b) => a.priceCents - b.priceCents)
          .slice(0, 3)
          .forEach((o) => offers.push(o));
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  if (offers.length > 0) {
    return {
      offers,
      detail: `parsed ${offers.length} mall-attributed deals from public SMZDM list API (${pagesOk} queries ok)`,
      status: "ok",
    };
  }
  if (pagesOk === 0) {
    return {
      offers,
      detail: lastError || "SMZDM unreachable",
      status: "error",
    };
  }
  return {
    offers,
    detail: "SMZDM reachable but no catalog-matching mall deals",
    status: "empty",
  };
}
