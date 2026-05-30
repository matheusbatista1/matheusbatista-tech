"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Inbox" },
  { href: "/admin/hero", label: "Hero" },
  { href: "/admin/about", label: "About" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin" || pathname.match(/^\/[a-z]{2}\/admin\/?$/);
    }
    return pathname.endsWith(href) || pathname.includes(`${href}/`);
  };

  return (
    <nav className="admin-nav" aria-label="Admin sections">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={["admin-nav-item", isActive(item.href) ? "on" : ""].filter(Boolean).join(" ")}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
