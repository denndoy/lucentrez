"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "Featured" },
  { href: "/catalog", label: "Catalog" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <nav className="mx-auto w-full max-w-7xl px-5 py-4 md:px-8">
        <div className="flex items-center justify-between md:hidden">
          <Link href="/" className="font-display text-2xl tracking-[0.18em] text-foreground">
            LUCENTREZN
          </Link>

          <button
            className="rounded-lg border border-border px-3 py-2 text-xs uppercase tracking-widest text-foreground"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            Menu
          </button>
        </div>

        <div className="hidden md:block">
          <div className="relative flex items-center justify-center py-1">
            <Link href="/" className="font-display text-5xl tracking-[0.08em] text-foreground">
              LUCENTREZN
            </Link>
          </div>

          <ul className="mt-4 flex items-center justify-center gap-9">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-border bg-card px-5 pb-5 pt-3 md:hidden">
          <ul className="flex flex-col gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm uppercase tracking-widest text-muted hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
