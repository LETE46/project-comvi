// จัดรูปแบบเงิน เช่น 15000 -> "฿15,000.00"
export function formatBaht(value: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(value);
}