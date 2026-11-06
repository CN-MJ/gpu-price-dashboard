import type { CollectResult } from "@/lib/collect";

export function DataBanner({ status }: { status: CollectResult }) {
  const newsLabel =
    status.newsSource === "rss" ? "公开 RSS（真实）" : "样例摘要（回退）";
  const rawSource = String(status.priceSource ?? "");
  const priceLabel =
    rawSource === "live"
      ? "实采"
      : rawSource === "empty"
        ? "尚无报价（请 npm run collect）"
        : rawSource === "mixed" || rawSource === "demo"
          ? "请重新 collect（已取消演示回填）"
          : "尚无报价";
  const platformBits = status.platformStatus
    ? Object.entries(status.platformStatus)
        .map(([id, s]) => `${id}:${s.status}`)
        .join(" · ")
    : "";
  return (
    <div className="rise rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--muted)]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="inline-flex items-center gap-2 text-[var(--warn)]">
          <span className="scan-line h-2 w-2 rounded-full bg-[var(--warn)]" />
          数据说明
        </span>
        <span>
          报价来源：
          <strong className="ml-1 font-medium text-[var(--text)]">
            {priceLabel}
          </strong>
          （京东 / 天猫 / 拼多多 / 淘宝
          {typeof status.liveOffers === "number"
            ? ` · 实采 ${status.liveOffers} 条`
            : ""}
          ）
        </span>
        <span>
          新闻来源：
          <strong className="ml-1 font-medium text-[var(--text)]">
            {newsLabel}
          </strong>
        </span>
        <span>
          目录 {status.products} 型号 · 报价 {status.offers} 条 · 快照{" "}
          {status.snapshots} 条
        </span>
      </div>
      {platformBits ? (
        <p className="mt-1 text-xs leading-relaxed opacity-80">
          平台状态：{platformBits}
          {status.aggregatorStatus
            ? ` · 聚合 ${status.aggregatorStatus.status}`
            : ""}
        </p>
      ) : null}
      <p className="mt-1 text-xs leading-relaxed opacity-90">{status.note}</p>
    </div>
  );
}
