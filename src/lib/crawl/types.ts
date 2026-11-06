export type PlatformId = "jd" | "tmall" | "pdd" | "taobao";

export type LiveOffer = {
  productId: string;
  platform: PlatformId;
  shopName: string;
  priceCents: number;
  url: string;
  inStock: boolean;
  /** How the offer was obtained */
  source: "direct" | "smzdm";
};

export type PlatformFetchStatus = {
  status: "ok" | "blocked" | "error" | "empty" | "skipped";
  detail: string;
  liveOffers: number;
};

export type CrawlReport = {
  offers: LiveOffer[];
  platforms: Record<PlatformId, PlatformFetchStatus>;
  aggregator: {
    status: "ok" | "blocked" | "error" | "empty" | "skipped";
    detail: string;
    liveOffers: number;
  };
};
