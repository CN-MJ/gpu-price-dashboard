"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PlatformCompareRow } from "@/lib/queries";
import { formatCny, platformLabel } from "@/lib/money";

const COLORS: Record<string, string> = {
  jd: "#e4393c",
  tmall: "#ff0036",
  pdd: "#e02e24",
  taobao: "#ff5000",
};

export function PlatformCompare({ rows }: { rows: PlatformCompareRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-10 text-center text-sm text-[var(--muted)]">
        暂无各平台报价，先运行 <code className="text-[var(--accent-2)]">npm run collect</code>
      </div>
    );
  }

  const chartData = rows.map((r) => ({
    platform: platformLabel(r.platform),
    id: r.platform,
    price: r.min_price_cents / 100,
    shop: r.shop_name,
    count: r.offer_count,
  }));

  return (
    <div className="space-y-4">
      <div className="h-72 w-full rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="28%">
            <CartesianGrid stroke="#2a3848" strokeDasharray="3 3" />
            <XAxis
              dataKey="platform"
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
              formatter={(value, _name, item) => {
                const shop = item?.payload?.shop ?? "";
                return [
                  `${formatCny(Math.round(Number(value) * 100))}（${shop}）`,
                  "最低价",
                ];
              }}
            />
            <Bar dataKey="price" radius={[6, 6, 0, 0]} animationDuration={700}>
              {chartData.map((d) => (
                <Cell
                  key={d.id}
                  fill={COLORS[d.id] ?? "#3dd6c6"}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] text-xs text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">平台</th>
              <th className="px-4 py-3 font-medium">当日最低</th>
              <th className="px-4 py-3 font-medium">店铺</th>
              <th className="px-4 py-3 font-medium">报价条数</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.platform}
                className="border-b border-[var(--line)]/70 hover:bg-[var(--bg-soft)]/60"
              >
                <td className="px-4 py-3">
                  {platformLabel(r.platform)}
                  {i === 0 ? (
                    <span className="ml-2 rounded bg-[rgba(61,214,198,0.15)] px-1.5 py-0.5 text-xs text-[var(--accent-2)]">
                      最低
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 font-[family-name:var(--font-display)] text-[var(--accent)]">
                  {formatCny(r.min_price_cents)}
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">{r.shop_name}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{r.offer_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
