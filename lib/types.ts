export type BillType = "expense" | "income";
export type BillStatus = "needs_review" | "confirmed";

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Bill = {
  id: string;
  type: BillType;
  title: string;
  amount: number;
  categoryId: string;
  billDate: string;
  createdAt: string;
  updatedAt: string;
  note: string;
  slipUrl: string;
  refNo: string;
  status: BillStatus;
};

// ช่องที่ผู้ใช้แก้ได้ในหน้า LIFF
export type BillUpdate = Partial<
  Pick<Bill, "title" | "amount" | "categoryId" | "billDate" | "note" | "status">
>;

// ช่วงเวลาที่ใช้ดึงบิล: from รวมวันนั้น, to ไม่รวมวันนั้น
export type BillQuery = {
  from?: string;
  to?: string;
};

// ค่าตั้งของผู้ใช้ (เก็บฝั่ง backend ผูกกับ userId)
export type Settings = {
  monthlyBudget: number | null; // null = ยังไม่ตั้งงบ
};