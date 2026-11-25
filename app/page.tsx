"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLiff } from "@/components/LiffProvider";
import { useBills, useCategories } from "@/lib/hooks";
import { getRange, periodLabel, shiftAnchor, type Period } from "@/lib/period";
import { expenseBars, summarizeBills } from "@/lib/stats";
import { useToday } from "@/lib/useToday";
import CategoryDonut from "@/components/CategoryDonut";
import { formatBaht } from "@/lib/format";
import DayBillList from "@/components/DayBillList";
import ExpenseBars from "@/components/ExpenseBars";

const tabs: { value: Period; label: string }[] = [
  { value: "day", label: "วัน" },
  { value: "month", label: "เดือน" },
  { value: "year", label: "ปี" },
  { value: "all", label: "ทั้งหมด" },
];

export default function StatsPage() {
  const { loading, error } = useLiff();
  const today = useToday();

  const [period, setPeriod] = useState<Period>("month");
  const [anchorOverride, setAnchorOverride] = useState<string | null>(null);

  const anchor = anchorOverride ?? today;
  const query = anchor ? getRange(period, anchor) : null;

  // ยังไม่รู้วันนี้ (query เป็น null) ก็ยังไม่ขอข้อมูล
  const bills = useBills(query ?? {}, query !== null);
  const categories = useCategories();

  if (loading) return <p className="p-4">กำลังโหลด...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;
  if (!anchor) return <p className="p-4">กำลังโหลด...</p>;

  const summary = bills.data ? summarizeBills(bills.data) : null;

  const bars = bills.data && period !== "day" ? expenseBars(bills.data, period, anchor) : [];

  function move(delta: number) {
    setAnchorOverride(shiftAnchor(period, anchor!, delta));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">สถิติ</h1>

      {/* แท็บเลือกช่วงเวลา */}
      <div className="grid grid-cols-4 gap-1 rounded-xl bg-gray-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setPeriod(t.value)}
            className={`rounded-lg py-2 text-sm ${
              period === t.value
                ? "bg-white font-bold text-sky-700 shadow-sm"
                : "text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ลูกศรเลื่อนช่วง (โหมดทั้งหมดไม่ต้องมี) */}
      {period !== "all" ? (
        <div className="flex items-center justify-between">
          <button
            onClick={() => move(-1)}
            aria-label="ช่วงก่อนหน้า"
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          <p className="font-bold">{periodLabel(period, anchor)}</p>
          <button
            onClick={() => move(1)}
            aria-label="ช่วงถัดไป"
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      ) : (
        <p className="text-center font-bold">ทั้งหมด</p>
      )}

      {/* ตัวเลขรวมแบบง่าย (ก้าว 6.3 จะทำเป็นการ์ดสวย) */}
      {bills.isLoading || categories.isLoading || !summary ? (
        <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
      ) : summary.count === 0 ? (
        <p className="py-8 text-center text-gray-500">
          ยังไม่มีบิลในช่วงนี้
        </p>
      ) : (
        <>
          {/* เหลือเก็บ */}
          <div className="rounded-xl bg-gray-100 p-4">
            <p className="text-sm text-gray-600">เหลือเก็บ</p>
            <p
              className={`text-3xl font-bold ${
                summary.balance < 0 ? "text-red-700" : "text-emerald-700"
              }`}
            >
              {formatBaht(summary.balance)}
            </p>
          </div>

          {/* รายจ่าย / รายรับ */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-3">
              <p className="text-sm text-gray-600">รายจ่าย</p>
              <p className="text-lg font-bold text-red-700">
                {formatBaht(summary.expense)}
              </p>
            </div>
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm text-gray-600">รายรับ</p>
              <p className="text-lg font-bold text-emerald-700">
                {formatBaht(summary.income)}
              </p>
            </div>
          </div>

          {/* โดนัทตามหมวด */}
          <section className="space-y-2 rounded-xl border p-4">
            <h2 className="font-bold">รายจ่ายตามหมวด</h2>
            <CategoryDonut
              data={summary.byCategory}
              categories={categories.data ?? []}
            />
          </section>

          {period === "day" ? (
          <section className="space-y-2">
            <h2 className="font-bold">รายการของวันนี้</h2>
            <DayBillList bills={bills.data ?? []} />
            </section>
          ) : (
            <section className="space-y-2 rounded-xl border p-4">
              <h2 className="font-bold">
                {period === "month" ? "รายจ่ายรายวัน" : "รายจ่ายรายเดือน"}
              </h2>
              <ExpenseBars data={bars} />
            </section>
          )}

          <p className="text-sm text-gray-500">จำนวนบิล {summary.count}</p>
        </>
      )}
    </div>
  );
}