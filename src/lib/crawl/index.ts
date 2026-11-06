import type { CatalogProduct } from "../catalog";
import { crawlDirectPlatforms } from "./platforms/direct";
import { crawlSmzdm } from "./platforms/smzdm";
import type { CrawlReport, LiveOffer } from "./types";

export type { CrawlReport, LiveOffer, PlatformFetchStatus, PlatformId } from "./types";

/**
 * Best-effort live crawl:
 * 1) Direct public search pages for JD / Tmall / PDD / Taobao
 * 2) Public SMZDM list API as mall-attributed fallback when storefronts block bots
 * Never logs in, never solves captchas, rate-limited.
 */
export async function crawlLiveOffers(
  products: CatalogProduct[],
): Promise<CrawlReport> {
  if (process.env.COLLECT_LIVE === "0") {
    return {
      offers: [],
      platforms: {
        jd: { status: "skipped", detail: "COLLECT_LIVE=0", liveOffers: 0 },
        tmall: { status: "skipped", detail: "COLLECT_LIVE=0", liveOffers: 0 },
        pdd: { status: "skipped", detail: "COLLECT_LIVE=0", liveOffers: 0 },
        taobao: { status: "skipped", detail: "COLLECT_LIVE=0", liveOffers: 0 },
      },
      aggregator: {
        status: "skipped",
        detail: "COLLECT_LIVE=0",
        liveOffers: 0,
      },
    };
  }

  const direct = await crawlDirectPlatforms(products);
  let offers: LiveOffer[] = [...direct.offers];

  // Always try SMZDM aggregator to fill platforms blocked at the storefront.
  const smzdm = await crawlSmzdm(products);
  const haveKey = new Set(
    offers.map((o) => `${o.productId}:${o.platform}:${o.priceCents}`),
  );
  for (const o of smzdm.offers) {
    const key = `${o.productId}:${o.platform}:${o.priceCents}`;
    if (haveKey.has(key)) continue;
    haveKey.add(key);
    offers.push(o);
  }

  // Recount platform live totals including aggregator
  for (const p of Object.keys(direct.platforms) as Array<
    keyof typeof direct.platforms
  >) {
    const n = offers.filter((o) => o.platform === p).length;
    if (n > 0 && direct.platforms[p].status !== "ok") {
      direct.platforms[p] = {
        status: "ok",
        detail: `${direct.platforms[p].detail}; filled via SMZDM public feed`,
        liveOffers: n,
      };
    } else {
      direct.platforms[p].liveOffers = n;
    }
  }

  return {
    offers,
    platforms: direct.platforms,
    aggregator: {
      status: smzdm.status,
      detail: smzdm.detail,
      liveOffers: smzdm.offers.length,
    },
  };
}
