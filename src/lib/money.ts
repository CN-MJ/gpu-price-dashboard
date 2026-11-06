export function formatCny(cents: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDelta(cents: number | null): {
  text: string;
  tone: "up" | "down" | "flat";
} {
  if (cents == null || cents === 0) {
    return { text: "持平", tone: "flat" };
  }
  const abs = formatCny(Math.abs(cents));
  if (cents < 0) return { text: `↓ ${abs}`, tone: "down" };
  return { text: `↑ ${abs}`, tone: "up" };
}

export function platformLabel(platform: string): string {
  const map: Record<string, string> = {
    jd: "京东",
    tmall: "天猫",
    pdd: "拼多多",
    taobao: "淘宝",
  };
  return map[platform] ?? platform;
}
