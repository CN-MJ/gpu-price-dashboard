import type { CatalogProduct } from "../../catalog";
import { politeFetch, looksBlocked, yuanToCents } from "../http";
import { searchQuery, titleMatchesProduct } from "../match";
import type { LiveOffer, PlatformFetchStatus, PlatformId } from "../types";

type DirectTarget = {
  platform: PlatformId;
  buildUrl: (q: string) => string;
  parse: (html: string, product: CatalogProduct) => LiveOffer[];
};

function parseJdLike(html: string, product: CatalogProduct, platform: PlatformId): LiveOffer[] {
  const offers: LiveOffer[] = [];
  // Classic JD search cards: data-sku + data-price
  const cardRe =
    /data-sku="(\d+)"[\s\S]{0,1200}?data-price="([\d.]+)"[\s\S]{0,800}?(?:title="([^"]+)"|em>([^<]+)<)/gi;
  let m: RegExpExecArray | null;
  while ((m = cardRe.exec(html)) && offers.length < 6) {
    const sku = m[1];
    const cents = yuanToCents(m[2]);
    const title = (m[3] || m[4] || "").replace(/\s+/g, " ").trim();
    if (!cents || !title || !titleMatchesProduct(title, product)) continue;
    offers.push({
      productId: product.id,
      platform,
      shopName: "京东自营/旗舰（公开搜索）",
      priceCents: cents,
      url: `https://item.jd.com/${sku}.html`,
      inStock: true,
      source: "direct",
    });
  }

  // Embedded JSON fragments sometimes present on older templates
  const jsonPriceRe =
    /"wareId"\s*:\s*"?(\d+)"?[\s\S]{0,400}?"(?:jdPrice|price)"\s*:\s*"?([\d.]+)"?[\s\S]{0,400}?"(?:wname|wareName|content)"\s*:\s*"([^"]+)"/gi;
  while ((m = jsonPriceRe.exec(html)) && offers.length < 6) {
    const cents = yuanToCents(m[2]);
    const title = m[3].replace(/\\u[\da-f]{4}/gi, (u) =>
      String.fromCharCode(parseInt(u.slice(2), 16)),
    );
    if (!cents || !titleMatchesProduct(title, product)) continue;
    offers.push({
      productId: product.id,
      platform,
      shopName: "京东公开搜索",
      priceCents: cents,
      url: `https://item.jd.com/${m[1]}.html`,
      inStock: true,
      source: "direct",
    });
  }
  return dedupe(offers);
}

function parseTaobaoLike(
  html: string,
  product: CatalogProduct,
  platform: PlatformId,
): LiveOffer[] {
  const offers: LiveOffer[] = [];
  // Legacy g_page_config JSON blob
  const cfg = html.match(/g_page_config\s*=\s*(\{[\s\S]*?\});/);
  if (cfg) {
    try {
      const data = JSON.parse(cfg[1]) as {
        mods?: {
          itemlist?: {
            data?: {
              auctions?: Array<{
                nid?: string;
                raw_title?: string;
                title?: string;
                view_price?: string;
                nick?: string;
                detail_url?: string;
              }>;
            };
          };
        };
      };
      const auctions = data.mods?.itemlist?.data?.auctions ?? [];
      for (const a of auctions.slice(0, 8)) {
        const title = (a.raw_title || a.title || "").replace(/<[^>]+>/g, "");
        const cents = yuanToCents(a.view_price || "");
        if (!cents || !titleMatchesProduct(title, product)) continue;
        const id = a.nid || "";
        offers.push({
          productId: product.id,
          platform,
          shopName: a.nick || (platform === "tmall" ? "天猫店铺" : "淘宝店铺"),
          priceCents: cents,
          url:
            a.detail_url ||
            (id
              ? `https://item.taobao.com/item.htm?id=${id}`
              : `https://s.taobao.com/search?q=${encodeURIComponent(product.model)}`),
          inStock: true,
          source: "direct",
        });
      }
    } catch {
      // ignore JSON parse errors
    }
  }
  return dedupe(offers);
}

function parsePddLike(html: string, product: CatalogProduct): LiveOffer[] {
  const offers: LiveOffer[] = [];
  // Try window.rawData / __NEXT_DATA__ style blobs
  const blobs = [
    ...html.matchAll(/<script[^>]*>\s*window\.rawData\s*=\s*(\{[\s\S]*?\});\s*<\/script>/gi),
    ...html.matchAll(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/gi),
  ];
  for (const blob of blobs) {
    try {
      const json = JSON.parse(blob[1]) as unknown;
      walkJson(json, (obj) => {
        if (offers.length >= 6) return;
        const title = String(obj.goodsName || obj.goods_name || obj.goodsDesc || "");
        const priceRaw =
          obj.price ?? obj.min_group_price ?? obj.groupPrice ?? obj.normalPrice;
        const cents = yuanToCents(
          typeof priceRaw === "number" && priceRaw > 1000
            ? priceRaw / 100
            : String(priceRaw ?? ""),
        );
        const goodsId = obj.goodsId || obj.goods_id || obj.goodsID;
        if (!title || !cents || !titleMatchesProduct(title, product)) return;
        offers.push({
          productId: product.id,
          platform: "pdd",
          shopName: String(obj.mallName || obj.mall_name || "拼多多店铺"),
          priceCents: cents,
          url: goodsId
            ? `https://mobile.yangkeduo.com/goods.html?goods_id=${goodsId}`
            : `https://mobile.yangkeduo.com/search_result.html?search_key=${encodeURIComponent(product.model)}`,
          inStock: true,
          source: "direct",
        });
      });
    } catch {
      // ignore
    }
  }
  return dedupe(offers);
}

