"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLiff } from "@/components/LiffProvider";
import { useBills, useCategories, useSettings } from "@/lib/hooks";
import { getRange, periodLabel, shiftAnchor, type Period } from "@/lib/period";
import { expenseBars, summarizeBills } from "@/lib/stats";
import { useToday } from "@/lib/useToday";
import CategoryDonut from "@/components/CategoryDonut";
import { formatBaht, toInputDateTime } from "@/lib/format";
import DayBillList from "@/components/DayBillList";
import ExpenseBars from "@/components/ExpenseBars";
import Link from "next/link";

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
  const settings = useSettings();

  if (loading) return <p className="p-4">กำลังโหลด...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;
  if (!anchor) return <p className="p-4">กำลังโหลด...</p>;

  const summary = bills.data ? summarizeBills(bills.data) : null;

  const bars = bills.data && period !== "day" ? expenseBars(bills.data, period, anchor) : [];

  const budget = settings.data?.monthlyBudget ?? null;

  // เฉลี่ยต่อเดือน: หารด้วยจำนวนเดือนที่มีรายจ่ายจริง ไม่ใช่ 12 เสมอ
  const monthsWithBills = new Set(
  (bills.data ?? [])
    .filter((b) => b.type === "expense")
    .map((b) => toInputDateTime(b.billDate).slice(0, 7))
  ).size;
  const topCategoryName = summary?.byCategory[0]
  ? categories.data?.find((c) => c.id === summary.byCategory[0].categoryId)?.name
  : undefined;
  
  function move(delta: number) {
    setAnchorOverride(shiftAnchor(period, anchor!, delta));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">สถิติ</h1>

      {/* แท็บเลือกเวลา */}
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

      {/* ลูกศรเลื่อน  */}
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
        <p className="text-center font-bold">ทั้งหมด</p> //โหมดทั้งหมดไม่ต้องมี
      )}

      {/* ตัวเลขรวม */}
      {bills.isLoading || categories.isLoading || !summary ? (
        <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
      ) : summary.count === 0 ? (
        <p className="py-8 text-center text-gray-500">
          ยังไม่มีบิลในช่วงนี้
        </p>
      ) : (
        <>
          {/* การ์ดใหญ่: เดือนที่ตั้งงบ = เหลืองบ, นอกนั้น = รายจ่ายรวม */}
          {period === "month" && budget != null ? (
            <div className="rounded-xl bg-gray-100 p-4">
              <p className="text-sm text-gray-600">เหลืองบ</p>
              <p
                className={`text-3xl font-bold ${
                  budget - summary.expense < 0 ? "text-red-700" : "text-emerald-700"
                }`}
              >
                {formatBaht(budget - summary.expense)}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-300">
                <div
                  className={`h-full ${summary.expense > budget ? "bg-red-600" : "bg-sky-600"}`}
                  style={{ width: `${Math.min(100, (summary.expense / budget) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-gray-100 p-4">
              <p className="text-sm text-gray-600">รายจ่ายรวม</p>
              <p className="text-3xl font-bold text-red-700">{formatBaht(summary.expense)}</p>
            </div>
          )}

          {/* การ์ดเล็ก 2 ใบ (โหมดวันไม่แสดง) */}
          {period === "month" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border-2 border-red-200 bg-red-50 p-3">
                <p className="text-sm text-gray-600">รายจ่าย</p>
                <p className="text-lg font-bold text-red-700">{formatBaht(summary.expense)}</p>
              </div>
              <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3">
                <p className="text-sm text-gray-600">งบที่ตั้งไว้</p>
                {budget != null ? (
                  <p className="text-lg font-bold text-sky-700">{formatBaht(budget)}</p>
                ) : (
                  <Link href="/settings" className="text-sm font-bold text-sky-700 underline">
                    ตั้งงบรายเดือน
                  </Link>
                )}
              </div>
            </div>
          )}
          {(period === "year" || period === "all") && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border-2 border-red-200 bg-red-50 p-3">
                <p className="text-sm text-gray-600">เฉลี่ยต่อเดือน</p>
                <p className="text-lg font-bold text-red-700">
                  {formatBaht(monthsWithBills > 0 ? summary.expense / monthsWithBills : 0)}
                </p>
              </div>
              <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3">
                <p className="text-sm text-gray-600">ใช้มากสุด</p>
                <p className="text-lg font-bold text-sky-700">{topCategoryName ?? "-"}</p>
              </div>
            </div>
          )}

          {/* กราฟโดนัทตามหมวด */}
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