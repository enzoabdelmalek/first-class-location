"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/vehicules", label: "Le véhicule" },
  { href: "/#forfaits", label: "Forfaits" },
  { href: "/#fonctionnement", label: "Comment ça marche" },
  { href: "/#agence", label: "L'agence" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-ink-line bg-ink/95 text-paper backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-4 sm:px-8">
        <Link href="/" aria-label="First Class - accueil" className="text-paper">
          <Logo />
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm text-muted-on-ink transition-colors hover:text-paper",
                pathname === item.href && "text-paper",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/reserver"
            className="hidden rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-ink sm:inline-flex"
          >
            Réserver
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-line lg:hidden"
          >
            <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
            <span aria-hidden className="relative block h-3 w-5">
              <span className={cn("absolute left-0 h-px w-5 bg-paper transition", open ? "top-1.5 rotate-45" : "top-0")} />
              <span className={cn("absolute left-0 h-px w-5 bg-paper transition", open ? "top-1.5 -rotate-45" : "top-3")} />
            </span>
          </button>
        </div>
      </div>

      <div id="menu-mobile" hidden={!open} className="border-t border-ink-line lg:hidden">
        <nav aria-label="Navigation mobile" className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-8">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="border-b border-ink-line py-4 font-display text-2xl">
              {item.label}
            </Link>
          ))}
          <Link
            href="/reserver"
            onClick={() => setOpen(false)}
            className="mt-6 rounded-sm bg-accent px-5 py-3.5 text-center font-semibold text-white"
          >
            Réserver un véhicule
          </Link>
        </nav>
      </div>
    </header>
  );
}
