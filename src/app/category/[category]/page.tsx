import Link from "next/link";
import { notFound } from "next/navigation";
import { DataBanner } from "@/components/DataBanner";
import { GpuSeriesFilter } from "@/components/GpuSeriesFilter";
import { PriceTable } from "@/components/PriceTable";
import {
  CATEGORY_LABELS,
  gpuSeriesOf,
  parseGpuSeries,
  type Category,
} from "@/lib/catalog";
import { getDataStatus, listProductsByCategory } from "@/lib/queries";

export const dynamic = "force-dynamic";

const VALID: Category[] = ["gpu", "ram", "storage", "cpu"];

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ series?: string }>;
}) {
  const { category } = await params;
  const { series: seriesRaw } = await searchParams;
  if (!VALID.includes(category as Category)) notFound();
  const cat = category as Category;
  const series = parseGpuSeries(seriesRaw);

  const [allRows, status] = await Promise.all([
    listProductsByCategory(cat),
    getDataStatus(),
  ]);

  const rows =
    cat === "gpu" && series !== "all"
      ? allRows.filter((p) => gpuSeriesOf(p) === series)
      : allRows;

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
          按型号汇总四平台最低价；点进型号可看价格曲线与平台对比。同日再次采集会覆盖当天快照。
        </p>
      </div>
      <DataBanner status={status} />
      {cat === "gpu" ? <GpuSeriesFilter active={series} /> : null}
      <p className="text-sm text-[var(--muted)]">共 {rows.length} 个型号</p>
      <PriceTable rows={rows} />
    </div>
  );
}
