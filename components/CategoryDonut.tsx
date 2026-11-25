"use client";

import { Cell, Pie, PieChart } from "recharts";
import { formatBaht } from "@/lib/format";
import type { CategoryTotal } from "@/lib/stats";
import type { Category } from "@/lib/types";

const FALLBACK_COLOR = "#94a3b8";

export default function CategoryDonut({
  data,
  categories,
}: {
  data: CategoryTotal[];
  categories: Category[];
}) {
  // เอา categoryId ไปหาชื่อและสีจากตารางหมวด
  const rows = data.map((d) => {
    const cat = categories.find((c) => c.id === d.categoryId);
    return {
      id: d.categoryId,
      name: cat?.name ?? "ไม่ระบุหมวด",
      color: cat?.color ?? FALLBACK_COLOR,
      value: d.value,
    };
  });

  if (rows.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-500">
        ไม่มีรายจ่ายในช่วงนี้
      </p>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <PieChart width={150} height={150}>
        <Pie
          data={rows}
          dataKey="value"
          nameKey="name"
          innerRadius={45}
          outerRadius={70}
          paddingAngle={2}
          stroke="none"
          isAnimationActive={false}
        >
          {rows.map((r) => (
            <Cell key={r.id} fill={r.color} />
          ))}
        </Pie>
      </PieChart>

      <ul className="flex-1 space-y-2 text-sm">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: r.color }}
              />
              {r.name}
            </span>
            <span>{formatBaht(r.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}