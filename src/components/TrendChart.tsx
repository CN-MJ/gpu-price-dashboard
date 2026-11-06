"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PlatformSnapshotRow, SnapshotRow } from "@/lib/queries";
import { formatCny, platformLabel } from "@/lib/money";

const PLATFORM_COLORS: Record<string, string> = {
  jd: "#e4393c",
  tmall: "#ff0036",
  pdd: "#f5a623",
  taobao: "#ff5000",
  overall: "#3dd6c6",
};

export function TrendChart({
  data,
  platformData = [],
}: {
  data: SnapshotRow[];
  platformData?: PlatformSnapshotRow[];
}) {
  if (data.length === 0 && platformData.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg-elevated)] px-4 text-center text-sm text-[var(--muted)]">
        暂无历史快照。每天运行一次{" "}
        <code className="mx-1 text-[var(--accent-2)]">npm run collect</code>
        会追加当日点；同日再次采集会覆盖当天。
      </div>
    );
  }

  const dates = [
    ...new Set([
      ...data.map((d) => d.snapshot_date),
      ...platformData.map((d) => d.snapshot_date),
    ]),
  ].sort();

  const platforms = [
    ...new Set(platformData.map((d) => d.platform)),
  ] as string[];

  const chartData = dates.map((date) => {
    const row: Record<string, string | number> = {
      date: date.slice(5),
      full: date,
    };
    const overall = data.find((d) => d.snapshot_date === date);
    if (overall) row.overall = overall.min_price_cents / 100;
    for (const p of platforms) {
      const hit = platformData.find(
        (d) => d.snapshot_date === date && d.platform === p,
      );
      if (hit) row[p] = hit.min_price_cents / 100;
    }
    return row;
  });

  return (
    <div className="h-80 w-full rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid stroke="#2a3848" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            stroke="#93a4b8"
            tick={{ fill: "#93a4b8", fontSize: 12 }}
          />
          <YAxis
            stroke="#93a4b8"
            tick={{ fill: "#93a4b8", fontSize: 12 }}
            tickFormatter={(v) => `¥${Math.round(v)}`}
            width={72}
          />
          <Tooltip
            contentStyle={{
              background: "#151d27",
              border: "1px solid #2a3848",
              borderRadius: 8,
              color: "#e8eef5",
            }}
            formatter={(value, name) => [
              formatCny(Math.round(Number(value) * 100)),
              name === "overall" ? "全网最低" : platformLabel(String(name)),
            ]}
            labelFormatter={(label, payload) => {
              const full = payload?.[0]?.payload?.full ?? label;
              return `日期 ${full}`;
            }}
          />
          <Legend
            formatter={(value) =>
              value === "overall" ? "全网最低" : platformLabel(String(value))
            }
          />
          <Line
            type="monotone"
            dataKey="overall"
            name="overall"
            stroke={PLATFORM_COLORS.overall}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            connectNulls
            animationDuration={800}
          />
          {platforms.map((p) => (
            <Line
              key={p}
              type="monotone"
              dataKey={p}
              name={p}
              stroke={PLATFORM_COLORS[p] ?? "#93a4b8"}
              strokeWidth={1.8}
              strokeDasharray="4 3"
              dot={{ r: 2 }}
              connectNulls
              animationDuration={800}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
