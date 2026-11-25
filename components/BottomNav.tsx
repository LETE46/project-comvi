"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, List, Settings } from "lucide-react";

const items = [
  { href: "/", label: "สถิติ", Icon: BarChart3 },
  { href: "/bills", label: "บิล", Icon: List },
  { href: "/settings", label: "ตั้งค่า", Icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md">
        {items.map(({ href, label, Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2 text-xs ${
                  active ? "font-bold text-sky-700" : "text-gray-500"
                }`}
              >
                <Icon size={22} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}