"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { AppLang } from "@/lib/lang";

type NavbarProps = {
  initialLang: AppLang;
};

export function Navbar({ initialLang }: NavbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<AppLang>(initialLang);

  useEffect(() => {
    setLang(initialLang);
  }, [initialLang]);

  const links = useMemo(
    () =>
      lang === "id"
        ? [
            { href: "/catalog", label: "Katalog" },
            { href: "/community", label: "Komunitas" },
            { href: "/contact", label: "Kontak" },
          ]
        : [
            { href: "/catalog", label: "Catalog" },
            { href: "/community", label: "Community" },
            { href: "/contact", label: "Contact" },
          ],
    [lang],
  );

  async function toggleLanguage() {
    const nextLang = lang === "id" ? "en" : "id";
    setLang(nextLang);

    await fetch("/api/lang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: nextLang }),
      credentials: "include",
    });

    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md">
      <nav className="w-full py-4">
        <div className="flex items-center justify-between px-2 md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo_lucentrez_v2.webp"
              alt="Lucentrez Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <Image
              src="/lucentrez-letter.png"
              alt="Lucentrez"
              width={110}
              height={26}
              className="h-6 w-auto"
              priority
            />
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground transition-colors hover:bg-muted/40"
              onClick={toggleLanguage}
              aria-label={lang === "id" ? "Ganti bahasa ke Inggris" : "Switch language to Indonesian"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M2 12h20M12 2c2.5 2.7 3.8 6.1 3.8 10S14.5 19.3 12 22M12 2C9.5 4.7 8.2 8.1 8.2 12s1.3 7.3 3.8 10" stroke="currentColor" strokeWidth="1.6"/>
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">{lang.toUpperCase()}</span>
            </button>

            <button
              className="rounded-lg border border-border px-3 py-2 text-xs uppercase tracking-widest text-foreground"
              onClick={() => setOpen((value) => !value)}
              type="button"
            >
              Menu
            </button>
          </div>
        </div>

        <div className="hidden px-2 md:grid md:grid-cols-3 md:items-center md:gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo_lucentrez_v2.webp"
              alt="Lucentrez Logo"
              width={48}
              height={48}
              className="h-12 w-12"
            />
            <Image
              src="/lucentrez-letter.png"
              alt="Lucentrez"
              width={170}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          <ul className="flex items-center justify-center gap-5">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 text-foreground transition-colors hover:bg-muted/40"
              onClick={toggleLanguage}
              aria-label={lang === "id" ? "Ganti bahasa ke Inggris" : "Switch language to Indonesian"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M2 12h20M12 2c2.5 2.7 3.8 6.1 3.8 10S14.5 19.3 12 22M12 2C9.5 4.7 8.2 8.1 8.2 12s1.3 7.3 3.8 10" stroke="currentColor" strokeWidth="1.6"/>
              </svg>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">{lang.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="border-t border-border bg-card px-2 pb-5 pt-3 md:hidden"
          >
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
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
