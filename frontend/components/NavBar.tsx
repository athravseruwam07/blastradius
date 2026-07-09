"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, Server } from "lucide-react";
import Logo from "./Logo";

const LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/submit", label: "Score a deploy", icon: PlusCircle },
  { href: "/services", label: "Services", icon: Server },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-8 px-6">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <Logo className="size-6" />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Blastradius
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
