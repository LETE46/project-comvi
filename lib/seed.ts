import type { Bill, Category } from "@/lib/types";

export const seedCategories: Category[] = [
  { id: "food", name: "อาหาร", color: "#0891b2" },
  { id: "transport", name: "เดินทาง", color: "#f59e0b" },
  { id: "shopping", name: "ช้อปปิ้ง", color: "#8b5cf6" },
  { id: "household", name: "ของใช้", color: "#ec4899" },
  { id: "bills", name: "บิล/ค่าบริการ", color: "#64748b" },
  { id: "other", name: "อื่นๆ", color: "#94a3b8" },
  { id: "salary", name: "เงินเดือน", color: "#10b981" },
];

export const seedBills: Bill[] = [
  {
    id: "b1",
    type: "expense",
    title: "พาสต้า",
    amount: 280,
    categoryId: "food",
    billDate: "2026-11-23T20:35:00+07:00",
    createdAt: "2026-11-23T20:36:10+07:00",
    updatedAt: "2026-11-23T20:36:10+07:00",
    note: "",
    slipUrl: "",
    refNo: "REF0001"
  },
  {
    id: "b2",
    type: "expense",
    title: "SEVEN ELEVEN",
    amount: 350,
    categoryId: "other",
    billDate: "2026-11-24T18:10:00+07:00",
    createdAt: "2026-11-24T18:11:00+07:00",
    updatedAt: "2026-11-24T18:11:00+07:00",
    note: "",
    slipUrl: "",
    refNo: "REF0002"
  },
  {
    id: "b3",
    type: "expense",
    title: "Big C",
    amount: 900,
    categoryId: "household",
    billDate: "2026-11-20T12:00:00+07:00",
    createdAt: "2026-11-20T12:05:00+07:00",
    updatedAt: "2026-11-21T09:00:00+07:00",
    note: "ซื้อของเข้าบ้าน",
    slipUrl: "",
    refNo: "REF0003"
  },
  {
    id: "b4",
    type: "expense",
    title: "BTS",
    amount: 62,
    categoryId: "transport",
    billDate: "2026-11-22T08:20:00+07:00",
    createdAt: "2026-11-22T08:21:00+07:00",
    updatedAt: "2026-11-22T08:21:00+07:00",
    note: "",
    slipUrl: "",
    refNo: "REF0004"
  },
  {
    id: "b5",
    type: "income",
    title: "เงินเดือน พ.ย.",
    amount: 15000,
    categoryId: "salary",
    billDate: "2026-11-01T09:00:00+07:00",
    createdAt: "2026-11-01T09:30:00+07:00",
    updatedAt: "2026-11-01T09:30:00+07:00",
    note: "",
    slipUrl: "",
    refNo: "REF0005"
  },
  {
    id: "b6",
    type: "expense",
    title: "ค่าอินเทอร์เน็ต",
    amount: 599,
    categoryId: "bills",
    billDate: "2026-10-15T09:00:00+07:00",
    createdAt: "2026-10-15T09:02:00+07:00",
    updatedAt: "2026-10-15T09:02:00+07:00",
    note: "",
    slipUrl: "",
    refNo: "REF0006"
  },
  {
    id: "b7",
    type: "expense",
    title: "เสื้อยืด",
    amount: 790,
    categoryId: "shopping",
    billDate: "2026-10-03T16:40:00+07:00",
    createdAt: "2026-10-03T16:41:00+07:00",
    updatedAt: "2026-10-03T16:41:00+07:00",
    note: "",
    slipUrl: "",
    refNo: "REF0007"
  },
  {
    id: "b8",
    type: "expense",
    title: "ข้าวมันไก่",
    amount: 60,
    categoryId: "food",
    billDate: "2025-12-24T12:30:00+07:00",
    createdAt: "2025-12-24T12:31:00+07:00",
    updatedAt: "2025-12-24T12:31:00+07:00",
    note: "",
    slipUrl: "",
    refNo: "REF0008"
  },
];