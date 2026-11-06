import Link from "next/link";
import { DataBanner } from "@/components/DataBanner";
import { NewsList } from "@/components/NewsList";
import { getDataStatus, listNews } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const [status, domestic, international] = await Promise.all([
    getDataStatus(),
    listNews("domestic"),
    listNews("international"),
  ]);

  return (
    <div className="space-y-8">
      <div className="rise space-y-2">
        <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--accent-2)]">
          ← 返回总览
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          PC 硬件新闻
        </h1>
        <p className="text-[var(--muted)]">
          国内与国际公开资讯摘要；优先 RSS，失败时回退到标注样例。
        </p>
      </div>
      <DataBanner status={status} />
      <div className="grid gap-8 lg:grid-cols-2">
        <NewsList title="国内" items={domestic} />
        <NewsList title="国际" items={international} />
      </div>
    </div>
  );
}
