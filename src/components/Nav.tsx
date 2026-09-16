"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/today", label: "Today" },
  { href: "/library", label: "Library" },
  { href: "/notes", label: "Notes" },
  { href: "/ideas", label: "Ideas" },
  { href: "/weekly", label: "Weekly" },
  { href: "/settings", label: "Settings" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="border-b border-ink/10 bg-paper sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link href="/today" className="font-serif text-lg tracking-tight">
          AI <span className="text-ink/40">×</span> Moving Image
        </Link>
        <nav className="flex gap-5 text-sm">
          {ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "font-semibold" : "text-ink/60 hover:text-ink"}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
