import Link from "next/link";
import { notFound } from "next/navigation";
import { TrendChart } from "@/components/TrendChart";
import { CATEGORY_LABELS } from "@/lib/catalog";
import { formatCny, platformLabel } from "@/lib/money";
import { getProduct, listOffers, listSnapshots } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const [offers, snapshots] = await Promise.all([
    listOffers(id),
    listSnapshots(id),
  ]);
  const best = offers[0];

  return (
    <div className="space-y-8">
      <div className="rise space-y-2">
        <Link
          href={`/category/${product.category}`}
          className="text-sm text-[var(--muted)] hover:text-[var(--accent-2)]"
        >
          ← {CATEGORY_LABELS[product.category]}
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
              {best.is_demo ? " · 演示数据" : ""}
            </span>
          </p>
        ) : null}
      </div>

      <section className="rise rise-delay-1 space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          近 30 日最低价走势
        </h2>
        <TrendChart data={snapshots} />
      </section>

      <section className="rise rise-delay-2 space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          各平台 / 店铺报价
        </h2>
        <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--line)] text-xs text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">平台</th>
                <th className="px-4 py-3 font-medium">店铺</th>
                <th className="px-4 py-3 font-medium">价格</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">链接</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-[var(--line)]/70 hover:bg-[var(--bg-soft)]/60"
                >
                  <td className="px-4 py-3">{platformLabel(o.platform)}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{o.shop_name}</td>
                  <td className="px-4 py-3 font-[family-name:var(--font-display)] text-[var(--accent)]">
                    {formatCny(o.price_cents)}
                  </td>
                  <td className="px-4 py-3">
                    {o.is_demo ? (
                      <span className="text-[var(--warn)]">演示</span>
                    ) : (
                      <span className="text-[var(--accent-2)]">实采</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={o.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--accent-2)] hover:underline"
                    >
                      搜索页
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
