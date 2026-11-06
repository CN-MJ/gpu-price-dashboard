import {
  CATALOG,
  DEMO_SHOPS,
  PLATFORMS,
  type CatalogProduct,
} from "./catalog";
import { crawlLiveOffers, type CrawlReport } from "./crawl";
import { sql } from "./db";

type NewsCandidate = {
  id: string;
  title: string;
  source: string;
  region: "domestic" | "international";
  url: string;
  publishedAt: string;
  summary: string;
};

type StoredOffer = {
  id: string;
  productId: string;
  platform: string;
  shopName: string;
  priceCents: number;
  url: string;
  inStock: boolean;
  isDemo: boolean;
};

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededUnit(seed: number, salt: number): number {
  const x = Math.sin(seed * 0.0001 + salt * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(base: Date, delta: number): Date {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + delta);
  return d;
}

/** 生成某日某型号的演示报价（四平台多店） */
function demoOffersForDay(product: CatalogProduct, date: Date): StoredOffer[] {
  const seed = hashSeed(`${product.id}:${dayKey(date)}`);
  const dayJitter = (seededUnit(seed, 1) - 0.5) * 0.06;
  const offers: StoredOffer[] = [];
  let i = 0;
  for (const platform of PLATFORMS) {
    const shops = DEMO_SHOPS[platform.id];
    const shopCount = 2 + Math.floor(seededUnit(seed, 10 + i) * 2);
    for (let s = 0; s < shopCount; s++) {
      const shop = shops[s % shops.length];
      const shopJitter =
        (seededUnit(seed, 100 + i * 10 + s) - 0.45) * 0.08;
      const priceCents = Math.max(
        100,
        Math.round(product.refPriceCents * (1 + dayJitter + shopJitter)),
      );
      offers.push({
        id: `${product.id}:${platform.id}:${s}:${dayKey(date)}`,
        productId: product.id,
        platform: platform.id,
        shopName: shop,
        priceCents,
        url: `https://search.${platform.id === "jd" ? "jd.com" : platform.id === "tmall" || platform.id === "taobao" ? "taobao.com" : "pinduoduo.com"}/?q=${encodeURIComponent(product.model)}`,
        inStock: seededUnit(seed, 200 + i + s) > 0.08,
        isDemo: true,
      });
    }
    i += 1;
  }
  return offers;
}

const FALLBACK_NEWS: NewsCandidate[] = [
  {
    id: "news-dom-1",
    title: "国产显卡驱动与游戏兼容性持续优化，中端装机选择增多",
    source: "IT之家（摘要样例）",
    region: "domestic",
    url: "https://www.ithome.com/",
    publishedAt: new Date().toISOString(),
    summary: "国内科技媒体对近期桌面显卡与整机市场动态的综合报道摘要。",
  },
  {
    id: "news-dom-2",
    title: "DDR5 内存与 PCIe 5.0 SSD 价格继续下探，装机性价比窗口打开",
    source: "快科技（摘要样例）",
    region: "domestic",
    url: "https://www.mydrivers.com/",
    publishedAt: addDays(new Date(), -1).toISOString(),
    summary: "内存与固态盘促销周期拉长，主流容量段报价更适合高配主机。",
  },
  {
    id: "news-dom-3",
    title: "AMD / Intel 新一代桌面处理器渠道报价一览",
    source: "超能网（摘要样例）",
    region: "domestic",
    url: "https://www.expreview.com/",
    publishedAt: addDays(new Date(), -2).toISOString(),
    summary: "关注 AM5 与 LGA1851 平台在电商平台的日常价与满减活动。",
  },
  {
    id: "news-int-1",
    title: "Next-gen desktop GPUs: launch windows and street pricing watch",
    source: "Tom's Hardware（摘要样例）",
    region: "international",
    url: "https://www.tomshardware.com/",
    publishedAt: new Date().toISOString(),
    summary: "International coverage of desktop GPU availability and street prices.",
  },
  {
    id: "news-int-2",
    title: "PCIe 5.0 SSDs mature: controllers, thermals, and real-world gains",
    source: "AnandTech（摘要样例）",
    region: "international",
    url: "https://www.anandtech.com/",
    publishedAt: addDays(new Date(), -1).toISOString(),
    summary: "Storage deep dive on whether Gen5 drives are worth it for gaming PCs.",
  },
  {
    id: "news-int-3",
    title: "DDR5 kit deals and latency sweet spots for gaming builds",
    source: "TechPowerUp（摘要样例）",
    region: "international",
    url: "https://www.techpowerup.com/",
    publishedAt: addDays(new Date(), -3).toISOString(),
    summary: "Memory kit recommendations around 6000 MT/s CL30 for AM5 platforms.",
  },
];

async function fetchRssNews(): Promise<NewsCandidate[]> {
  const feeds: Array<{
    url: string;
    source: string;
    region: "domestic" | "international";
  }> = [
    {
      url: "https://www.ithome.com/rss/",
      source: "IT之家",
      region: "domestic",
    },
    {
      url: "https://www.solidot.org/index.rss",
      source: "Solidot",
      region: "domestic",
    },
    {
      url: "https://www.tomshardware.com/feeds/all",
      source: "Tom's Hardware",
      region: "international",
    },
    {
      url: "https://www.techpowerup.com/rss/news",
      source: "TechPowerUp",
      region: "international",
    },
  ];

  const collected: NewsCandidate[] = [];
  const keywords =
    /gpu|graphics|radeon|geforce|rtx|rx |ssd|nvme|ddr5|ryzen|core ultra|intel|amd|显卡|内存|固态|处理器|装机|硬件/i;

  for (const feed of feeds) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(feed.url, {
        signal: controller.signal,
        headers: { "User-Agent": "YingJiaTaiPriceBot/0.2 (news-rss)" },
        next: { revalidate: 0 },
      }).finally(() => clearTimeout(timer));
      if (!res.ok) continue;
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 12);
      for (const match of items) {
        const block = match[1];
        const title =
          block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i)?.[1] ||
          block.match(/<title>(.*?)<\/title>/i)?.[1] ||
          "";
        const link =
          block.match(/<link>(.*?)<\/link>/i)?.[1]?.trim() ||
          block.match(/<guid[^>]*>(.*?)<\/guid>/i)?.[1]?.trim() ||
          "";
        const desc =
          block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i)?.[1] ||
          block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ||
          "";
        const pub =
          block.match(/<pubDate>(.*?)<\/pubDate>/i)?.[1] ||
          new Date().toISOString();
        const cleanTitle = title.replace(/<[^>]+>/g, "").trim();
        const cleanSummary = desc
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 180);
        if (!cleanTitle || !link) continue;
        if (!keywords.test(`${cleanTitle} ${cleanSummary}`)) continue;
        collected.push({
          id: `rss:${feed.source}:${hashSeed(link).toString(16)}`,
          title: cleanTitle,
          source: feed.source,
          region: feed.region,
          url: link,
          publishedAt: new Date(pub).toISOString(),
          summary: cleanSummary || "来自公开 RSS 的硬件相关摘要。",
        });
      }
    } catch {
      // 公开 RSS 失败时静默降级
    }
  }
  return collected;
}

