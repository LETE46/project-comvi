import Link from "next/link";
import { Receipt } from "lucide-react";
import { formatBaht, formatBillDate } from "@/lib/format";
import type { Bill, Category } from "@/lib/types";

export default function BillRow({
  bill,
  category,
}: {
  bill: Bill;
  category?: Category;
}) {
  const isIncome = bill.type === "income";

  return (
    <li>
      <Link
        href={`/bills/${bill.id}`}
        className="flex items-center gap-3 p-3 active:bg-gray-100/10"
      >
        {/* รูปสลีปย่อ ถ้ายังไม่มีรูปให้ขึ้นไอคอนแทน */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-400">
          {bill.slipUrl ? (
            // ใช้ <img> ธรรมดาไว้ก่อน เพราะยังไม่รู้โดเมนรูปจริงจาก backend
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bill.slipUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <Receipt size={22} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{bill.title}</p>
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: category?.color ?? "#94a3b8" }}
            />
            {category?.name ?? "ไม่ระบุหมวด"} · {formatBillDate(bill.billDate)}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className={isIncome ? "text-emerald-700" : "text-red-700"}>
            {isIncome ? "+" : "-"}
            {formatBaht(bill.amount)}
          </p>
        </div>
      </Link>
    </li>
  );
}
