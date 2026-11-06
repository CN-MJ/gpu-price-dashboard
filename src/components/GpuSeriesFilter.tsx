import Link from "next/link";
import {
  GPU_SERIES_LABELS,
  type GpuSeries,
} from "@/lib/catalog";

const OPTIONS: Array<{ id: "all" | GpuSeries; label: string }> = [
  { id: "all", label: "全部显卡" },
  { id: "rtx50", label: GPU_SERIES_LABELS.rtx50 },
  { id: "rtx40", label: GPU_SERIES_LABELS.rtx40 },
  { id: "amd", label: GPU_SERIES_LABELS.amd },
];

export function GpuSeriesFilter({
  active,
}: {
  active: "all" | GpuSeries;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => {
        const href =
          opt.id === "all"
            ? "/category/gpu"
            : `/category/gpu?series=${opt.id}`;
        const isOn = active === opt.id;
        return (
          <Link
            key={opt.id}
            href={href}
            className={`rounded-lg border px-3 py-1.5 text-sm transition ${
              isOn
                ? "border-[var(--accent)] bg-[rgba(240,180,41,0.12)] text-[var(--accent)]"
                : "border-[var(--line)] bg-[var(--bg-elevated)] text-[var(--muted)] hover:border-[var(--accent-2)]/40 hover:text-[var(--text)]"
            }`}
          >
            {opt.label}
          </Link>
        );
      })}
    </div>
  );
}
