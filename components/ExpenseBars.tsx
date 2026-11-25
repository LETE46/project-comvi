"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { BarPoint } from "@/lib/stats";

export default function ExpenseBars({ data }: { data: BarPoint[] }) {
  if (data.every((d) => d.value === 0)) {
    return (
      <p className="py-4 text-center text-sm text-gray-500">
        ไม่มีรายจ่ายในช่วงนี้
      </p>
    );
  }

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
            tickLine={false}
          />
          <YAxis hide />
          <Bar
            dataKey="value"
            fill="#0e7490"
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}