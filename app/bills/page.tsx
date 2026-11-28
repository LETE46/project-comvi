"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLiff } from "@/components/LiffProvider";
import BillRow from "@/components/BillRow";
import { useBills, useCategories } from "@/lib/hooks";
import { getRange, periodLabel, shiftAnchor } from "@/lib/period";
import { formatBaht } from "@/lib/format";
import { useToday } from "@/lib/useToday";

export default function BillsPage() {
  const { loading, error } = useLiff();
  const today = useToday();

  const [anchorOverride, setAnchorOverride] = useState<string | null>(null);

  const anchor = anchorOverride ?? today;
  const query = anchor ? getRange("month", anchor) : null;

  const bills = useBills(query ?? {}, query !== null);
  const categories = useCategories();

  if (loading) return <p className="p-4">กำลังโหลด...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;
  if (!anchor) return <p className="p-4">กำลังโหลด...</p>;

  const all = bills.data ?? [];
  const total = all.reduce((sum, b) => sum + (b.type === "expense" ? b.amount : 0), 0);
  const categoryById = new Map((categories.data ?? []).map((c) => [c.id, c]));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">บิล</h1>

      {/* เลื่อนเดือน */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setAnchorOverride(shiftAnchor("month", anchor, -1))}
          aria-label="เดือนก่อนหน้า"
          className="rounded-full p-2 hover:bg-gray-100/10"
        >
          <ChevronLeft size={20} />
        </button>
        <p className="font-bold">{periodLabel("month", anchor)}</p>
        <button
          onClick={() => setAnchorOverride(shiftAnchor("month", anchor, 1))}
          aria-label="เดือนถัดไป"
          className="rounded-full p-2 hover:bg-gray-100/10"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {bills.isError ? (
        <p className="py-8 text-center text-red-500">โหลดบิลไม่สำเร็จ ลองใหม่อีกครั้ง</p>
      ) : bills.isLoading ? (
        <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
      ) : all.length === 0 ? (
        <p className="py-8 text-center text-gray-500">ยังไม่มีบิลในเดือนนี้</p>
      ) : (
        <>
          <ul className="divide-y rounded-xl border">
            {all.map((b) => (
              <BillRow key={b.id} bill={b} category={categoryById.get(b.categoryId)} />
            ))}
          </ul>
          <p className="text-sm text-gray-500">
            {all.length} บิล · รายจ่ายรวมเดือนนี้ {formatBaht(total)}
          </p>
        </>
      )}
    </div>
  );
}