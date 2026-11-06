import Link from "next/link";
import { notFound } from "next/navigation";
import { DataBanner } from "@/components/DataBanner";
import { PriceTable } from "@/components/PriceTable";
import { CATEGORY_LABELS, type Category } from "@/lib/catalog";
import { getDataStatus, listProductsByCategory } from "@/lib/queries";

export const dynamic = "force-dynamic";

const VALID: Category[] = ["gpu", "ram", "storage", "cpu"];

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!VALID.includes(category as Category)) notFound();
  const cat = category as Category;
  const [rows, status] = await Promise.all([
    listProductsByCategory(cat),
    getDataStatus(),
  ]);

  return (
    <div className="space-y-6">
      <div className="rise space-y-2">
        <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--accent-2)]">
          ← 返回总览
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          {CATEGORY_LABELS[cat]}
        </h1>
        <p className="text-[var(--muted)]">
          按型号汇总四平台最低价，并标出店铺来源与较昨日变化。
        </p>
      </div>
      <DataBanner status={status} />
      <PriceTable rows={rows} />
    </div>
  );
}
