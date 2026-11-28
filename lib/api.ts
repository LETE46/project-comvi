import * as mock from "@/lib/mockApi";
import { getIdToken, handleUnauthorized, waitForAuth } from "@/lib/auth";
import type { Bill, BillQuery, BillUpdate, Category, Settings } from "@/lib/types";

// ตั้ง NEXT_PUBLIC_API_URL แล้วจะเรียก backend จริง ไม่ตั้งจะใช้ข้อมูลปลอมใน mockApi.ts
// เช่น NEXT_PUBLIC_API_URL=https://api.example.com (ไม่ต้องมี / ท้าย)
const BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  await waitForAuth();

  const headers: Record<string, string> = { Accept: "application/json" };
  if (init.body) headers["Content-Type"] = "application/json";

  const token = getIdToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (process.env.NODE_ENV !== "production") {
    // localhost ไม่มี idToken จริง: ใช้ header ทดสอบ (ต้องให้ backend รองรับเฉพาะเซิร์ฟเวอร์ทดสอบ)
    headers["X-Dev-User"] = "dev-user";
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers });
  } catch {
    throw new Error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้ง");
  }

  if (res.status === 401) {
    handleUnauthorized(); // token หมดอายุ -> login ใหม่
    throw new Error("หมดเวลาเข้าสู่ระบบ กำลังเข้าสู่ระบบใหม่...");
  }

  if (!res.ok) {
    // error ของ backend อาจเป็น { message } หรือ { detail } (FastAPI)
    const body = await res.json().catch(() => null);
    const text = body?.message ?? (typeof body?.detail === "string" ? body.detail : null);
    throw new Error(text ?? `เกิดข้อผิดพลาด (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ปรับข้อมูลดิบจาก backend ให้ตรงกับ type Bill (ช่องที่ไม่มีให้ค่าเริ่มต้น)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toBill(raw: any): Bill {
  return {
    id: String(raw.id),
    type: raw.type ?? "expense",
    title: raw.title ?? "",
    amount: Number(raw.amount), // backend บางตัวส่ง Decimal เป็น string
    categoryId: raw.categoryId ?? "other",
    billDate: raw.billDate,
    createdAt: raw.createdAt ?? raw.billDate,
    updatedAt: raw.updatedAt ?? raw.billDate,
    note: raw.note ?? "",
    slipUrl: raw.slipUrl ?? "",
    refNo: raw.refNo ?? "",
  };
}

async function realGetBills(query: BillQuery = {}): Promise<Bill[]> {
  const params = new URLSearchParams();
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  const qs = params.toString();
  const rows = await request<unknown[]>(`/bills${qs ? `?${qs}` : ""}`);
  return rows.map(toBill);
}

async function realGetBill(id: string): Promise<Bill> {
  return toBill(await request(`/bills/${encodeURIComponent(id)}`));
}

async function realUpdateBill(id: string, patch: BillUpdate): Promise<Bill> {
  const raw = await request(`/bills/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return toBill(raw);
}

async function realDeleteBill(id: string): Promise<void> {
  await request<void>(`/bills/${encodeURIComponent(id)}`, { method: "DELETE" });
}

async function realGetCategories(): Promise<Category[]> {
  return request<Category[]>("/categories");
}

async function realGetSettings(): Promise<Settings> {
  const raw = await request<Partial<Settings>>("/settings");
  return { monthlyBudget: raw.monthlyBudget ?? null };
}

async function realUpdateSettings(patch: Partial<Settings>): Promise<Settings> {
  const raw = await request<Partial<Settings>>("/settings", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return { monthlyBudget: raw.monthlyBudget ?? null };
}

export const getBills = BASE ? realGetBills : mock.getBills;
export const getBill = BASE ? realGetBill : mock.getBill;
export const updateBill = BASE ? realUpdateBill : mock.updateBill;
export const deleteBill = BASE ? realDeleteBill : mock.deleteBill;
export const getCategories = BASE ? realGetCategories : mock.getCategories;
export const getSettings = BASE ? realGetSettings : mock.getSettings;
export const updateSettings = BASE ? realUpdateSettings : mock.updateSettings;