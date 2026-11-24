import { seedBills, seedCategories } from "@/lib/seed";
import type { Bill, BillQuery, BillUpdate, Category } from "@/lib/types";

// "ฐานข้อมูลปลอม" ทำสำเนาจากข้อมูลเริ่มต้นมาให้แก้ได้
let bills: Bill[] = structuredClone(seedBills);
const categories: Category[] = structuredClone(seedCategories);

// หน่วงเวลาให้เหมือนเรียกเน็ตจริง จะได้เห็นสถานะ "กำลังโหลด"
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// ขอรายการบิล (กรองตามช่วงเวลาได้) เรียงใหม่ไปเก่า
export async function getBills(query: BillQuery = {}): Promise<Bill[]> {
  await delay();
  const from = query.from ? Date.parse(query.from) : -Infinity;
  const to = query.to ? Date.parse(query.to) : Infinity;

  return bills
    .filter((b) => {
      const t = Date.parse(b.billDate);
      return t >= from && t < to;
    })
    .sort((a, b) => Date.parse(b.billDate) - Date.parse(a.billDate))
    .map((b) => ({ ...b }));
}

// ขอบิลใบเดียว
export async function getBill(id: string): Promise<Bill> {
  await delay();
  const bill = bills.find((b) => b.id === id);
  if (!bill) throw new Error("ไม่พบบิลนี้");
  return { ...bill };
}

// แก้บิล
export async function updateBill(id: string, patch: BillUpdate): Promise<Bill> {
  await delay();
  const index = bills.findIndex((b) => b.id === id);
  if (index === -1) throw new Error("ไม่พบบิลนี้");

  if (patch.amount !== undefined && !(patch.amount > 0)) {
    throw new Error("ยอดเงินต้องมากกว่า 0");
  }
  if (patch.title !== undefined && patch.title.trim() === "") {
    throw new Error("ชื่อบิลต้องไม่ว่าง");
  }

  const updated: Bill = {
    ...bills[index],
    ...patch,
    updatedAt: new Date().toISOString(), // backend จริงจะใส่ให้เอง
  };
  bills[index] = updated;
  return { ...updated };
}

// ลบบิล
export async function deleteBill(id: string): Promise<void> {
  await delay();
  // backend จริงควรลบแบบซ่อน (เก็บ deletedAt) ไม่ใช่ลบแถวทิ้ง
  bills = bills.filter((b) => b.id !== id);
}

// ขอรายการหมวดหมู่
export async function getCategories(): Promise<Category[]> {
  await delay(100);
  return categories.map((c) => ({ ...c }));
}