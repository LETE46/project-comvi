// จัดรูปแบบเงิน เช่น 15000 -> "฿15,000.00"
export function formatBaht(value: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(value);
}

const thaiMonthsShort = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000; // ไทย UTC+7 ไม่มีเวลาออมแสง

// ISO -> "YYYY-MM-DDTHH:mm" ตามเวลาไทย (ค่าที่ <input type="datetime-local"> ต้องการ)
export function toInputDateTime(iso: string): string {
  return new Date(Date.parse(iso) + BANGKOK_OFFSET_MS).toISOString().slice(0, 16);
}

// "YYYY-MM-DDTHH:mm" (เวลาไทย) -> ISO ที่ backend รับ เช่น "2026-11-23T20:35:00+07:00"
export function fromInputDateTime(value: string): string {
  return `${value}:00+07:00`;
}

// ISO -> "23 พ.ย. 2569 20:35" (พ.ศ. เวลาไทย)
export function formatBillDate(iso: string): string {
  const d = new Date(Date.parse(iso) + BANGKOK_OFFSET_MS);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${d.getUTCDate()} ${thaiMonthsShort[d.getUTCMonth()]} ${
    d.getUTCFullYear() + 543
  } ${hh}:${mm}`;
}