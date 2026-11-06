"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SnapshotRow } from "@/lib/queries";
import { formatCny } from "@/lib/money";

export function TrendChart({ data }: { data: SnapshotRow[] }) {
  const chartData = data.map((d) => ({
    date: d.snapshot_date.slice(5),
    price: d.min_price_cents / 100,
    full: d.snapshot_date,
    platform: d.platform,
    shop: d.shop_name,
  }));

  return (
    <div className="h-72 w-full rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3dd6c6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#3dd6c6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
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
            formatter={(value) => [
              formatCny(Math.round(Number(value) * 100)),
              "最低价",
            ]}
            labelFormatter={(label, payload) => {
              const full = payload?.[0]?.payload?.full ?? label;
              return `日期 ${full}`;
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#3dd6c6"
            strokeWidth={2}
            fill="url(#priceFill)"
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
