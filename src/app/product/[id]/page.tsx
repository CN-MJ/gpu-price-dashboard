import Link from "next/link";
import { notFound } from "next/navigation";
import { PlatformCompare } from "@/components/PlatformCompare";
import { TrendChart } from "@/components/TrendChart";
import { CATEGORY_LABELS, gpuSeriesOf, GPU_SERIES_LABELS } from "@/lib/catalog";
import { formatCny, platformLabel } from "@/lib/money";
import {
  getProduct,
  listOffers,
  listPlatformCompare,
  listPlatformSnapshots,
  listSnapshots,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const [offers, snapshots, platformSnaps, platformCompare] = await Promise.all([
    listOffers(id),
    listSnapshots(id),
    listPlatformSnapshots(id),
    listPlatformCompare(id),
  ]);
  const best = offers[0];
  const series = gpuSeriesOf(product);

  return (
    <div className="space-y-8">
      <div className="rise space-y-2">
        <Link
          href={
            product.category === "gpu" && series
              ? `/category/gpu?series=${series}`
              : `/category/${product.category}`
          }
          className="text-sm text-[var(--muted)] hover:text-[var(--accent-2)]"
        >
          ← {CATEGORY_LABELS[product.category]}
          {series ? ` · ${GPU_SERIES_LABELS[series]}` : ""}
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">
          {product.brand} {product.model}
        </h1>
        <p className="text-[var(--muted)]">{product.specs}</p>
        {best ? (
          <p className="pt-2 text-lg">
            当前最低价{" "}
            <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--accent)]">
              {formatCny(best.price_cents)}
            </span>
            <span className="ml-2 text-sm text-[var(--muted)]">
              {platformLabel(best.platform)} · {best.shop_name}
            </span>
          </p>
        ) : (
          <p className="pt-2 text-sm text-[var(--muted)]">
            暂无实采报价。运行 <code>npm run collect</code> 后刷新本页。
          </p>
        )}
      </div>

      <section className="rise rise-delay-1 space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          各平台价格对比（当日）
        </h2>
        <p className="text-sm text-[var(--muted)]">
          按平台取当日最低价；同日再次采集会覆盖当天数据。
        </p>
        <PlatformCompare rows={platformCompare} />
      </section>

      <section className="rise rise-delay-2 space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          价格曲线
        </h2>
        <p className="text-sm text-[var(--muted)]">
          实线为全网当日最低；虚线为各平台当日最低。历史按天累积，仅覆盖当天。
        </p>
        <TrendChart data={snapshots} platformData={platformSnaps} />
      </section>

      <section className="rise rise-delay-3 space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          店铺明细
        </h2>
        <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--line)] text-xs text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">平台</th>
                <th className="px-4 py-3 font-medium">店铺</th>
                <th className="px-4 py-3 font-medium">价格</th>
                <th className="px-4 py-3 font-medium">链接</th>
              </tr>
            </thead>
            <tbody>
              {offers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-[var(--muted)]"
                  >
                    暂无店铺报价
                  </td>
                </tr>
              ) : (
                offers.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-[var(--line)]/70 hover:bg-[var(--bg-soft)]/60"
                  >
                    <td className="px-4 py-3">{platformLabel(o.platform)}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">
                      {o.shop_name}
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-display)] text-[var(--accent)]">
                      {formatCny(o.price_cents)}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={o.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--accent-2)] hover:underline"
                      >
                        打开
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
