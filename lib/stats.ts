import type { Bill } from "@/lib/types";
import type { Period } from "@/lib/period";

export type CategoryTotal = {
  categoryId: string;
  value: number; // ยอดรายจ่ายรวมของหมวดนี้
};

export type Summary = {
  income: number;
  expense: number;
  balance: number; // รายรับ - รายจ่าย
  count: number; // จำนวนบิลทั้งหมด
  byCategory: CategoryTotal[]; // เฉพาะรายจ่าย เรียงมากไปน้อย
};

export function summarizeBills(bills: Bill[]): Summary {
  let income = 0;
  let expense = 0;
  const totals = new Map<string, number>();

  for (const b of bills) {
    if (b.type === "income") {
      income += b.amount;
    } else {
      expense += b.amount;
      totals.set(b.categoryId, (totals.get(b.categoryId) ?? 0) + b.amount);
    }
  }

  const byCategory = Array.from(totals, ([categoryId, value]) => ({
    categoryId,
    value,
  })).sort((a, b) => b.value - a.value);

  return {
    income,
    expense,
    balance: income - expense,
    count: bills.length,
    byCategory,
  };
}

// ---------- กราฟแท่ง ----------

export type BarPoint = { label: string; value: number };

const monthsShort = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

// วันที่ตามเวลาไทยของบิล เป็น "2026-11-23"
// (บวก 7 ชั่วโมงแล้วอ่านแบบ UTC เพื่อไม่ขึ้นกับเขตเวลาของเครื่อง)
function bangkokYMD(iso: string): string {
  return new Date(Date.parse(iso) + 7 * 3600 * 1000).toISOString().slice(0, 10);
}

// รวมรายจ่ายเป็นแท่งตามโหมด (ไม่ใช้กับโหมดวัน)
export function expenseBars(
  bills: Bill[],
  period: Period,
  anchor: string
): BarPoint[] {
  const expenses = bills.filter((b) => b.type === "expense");

  if (period === "month") {
    const [y, m] = anchor.split("-").map(Number);
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const sums = new Array<number>(daysInMonth).fill(0);
    for (const b of expenses) {
      const day = Number(bangkokYMD(b.billDate).slice(8, 10));
      sums[day - 1] += b.amount;
    }
    return sums.map((value, i) => ({ label: String(i + 1), value }));
  }

  if (period === "year") {
    const sums = new Array<number>(12).fill(0);
    for (const b of expenses) {
      const month = Number(bangkokYMD(b.billDate).slice(5, 7));
      sums[month - 1] += b.amount;
    }
    return sums.map((value, i) => ({ label: monthsShort[i], value }));
  }

  // all: รวมตามเดือน-ปี เฉพาะที่มีข้อมูล เรียงเก่าไปใหม่
  const sums = new Map<string, number>();
  for (const b of expenses) {
    const key = bangkokYMD(b.billDate).slice(0, 7); // "2026-11"
    sums.set(key, (sums.get(key) ?? 0) + b.amount);
  }
  return Array.from(sums.keys())
    .sort()
    .map((key) => {
      const [y, m] = key.split("-").map(Number);
      return {
        label: `${monthsShort[m - 1]} ${String(y + 543).slice(2)}`,
        value: sums.get(key) ?? 0,
      };
    });
}