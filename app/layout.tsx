import "./globals.css";
import type { Metadata } from "next";
import LiffProvider from "@/components/LiffProvider";

export const metadata: Metadata = {
  title: "Bill Saving",
  description: "สรุปรายรับรายจ่ายจากสลีป",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <LiffProvider>{children}</LiffProvider>
      </body>
    </html>
  );
}