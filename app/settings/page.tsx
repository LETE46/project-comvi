"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, User } from "lucide-react";
import { useLiff } from "@/components/LiffProvider";
import { useSettings, useUpdateSettings } from "@/lib/hooks";
import { formatBaht } from "@/lib/format";
import type { Settings } from "@/lib/types";

// ลิงก์ไปแชท OA เช่น https://line.me/R/ti/p/@xxxxxxx ตั้งใน .env.local
const OA_URL = process.env.NEXT_PUBLIC_LINE_OA_URL;

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-sky-600";

export default function SettingsPage() {
  const { profile, loading, error } = useLiff();
  const settings = useSettings();

  if (loading) return <p className="p-4">กำลังโหลด...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">ตั้งค่า</h1>

      {/* โปรไฟล์ */}
      <section className="flex items-center gap-3 rounded-xl border p-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-400">
          {profile?.pictureUrl ? (
            <Image
              src={profile.pictureUrl}
              alt=""
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            <User size={28} />
          )}
        </div>
        <p className="min-w-0 truncate text-lg font-bold">
          {profile?.displayName ?? "ไม่ทราบชื่อ"}
        </p>
      </section>

      {/* งบรายเดือน */}
      <section className="space-y-3 rounded-xl border p-4">
        <div>
          <h2 className="font-bold">งบรายเดือน</h2>
          <p className="text-sm text-gray-500">
            ตั้งไว้แล้วหน้าสถิติจะแสดงว่าเหลืองบเท่าไหร่ (เว้นว่างถ้าไม่ต้องการ)
          </p>
        </div>

        {settings.isLoading ? (
          <p className="text-gray-500">กำลังโหลด...</p>
        ) : settings.isError || !settings.data ? (
          <p className="text-red-500">โหลดค่าตั้งไม่สำเร็จ</p>
        ) : (
          <BudgetForm settings={settings.data} />
        )}
      </section>

      {/* วิธีใช้ */}
      <section className="space-y-2 rounded-xl border p-4">
        <h2 className="font-bold">วิธีใช้</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-500">
          <li>ส่งรูปสลีปเข้าแชทของบัญชี LINE OA</li>
          <li>ระบบอ่านสลีปให้อัตโนมัติ และบันทึกเป็นบิล</li>
          <li>เปิดหน้าบิลเพื่อตรวจ แก้ชื่อหรือยอด แล้วกดยืนยัน</li>
        </ol>
        {OA_URL && (
          <a
            href={OA_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center justify-center gap-2 rounded-xl border py-2 text-sm font-medium text-sky-600"
          >
            ไปที่แชทเพื่อส่งสลีป <ExternalLink size={16} />
          </a>
        )}
      </section>
    </div>
  );
}

function BudgetForm({ settings }: { settings: Settings }) {
  const update = useUpdateSettings();
  const [value, setValue] = useState(
    settings.monthlyBudget == null ? "" : String(settings.monthlyBudget)
  );

  const trimmed = value.replace(/,/g, "").trim();
  const parsed = trimmed === "" ? null : Number(trimmed);
  const valid = parsed === null || (Number.isFinite(parsed) && parsed > 0);
  const dirty = parsed !== settings.monthlyBudget;

  return (
    <div className="space-y-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        inputMode="decimal"
        placeholder="เช่น 10000"
        className={inputClass}
      />
      {!valid && <p className="text-xs text-red-500">ใส่ตัวเลขที่มากกว่า 0</p>}
      {update.isError && <p className="text-sm text-red-500">{update.error.message}</p>}
      {update.isSuccess && !dirty && (
        <p className="text-sm text-emerald-600">
          {settings.monthlyBudget == null
            ? "ยกเลิกงบแล้ว ✓"
            : `บันทึกงบ ${formatBaht(settings.monthlyBudget)} แล้ว ✓`}
        </p>
      )}
      <button
        onClick={() => valid && update.mutate({ monthlyBudget: parsed })}
        disabled={!valid || !dirty || update.isPending}
        className="w-full rounded-xl bg-sky-700 py-3 font-bold text-white disabled:opacity-40"
      >
        {update.isPending ? "กำลังบันทึก..." : "บันทึก"}
      </button>
    </div>
  );
}