export type CollectResult = {
  products: number;
  offers: number;
  snapshots: number;
  news: number;
  newsSource: "rss" | "fallback";
  priceSource: "live" | "mixed" | "demo";
  liveOffers: number;
  demoOffers: number;
  platformStatus: CrawlReport["platforms"];
  aggregatorStatus: CrawlReport["aggregator"];
  note: string;
};

let ensurePromise: Promise<CollectResult> | null = null;

async function metaGet(key: string): Promise<string | null> {
  const rows = await sql<{ value: string }>(
    "select value from app_meta where key = $1",
    [key],
  );
  return rows[0]?.value ?? null;
}

async function metaSet(key: string, value: string): Promise<void> {
  await sql(
    `insert into app_meta(key, value, updated_at) values ($1, $2, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [key, value],
  );
}

async function upsertProducts(): Promise<void> {
  for (const p of CATALOG) {
    await sql(
      `insert into products(id, category, brand, model, specs)
       values ($1, $2, $3, $4, $5)
       on conflict (id) do update set
         category = excluded.category,
         brand = excluded.brand,
         model = excluded.model,
         specs = excluded.specs`,
      [p.id, p.category, p.brand, p.model, p.specs],
    );
  }
}

async function writeOffers(offers: StoredOffer[]): Promise<void> {
  await sql("delete from offers");
  for (const o of offers) {
    await sql(
      `insert into offers(id, product_id, platform, shop_name, price_cents, url, in_stock, scraped_at, is_demo)
       values ($1,$2,$3,$4,$5,$6,$7,now(),$8)`,
      [
        o.id,
        o.productId,
        o.platform,
        o.shopName,
        o.priceCents,
        o.url,
        o.inStock,
        o.isDemo,
      ],
    );
  }
}

async function writeHistorySnapshots(today: Date): Promise<number> {
  let snapCount = 0;
  for (let d = 29; d >= 1; d--) {
    const date = addDays(today, -d);
    const dateStr = dayKey(date);
    for (const product of CATALOG) {
      const offers = demoOffersForDay(product, date).filter((o) => o.inStock);
      const best = offers.reduce((a, b) =>
        a.priceCents <= b.priceCents ? a : b,
      );
      await sql(
        `insert into price_snapshots(id, product_id, snapshot_date, min_price_cents, platform, shop_name)
         values ($1,$2,$3::date,$4,$5,$6)
         on conflict (product_id, snapshot_date) do update set
           min_price_cents = excluded.min_price_cents,
           platform = excluded.platform,
           shop_name = excluded.shop_name`,
        [
          `${product.id}:${dateStr}`,
          product.id,
          dateStr,
          best.priceCents,
          best.platform,
          best.shopName,
        ],
      );
      snapCount += 1;
    }
  }
  return snapCount;
}

async function writeTodaySnapshots(
  today: Date,
  todaysOffers: StoredOffer[],
): Promise<number> {
  const dateStr = dayKey(today);
  let snapCount = 0;
  const byProduct = new Map<string, StoredOffer[]>();
  for (const o of todaysOffers.filter((x) => x.inStock)) {
    const list = byProduct.get(o.productId) ?? [];
    list.push(o);
    byProduct.set(o.productId, list);
  }
  for (const product of CATALOG) {
    const list = byProduct.get(product.id) ?? [];
    if (list.length === 0) continue;
    const best = list.reduce((a, b) =>
      a.priceCents <= b.priceCents ? a : b,
    );
    await sql(
      `insert into price_snapshots(id, product_id, snapshot_date, min_price_cents, platform, shop_name)
       values ($1,$2,$3::date,$4,$5,$6)
       on conflict (product_id, snapshot_date) do update set
         min_price_cents = excluded.min_price_cents,
         platform = excluded.platform,
         shop_name = excluded.shop_name`,
      [
        `${product.id}:${dateStr}`,
        product.id,
        dateStr,
        best.priceCents,
        best.platform,
        best.shopName,
      ],
    );
    snapCount += 1;
  }
  return snapCount;
}

async function writeNews(): Promise<{
  count: number;
  newsSource: "rss" | "fallback";
}> {
  let news = await fetchRssNews();
  let newsSource: "rss" | "fallback" = "rss";
  if (news.length < 4) {
    news = FALLBACK_NEWS;
    newsSource = "fallback";
  }
  await sql("delete from news_items");
  for (const n of news.slice(0, 24)) {
    await sql(
      `insert into news_items(id, title, source, region, url, published_at, summary)
       values ($1,$2,$3,$4,$5,$6::timestamptz,$7)
       on conflict (id) do update set
         title = excluded.title,
         source = excluded.source,
         region = excluded.region,
         url = excluded.url,
         published_at = excluded.published_at,
         summary = excluded.summary`,
      [n.id, n.title, n.source, n.region, n.url, n.publishedAt, n.summary],
    );
  }
  return { count: Math.min(news.length, 24), newsSource };
}

function buildNote(report: CrawlReport, priceSource: CollectResult["priceSource"]): string {
  const parts = [
    "采集策略：先请求京东/天猫/拼多多/淘宝公开搜索页（限速、标识 UA、不登录、不绕过验证码）；",
    "若店面页被反爬拦截，则用什么值得买公开 list API 中带商城归属的成交贴作为实采回退；",
    "仍无数据的型号保留演示报价并标注。",
  ];
  const blocked = Object.entries(report.platforms)
    .filter(([, s]) => s.status === "blocked")
    .map(([k]) => k);
  if (blocked.length) {
    parts.push(`直连被拦：${blocked.join(",")}。`);
  }
  parts.push(`聚合源：${report.aggregator.status} — ${report.aggregator.detail}`);
  parts.push(`本次报价模式：${priceSource}。`);
  return parts.join(" ");
}

async function runCollect(opts: { live: boolean }): Promise<CollectResult> {
  await upsertProducts();

  const today = new Date();
  today.setUTCHours(12, 0, 0, 0);

  let crawl: CrawlReport = {
    offers: [],
    platforms: {
      jd: { status: "skipped", detail: "live crawl disabled", liveOffers: 0 },
      tmall: { status: "skipped", detail: "live crawl disabled", liveOffers: 0 },
      pdd: { status: "skipped", detail: "live crawl disabled", liveOffers: 0 },
      taobao: {
        status: "skipped",
        detail: "live crawl disabled",
        liveOffers: 0,
      },
    },
    aggregator: {
      status: "skipped",
      detail: "live crawl disabled",
      liveOffers: 0,
    },
  };

  if (opts.live) {
    crawl = await crawlLiveOffers(CATALOG);
  }

  const liveByProduct = new Set(crawl.offers.map((o) => o.productId));
  const stored: StoredOffer[] = [];

  for (const live of crawl.offers) {
    stored.push({
      id: `live:${live.source}:${live.productId}:${live.platform}:${hashSeed(live.url + live.priceCents).toString(16)}`,
      productId: live.productId,
      platform: live.platform,
      shopName: live.shopName,
      priceCents: live.priceCents,
      url: live.url,
      inStock: live.inStock,
      isDemo: false,
    });
  }

  // Demo fallback for products with no live hits
  for (const product of CATALOG) {
    if (liveByProduct.has(product.id)) continue;
    for (const o of demoOffersForDay(product, today).filter((x) => x.inStock)) {
      stored.push(o);
    }
  }

  await writeOffers(stored);
  const histSnaps = await writeHistorySnapshots(today);
  const todaySnaps = await writeTodaySnapshots(today, stored);
  const news = await writeNews();

  const liveOffers = stored.filter((o) => !o.isDemo).length;
  const demoOffers = stored.filter((o) => o.isDemo).length;
  const priceSource: CollectResult["priceSource"] =
    liveOffers > 0 && demoOffers > 0
      ? "mixed"
      : liveOffers > 0
        ? "live"
        : "demo";

  const result: CollectResult = {
    products: CATALOG.length,
    offers: stored.length,
    snapshots: histSnaps + todaySnaps,
    news: news.count,
    newsSource: news.newsSource,
    priceSource,
    liveOffers,
    demoOffers,
    platformStatus: crawl.platforms,
    aggregatorStatus: crawl.aggregator,
    note: opts.live
      ? buildNote(crawl, priceSource)
      : "首次/快速种子使用演示报价。运行 npm run collect 或 POST /api/refresh 触发实采（直连四平台 + 什么值得买公开聚合，失败则演示回退）。",
  };
  await metaSet("last_collect", JSON.stringify(result));
  await metaSet("seeded", "1");
  return result;
}

/** 确保库已灌入种子；同进程只跑一次。首屏用演示数据，避免阻塞。 */
export async function ensureData(): Promise<CollectResult> {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      const seeded = await metaGet("seeded");
      if (seeded === "1") {
        const raw = await metaGet("last_collect");
        if (raw) {
          try {
            return JSON.parse(raw) as CollectResult;
          } catch {
            /* fallthrough */
          }
        }
      }
      return runCollect({ live: false });
    })().catch((err) => {
      ensurePromise = null;
      throw err;
    });
  }
  return ensurePromise;
}

/** 强制重新采集：实采优先，失败型号回退演示。 */
export async function refreshCollect(): Promise<CollectResult> {
  ensurePromise = null;
  await metaSet("seeded", "0");
  const result = await runCollect({ live: true });
  ensurePromise = Promise.resolve(result);
  return result;
}
