import "./globals.css";
import { Suspense } from "react";
import type { Metadata } from "next";
import LiffProvider from "@/components/LiffProvider";
import Providers from "@/components/Providers";
import BottomNav from "@/components/BottomNav";


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
        <Providers>
          <LiffProvider>
            <div className="mx-auto min-h-screen max-w-md px-4 pb-24 pt-4">
              {children}
            </div>
            {/* dynamic (/bills/[id]) ต้องครอบ Suspense */}
            <Suspense fallback={null}>
              <BottomNav />
            </Suspense>
          </LiffProvider>
        </Providers>
      </body>
    </html>
  );
}