function walkJson(
  node: unknown,
  visit: (obj: Record<string, unknown>) => void,
): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) walkJson(item, visit);
    return;
  }
  const obj = node as Record<string, unknown>;
  visit(obj);
  for (const v of Object.values(obj)) walkJson(v, visit);
}

function dedupe(offers: LiveOffer[]): LiveOffer[] {
  const seen = new Set<string>();
  return offers.filter((o) => {
    const key = `${o.platform}:${o.priceCents}:${o.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const TARGETS: DirectTarget[] = [
  {
    platform: "jd",
    buildUrl: (q) =>
      `https://search.jd.com/Search?keyword=${encodeURIComponent(q)}&enc=utf-8`,
    parse: (html, product) => parseJdLike(html, product, "jd"),
  },
  {
    platform: "tmall",
    buildUrl: (q) =>
      `https://list.tmall.com/search_product.htm?q=${encodeURIComponent(q)}`,
    parse: (html, product) => parseTaobaoLike(html, product, "tmall"),
  },
  {
    platform: "taobao",
    buildUrl: (q) =>
      `https://s.taobao.com/search?q=${encodeURIComponent(q)}`,
    parse: (html, product) => parseTaobaoLike(html, product, "taobao"),
  },
  {
    platform: "pdd",
    buildUrl: (q) =>
      `https://mobile.yangkeduo.com/search_result.html?search_key=${encodeURIComponent(q)}`,
    parse: (html, product) => parsePddLike(html, product),
  },
];

/**
 * Probe each platform once with a representative query to classify
 * blocked vs parsable, then optionally crawl all products if ok.
 */
export async function crawlDirectPlatforms(
  products: CatalogProduct[],
): Promise<{
  offers: LiveOffer[];
  platforms: Record<PlatformId, PlatformFetchStatus>;
}> {
  const platforms = {
    jd: emptyStatus(),
    tmall: emptyStatus(),
    pdd: emptyStatus(),
    taobao: emptyStatus(),
  } as Record<PlatformId, PlatformFetchStatus>;
  const offers: LiveOffer[] = [];

  // Limit direct crawl volume: probe with first GPU, then only continue
  // platforms that are not blocked (usually none from datacenter IPs).
  const probeProduct =
    products.find((p) => p.category === "gpu") ?? products[0];
  if (!probeProduct) {
    return { offers, platforms };
  }

  const openPlatforms: DirectTarget[] = [];
  for (const target of TARGETS) {
    const q = searchQuery(probeProduct);
    try {
      const res = await politeFetch(target.buildUrl(q));
      const html = await res.text();
      const blocked = looksBlocked(html);
      if (!res.ok) {
        platforms[target.platform] = {
          status: "error",
          detail: `HTTP ${res.status}`,
          liveOffers: 0,
        };
        continue;
      }
      if (blocked) {
        platforms[target.platform] = {
          status: "blocked",
          detail: blocked,
          liveOffers: 0,
        };
        continue;
      }
      const parsed = target.parse(html, probeProduct);
      if (parsed.length === 0) {
        platforms[target.platform] = {
          status: "empty",
          detail: "page fetched but no parseable offers (SPA/anti-bot likely)",
          liveOffers: 0,
        };
        // Still mark as "open enough" only if HTML looks like a real results page
        if (/J_goodsList|g_page_config|itemsArray|goodsList/i.test(html)) {
          openPlatforms.push(target);
        }
        continue;
      }
      platforms[target.platform] = {
        status: "ok",
        detail: "public search page parseable",
        liveOffers: parsed.length,
      };
      offers.push(...parsed);
      openPlatforms.push(target);
    } catch (err) {
      platforms[target.platform] = {
        status: "error",
        detail: err instanceof Error ? err.message : String(err),
        liveOffers: 0,
      };
    }
  }

  // Full catalog crawl only for platforms that already returned data / look open
  const remaining = products.filter((p) => p.id !== probeProduct.id);
  for (const target of openPlatforms) {
    for (const product of remaining) {
      try {
        const res = await politeFetch(target.buildUrl(searchQuery(product)));
        const html = await res.text();
        if (!res.ok || looksBlocked(html)) continue;
        const parsed = target.parse(html, product);
        offers.push(...parsed);
        platforms[target.platform].liveOffers += parsed.length;
        if (parsed.length > 0) platforms[target.platform].status = "ok";
      } catch {
        // keep prior status
      }
    }
  }

  return { offers: dedupe(offers), platforms };
}

function emptyStatus(): PlatformFetchStatus {
  return { status: "skipped", detail: "not attempted", liveOffers: 0 };
}
