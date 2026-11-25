import { formatBaht } from "@/lib/format";
import type { Bill } from "@/lib/types";

export default function DayBillList({ bills }: { bills: Bill[] }) {
  return (
    <ul className="divide-y rounded-xl border">
      {bills.map((b) => (
        <li key={b.id} className="flex items-center justify-between p-3">
          <span>{b.title}</span>
          <span
            className={b.type === "income" ? "text-emerald-700" : "text-red-700"}
          >
            {b.type === "income" ? "+" : "-"}
            {formatBaht(b.amount)}
          </span>
        </li>
      ))}
    </ul>
  );
}