/**
 * Polite HTTP helper for public pages / APIs.
 * No login, no captcha bypass — only plain GET with a clear bot User-Agent.
 */

const DEFAULT_UA =
  "YingJiaTaiPriceBot/0.2 (+https://github.com/CN-MJ/gpu-price-dashboard; personal price research; respectful crawl; contact via GitHub issues)";

let lastRequestAt = 0;
const MIN_GAP_MS = Number(process.env.CRAWL_MIN_GAP_MS || 900);

export async function politeFetch(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const now = Date.now();
  const wait = MIN_GAP_MS - (now - lastRequestAt);
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait));
  }
  lastRequestAt = Date.now();

  const headers = new Headers(init.headers);
  if (!headers.has("User-Agent")) headers.set("User-Agent", DEFAULT_UA);
  if (!headers.has("Accept-Language")) {
    headers.set("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.5");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "text/html,application/json;q=0.9,*/*;q=0.8");
  }

  const controller = new AbortController();
  const timeoutMs = Number(process.env.CRAWL_TIMEOUT_MS || 12000);
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
      redirect: "follow",
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

export function looksBlocked(html: string): string | null {
  const sample = html.slice(0, 8000);
  if (/京东验证|JDR_shields|risk_handler|__jda=|verify_page/i.test(sample)) {
    return "anti-bot / captcha page";
  }
  if (/rgv587|punish|x5sec|滑块|验证码|security.*challenge/i.test(sample)) {
    return "anti-bot / captcha page";
  }
  if (/passport\.login|请登录|login\.taobao|login\.tmall/i.test(sample) &&
      !/J_goodsList|item\.jd\.com|g_page_config|itemsArray/i.test(html)) {
    return "login wall / empty SPA shell";
  }
  if (/no access|access denied|403 Forbidden/i.test(sample)) {
    return "access denied";
  }
  return null;
}

export function yuanToCents(raw: string | number): number | null {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return Math.round(raw * 100);
  }
  const text = String(raw)
    .replace(/,/g, "")
    .replace(/￥|¥|元|约|起|券后|到手价/g, " ")
    .trim();
  const m = text.match(/(\d+(?:\.\d{1,2})?)/);
  if (!m) return null;
  const yuan = Number(m[1]);
  if (!Number.isFinite(yuan) || yuan < 10) return null;
  return Math.round(yuan * 100);
}
