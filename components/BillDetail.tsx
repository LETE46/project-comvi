"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Receipt, X } from "lucide-react";
import { useBill, useCategories, useDeleteBill, useUpdateBill } from "@/lib/hooks";
import { formatBillDate, fromInputDateTime, toInputDateTime } from "@/lib/format";
import type { Bill, BillUpdate, Category } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-sky-600";

export default function BillDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const bill = useBill(id);
  const categories = useCategories();

  function goBack() {
    // ถ้าเปิดลิงก์ตรงมา (ไม่มีหน้าก่อนหน้า) ให้ไปหน้ารายการแทน
    if (window.history.length > 1) router.back();
    else router.replace("/bills");
  }

  return (
    <div className="space-y-4">
      <button onClick={goBack} className="flex items-center gap-1 text-sm text-sky-600">
        <ChevronLeft size={18} /> บิล
      </button>

      {bill.isLoading || categories.isLoading ? (
        <p className="text-gray-500">กำลังโหลด...</p>
      ) : bill.isError || !bill.data ? (
        <p className="py-8 text-center text-red-500">
          {bill.error?.message ?? "ไม่พบบิลนี้"}
        </p>
      ) : (
        <BillForm bill={bill.data} categories={categories.data ?? []} onDeleted={goBack} />
      )}
    </div>
  );
}

function BillForm({
  bill,
  categories,
  onDeleted,
}: {
  bill: Bill;
  categories: Category[];
  onDeleted: () => void;
}) {
  const update = useUpdateBill();
  const remove = useDeleteBill();

  const [title, setTitle] = useState(bill.title);
  const [amount, setAmount] = useState(String(bill.amount));
  const [categoryId, setCategoryId] = useState(bill.categoryId);
  const [billDate, setBillDate] = useState(toInputDateTime(bill.billDate));
  const [note, setNote] = useState(bill.note);
  const [viewSlip, setViewSlip] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // บิลรายจ่ายไม่ต้องเลือกหมวด "เงินเดือน" (ยกเว้นบิลนี้ใช้อยู่แล้ว)
  const options = categories.filter(
    (c) => bill.type === "income" || c.id !== "salary" || c.id === bill.categoryId
  );

  const amountNumber = Number(amount.replace(/,/g, ""));
  const titleOk = title.trim() !== "";
  const amountOk = Number.isFinite(amountNumber) && amountNumber > 0;
  const dateOk = billDate !== "";
  const valid = titleOk && amountOk && dateOk;

  // เทียบกับค่าบนเซิร์ฟเวอร์ เพื่อส่งเฉพาะช่องที่เปลี่ยน
  const patch: BillUpdate = {};
  if (title.trim() !== bill.title) patch.title = title.trim();
  if (amountOk && amountNumber !== bill.amount) patch.amount = amountNumber;
  if (categoryId !== bill.categoryId) patch.categoryId = categoryId;
  if (dateOk && fromInputDateTime(billDate) !== bill.billDate && billDate !== toInputDateTime(bill.billDate)) {
    patch.billDate = fromInputDateTime(billDate);
  }
  if (note !== bill.note) patch.note = note;

  const dirty = Object.keys(patch).length > 0;
  const needsReview = bill.status === "needs_review";

  function save() {
    // กดบันทึกบนบิลที่รอตรวจสอบ = ผู้ใช้ตรวจแล้ว ให้ยืนยันไปด้วย
    const body: BillUpdate = needsReview ? { ...patch, status: "confirmed" } : patch;
    update.mutate({ id: bill.id, patch: body });
  }

  return (
    <div className="space-y-4">
      {/* รูปสลีป */}
      <button
        type="button"
        onClick={() => bill.slipUrl && setViewSlip(true)}
        className="flex h-56 w-full items-center justify-center overflow-hidden rounded-xl bg-gray-100 text-gray-400"
        aria-label="ดูรูปสลีป"
      >
        {bill.slipUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bill.slipUrl} alt="สลีป" className="h-full w-full object-contain" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-sm">
            <Receipt size={36} />
            ไม่มีรูปสลีป
          </span>
        )}
      </button>

      {needsReview && (
        <p className="rounded-xl bg-amber-100 p-3 text-sm text-amber-900">
          ระบบอ่านสลีปนี้อัตโนมัติ กรุณาตรวจข้อมูลให้ถูกต้องแล้วกดยืนยัน
        </p>
      )}

      <div className="space-y-3">
        <Field label="ชื่อบิล">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className={inputClass}
          />
          {!titleOk && <Hint>ชื่อบิลต้องไม่ว่าง</Hint>}
        </Field>

        <Field label="ยอดรวม (บาท)">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            className={inputClass}
          />
          {!amountOk && <Hint>ใส่ตัวเลขที่มากกว่า 0</Hint>}
        </Field>

        <Field label="หมวดหมู่">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass}
          >
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="วันที่และเวลา">
          <input
            type="datetime-local"
            value={billDate}
            onChange={(e) => setBillDate(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="โน้ต">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={500}
            className={inputClass}
          />
        </Field>
      </div>

      {update.isError && <p className="text-sm text-red-500">{update.error.message}</p>}
      {update.isSuccess && !dirty && !needsReview && (
        <p className="text-sm text-emerald-600">บันทึกแล้ว ✓</p>
      )}

      <button
        onClick={save}
        disabled={!valid || (!dirty && !needsReview) || update.isPending}
        className="w-full rounded-xl bg-sky-700 py-3 font-bold text-white disabled:opacity-40"
      >
        {update.isPending ? "กำลังบันทึก..." : needsReview ? "บันทึกและยืนยันบิล" : "บันทึก"}
      </button>

      {/* ข้อมูลที่แก้ไม่ได้ */}
      <p className="text-xs text-gray-500">
        เลขอ้างอิง {bill.refNo || "-"} · เพิ่มเมื่อ {formatBillDate(bill.createdAt)}
      </p>

      {/* ลบบิล: กดสองครั้งกันพลาด */}
      {confirmDelete ? (
        <div className="space-y-2 rounded-xl border border-red-300 p-3">
          <p className="text-sm">ลบบิลนี้ถาวรใช่ไหม?</p>
          {remove.isError && <p className="text-sm text-red-500">{remove.error.message}</p>}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded-xl border py-2 text-sm"
            >
              ยกเลิก
            </button>
            <button
              onClick={() => remove.mutate(bill.id, { onSuccess: onDeleted })}
              disabled={remove.isPending}
              className="rounded-xl bg-red-600 py-2 text-sm font-bold text-white disabled:opacity-40"
            >
              {remove.isPending ? "กำลังลบ..." : "ลบเลย"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="w-full py-2 text-sm text-red-500"
        >
          ลบบิล
        </button>
      )}

      {/* ดูรูปเต็มจอ (ใช้นิ้วถ่างซูมได้) */}
      {viewSlip && (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/90"
          style={{ touchAction: "pinch-zoom" }}
        >
          <button
            onClick={() => setViewSlip(false)}
            aria-label="ปิด"
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white"
          >
            <X size={22} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bill.slipUrl} alt="สลีป" className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-gray-500">{label}</span>
      {children}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-red-500">{children}</p>;
}
