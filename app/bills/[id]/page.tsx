import { Suspense } from "react";
import BillDetail from "@/components/BillDetail";

export default function BillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p className="p-4">กำลังโหลด...</p>}>
      <BillDetail params={params} />
    </Suspense>
  );
}