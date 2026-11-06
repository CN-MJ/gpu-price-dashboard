import Link from "next/link";
import type { ProductRow } from "@/lib/queries";
import { formatCny, formatDelta, platformLabel } from "@/lib/money";
import { CATEGORY_LABELS } from "@/lib/catalog";

export function PriceTable({
  rows,
  showCategory = false,
}: {
  rows: ProductRow[];
  showCategory?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)]">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[var(--line)] text-xs uppercase tracking-wide text-[var(--muted)]">
          <tr>
            {showCategory && <th className="px-4 py-3 font-medium">品类</th>}
            <th className="px-4 py-3 font-medium">型号</th>
            <th className="px-4 py-3 font-medium">最低价</th>
            <th className="px-4 py-3 font-medium">平台</th>
            <th className="px-4 py-3 font-medium">店铺</th>
            <th className="px-4 py-3 font-medium">较昨日</th>
            <th className="px-4 py-3 font-medium">数据</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const delta =
              row.min_price_cents != null && row.yesterday_price_cents != null
                ? row.min_price_cents - row.yesterday_price_cents
                : null;
            const change = formatDelta(delta);
            return (
              <tr
                key={row.id}
                className="border-b border-[var(--line)]/70 transition hover:bg-[var(--bg-soft)]/70"
              >
                {showCategory && (
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {CATEGORY_LABELS[row.category]}
                  </td>
                )}
                <td className="px-4 py-3">
                  <Link
                    href={`/product/${row.id}`}
                    className="font-medium text-[var(--text)] hover:text-[var(--accent-2)]"
                  >
                    {row.brand} {row.model}
                  </Link>
                  <div className="text-xs text-[var(--muted)]">{row.specs}</div>
                </td>
                <td className="px-4 py-3 font-[family-name:var(--font-display)] text-base font-semibold text-[var(--accent)]">
                  {row.min_price_cents != null
                    ? formatCny(row.min_price_cents)
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {row.platform ? platformLabel(row.platform) : "—"}
                </td>
                <td className="max-w-[12rem] truncate px-4 py-3 text-[var(--muted)]">
                  {row.shop_name ?? "—"}
                </td>
                <td
                  className={`px-4 py-3 ${
                    change.tone === "down"
                      ? "text-[var(--down)]"
                      : change.tone === "up"
                        ? "text-[var(--up)]"
                        : "text-[var(--muted)]"
                  }`}
                >
                  {change.text}
                </td>
                <td className="px-4 py-3">
                  {row.is_demo ? (
                    <span className="rounded bg-[rgba(240,180,41,0.15)] px-2 py-0.5 text-xs text-[var(--warn)]">
                      演示
                    </span>
                  ) : (
                    <span className="rounded bg-[rgba(61,214,198,0.15)] px-2 py-0.5 text-xs text-[var(--accent-2)]">
                      实采
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
