"use client";

import { useEffect, useState } from "react";
import { todayBangkok } from "@/lib/period";

// ได้ "วันนี้" ตามเวลาไทย เช่น "2026-11-25"
// ตอน prerender และการวาดครั้งแรกได้ null เบราว์เซอร์ค่อยใส่ค่าจริง
export function useToday(): string | null {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    // ตั้งค่าในการเรียกแบบรอ ไม่ใช่แบบทันที ตามที่กฎ ESLint ต้องการ
    const id = requestAnimationFrame(() => setToday(todayBangkok()));
    return () => cancelAnimationFrame(id);
  }, []);

  return today;
}