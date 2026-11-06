import Link from "next/link";
import { DataBanner } from "@/components/DataBanner";
import { PriceTable } from "@/components/PriceTable";
import { CATEGORY_LABELS, type Category } from "@/lib/catalog";
import { getDataStatus, getHighlights, listProductsByCategory } from "@/lib/queries";
import { formatCny } from "@/lib/money";

export const dynamic = "force-dynamic";

const CATEGORIES: Category[] = ["gpu", "ram", "storage", "cpu"];

export default async function HomePage() {
  const [status, highlights, all] = await Promise.all([
    getDataStatus(),
    getHighlights(6),
    listProductsByCategory(),
  ]);

  const counts = Object.fromEntries(
    CATEGORIES.map((c) => [c, all.filter((p) => p.category === c).length]),
  ) as Record<Category, number>;

  return (
    <div className="space-y-8">
      <section className="rise space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent-2)]">
          crawlingGPUprice
        </p>
        <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          硬价台
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-[var(--muted)]">
          按品类扫一眼今日全平台最低价与店铺来源，入库后可看近 30
          日走势；旁路追踪国内外 PC 硬件新闻。
        </p>
      </section>

      <DataBanner status={status} />

      <section className="rise rise-delay-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/category/${cat}`}
            className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4 transition hover:border-[var(--accent)]/50 hover:bg-[var(--bg-soft)]"
          >
            <div className="text-xs text-[var(--muted)]">品类</div>
            <div className="mt-1 font-[family-name:var(--font-display)] text-xl">
              {CATEGORY_LABELS[cat]}
            </div>
            <div className="mt-3 text-sm text-[var(--muted)]">
              {counts[cat]} 个关注型号
            </div>
          </Link>
        ))}
      </section>

      <section className="rise rise-delay-2 space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            今日降幅亮点
          </h2>
          <Link
            href="/news"
            className="text-sm text-[var(--accent-2)] hover:underline"
          >
            查看硬件新闻 →
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item) => {
            const drop =
              item.yesterday_price_cents != null && item.min_price_cents != null
                ? item.yesterday_price_cents - item.min_price_cents
                : 0;
            return (
              <Link
                key={item.id}
                href={`/product/${item.id}`}
                className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4 transition hover:border-[var(--accent-2)]/40"
              >
                <div className="text-xs text-[var(--muted)]">
                  {CATEGORY_LABELS[item.category]}
                </div>
                <div className="mt-1 font-medium">
                  {item.brand} {item.model}
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--accent)]">
                    {item.min_price_cents != null
                      ? formatCny(item.min_price_cents)
                      : "—"}
                  </span>
                  <span className="text-sm text-[var(--down)]">
                    {drop > 0 ? `较昨日 −${formatCny(drop)}` : "价格稳定"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rise rise-delay-3 space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          全品类最低价一览
        </h2>
        <PriceTable rows={all} showCategory />
      </section>
    </div>
  );
}
