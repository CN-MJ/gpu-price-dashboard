import type { CatalogProduct } from "../catalog";

/** Build a search query for a catalog SKU. */
export function searchQuery(product: CatalogProduct): string {
  return `${product.brand} ${product.model}`.replace(/\s+/g, " ").trim();
}

/**
 * Loose title match: require distinctive model tokens, avoid confusing
 * e.g. RTX 5070 with RTX 5070 Ti / RTX 4070.
 */
export function titleMatchesProduct(
  title: string,
  product: CatalogProduct,
): boolean {
  const t = title.toLowerCase().replace(/\s+/g, " ");
  const model = product.model.toLowerCase();

  // GPU: require series number + optional Ti/SUPER carefully
  const gpu = model.match(
    /(?:geforce\s+)?(rtx|rx)\s*(\d{3,4})\s*(ti|super)?/i,
  );
  if (gpu) {
    const family = gpu[1].toLowerCase();
    const num = gpu[2];
    const suffix = (gpu[3] || "").toLowerCase();
    if (!t.includes(family)) return false;
    if (!new RegExp(`${family}\\s*${num}\\b`, "i").test(t)) return false;
    if (suffix === "ti") {
      if (!/\bti\b/i.test(t) && !new RegExp(`${num}\\s*ti`, "i").test(t)) {
        return false;
      }
    } else if (suffix === "super") {
      if (!/super/i.test(t)) return false;
    } else {
      // base card: reject Ti / SUPER variants
      if (new RegExp(`${num}\\s*ti\\b`, "i").test(t)) return false;
      if (new RegExp(`${num}[\\s-]*super\\b`, "i").test(t)) return false;
    }
    return true;
  }

  // CPU / RAM / SSD: require most of the model tokens
  const tokens = model
    .split(/[\s/]+/)
    .map((x) => x.toLowerCase())
    .filter((x) => x.length >= 2 && !["geforce", "radeon"].includes(x));
  if (tokens.length === 0) return false;
  const hit = tokens.filter((tok) => t.includes(tok)).length;
  return hit >= Math.ceil(tokens.length * 0.7);
}
