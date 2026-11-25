import type { BillQuery } from "@/lib/types";

export type Period = "day" | "month" | "year" | "all";

const TZ = "+07:00"; // เขตเวลาไทย (ไทยไม่มีเวลาออมแสง ค่านี้คงที่)

const monthsFull = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];
const monthsShort = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

// วันนี้ตามเวลาไทย รูปแบบ "2026-11-25"
export function todayBangkok(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(
    new Date()
  );
}

// "2026-11-25" -> { y: 2026, m: 11, d: 25 }
function parse(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return { y, m, d };
}

// สร้างวันที่แบบ UTC (เดือนล้นปีได้ เช่น เดือน 13 = ม.ค. ปีถัดไป)
function utc(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m - 1, d));
}

// Date -> "2026-11-25"
function toYMD(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// "2026-11-25" -> "2026-11-25T00:00:00+07:00"
function startOfDay(ymd: string): string {
  return `${ymd}T00:00:00${TZ}`;
}

// ช่วงเวลาที่ใช้ดึงบิล (from รวม, to ไม่รวม)
export function getRange(period: Period, anchor: string): BillQuery {
  const { y, m, d } = parse(anchor);

  switch (period) {
    case "day":
      return {
        from: startOfDay(toYMD(utc(y, m, d))),
        to: startOfDay(toYMD(utc(y, m, d + 1))),
      };
    case "month":
      return {
        from: startOfDay(toYMD(utc(y, m, 1))),
        to: startOfDay(toYMD(utc(y, m + 1, 1))),
      };
    case "year":
      return {
        from: startOfDay(toYMD(utc(y, 1, 1))),
        to: startOfDay(toYMD(utc(y + 1, 1, 1))),
      };
    case "all":
      return {}; // ไม่มี from/to = ขอทั้งหมด
  }
}

// เลื่อนวันที่อ้างอิง delta = -1 (ก่อนหน้า) หรือ +1 (ถัดไป)
export function shiftAnchor(period: Period, anchor: string, delta: number): string {
  const { y, m, d } = parse(anchor);

  switch (period) {
    case "day":
      return toYMD(utc(y, m, d + delta));
    case "month":
      return toYMD(utc(y, m + delta, 1));
    case "year":
      return toYMD(utc(y + delta, 1, 1));
    case "all":
      return anchor;
  }
}

// ข้อความหัวช่วง เป็นปี พ.ศ.
export function periodLabel(period: Period, anchor: string): string {
  const { y, m, d } = parse(anchor);
  const be = y + 543;

  switch (period) {
    case "day":
      return `${d} ${monthsShort[m - 1]} ${be}`;
    case "month":
      return `${monthsFull[m - 1]} ${be}`;
    case "year":
      return `พ.ศ. ${be}`;
    case "all":
      return "ทั้งหมด";
  }
}