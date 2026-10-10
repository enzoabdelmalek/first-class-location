"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ArrowIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/vehicules", label: "Nos véhicules" },
  { href: "/#fonctionnement", label: "Comment ça marche" },
  { href: "/#agence", label: "Livraison" },
  { href: "/#faq", label: "Questions" },
];

/**
 * En-tête. Sur mobile, le menu repose sur <details> : il s'ouvre et se
 * ferme nativement, même avant le chargement du JavaScript (réseau lent,
 * script bloqué). Le JavaScript ne fait qu'ajouter le confort : fermeture
 * au clic sur un lien, à Échap, au changement de page, et blocage du
 * défilement de la page derrière.
 *
 * Pas de `backdrop-blur` sur l'en-tête : il ferait de l'en-tête le cadre
 * de référence du menu en `position: fixed`, qui ne couvrirait plus l'écran.
 */
export function SiteHeader() {
  const menu = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  const close = () => {
    if (menu.current) menu.current.open = false;
  };

  // Changement de page : on referme.
  useEffect(close, [pathname]);

  useEffect(() => {
    const el = menu.current;
    if (!el) return;
    const onToggle = () => {
      document.documentElement.style.overflow = el.open ? "hidden" : "";
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && el.open && (el.open = false);
    // Repasse en bureau menu ouvert : on referme pour rendre le défilement.
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onDesktop = () => desktop.matches && (el.open = false);
    el.addEventListener("toggle", onToggle);
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);
    return () => {
      el.removeEventListener("toggle", onToggle);
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-line bg-ink text-paper">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-4 sm:px-8">
        <Link href="/" aria-label="First Class - accueil" className="text-paper">
          <Logo priority className="h-12 sm:h-[3.25rem]" />
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("text-sm text-muted-on-ink transition-colors hover:text-paper", pathname === item.href && "text-paper")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/reserver"
            className="inline-flex rounded-sm bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-ink sm:px-5"
          >
            Réserver
          </Link>

          <details ref={menu} className="group lg:hidden">
            <summary
              aria-label="Menu"
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-ink-line transition hover:border-paper/40 [&::-webkit-details-marker]:hidden"
            >
              <span aria-hidden className="relative block h-3 w-5">
                <span className="absolute top-0 left-0 h-px w-5 bg-paper transition duration-300 group-open:top-1.5 group-open:rotate-45" />
                <span className="absolute top-3 left-0 h-px w-5 bg-paper transition duration-300 group-open:top-1.5 group-open:-rotate-45" />
              </span>
            </summary>

            {/* Panneau plein écran, sous l'en-tête. */}
            <div className="fixed inset-x-0 top-[72px] bottom-0 flex flex-col overflow-y-auto bg-ink">
              <nav aria-label="Navigation mobile" className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 sm:px-8">
                <ol>
                  {nav.map((item, i) => (
                    <li key={item.href} className="border-b border-ink-line">
                      <Link
                        href={item.href}
                        onClick={close}
                        className="group/link flex items-center gap-5 py-5 opacity-0 transition group-open:animate-[rise_0.5s_cubic-bezier(0.2,0.7,0.2,1)_both] motion-reduce:opacity-100 motion-reduce:group-open:animate-none"
                        style={{ animationDelay: `${60 + i * 50}ms` }}
                      >
                        <span className="font-mono text-xs text-accent-light">{String(i + 1).padStart(2, "0")}</span>
                        <span className="flex-1 font-display text-[1.6rem]/none sm:text-3xl">{item.label}</span>
                        <ArrowIcon className="h-5 w-5 text-muted-on-ink transition group-hover/link:translate-x-1 group-hover/link:text-paper" />
                      </Link>
                    </li>
                  ))}
                </ol>
              </nav>

              <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
                <Link
                  href="/reserver"
                  onClick={close}
                  className="flex items-center justify-center gap-2 rounded-sm bg-accent px-5 py-4 font-semibold text-white transition hover:bg-accent-hover"
                >
                  Réserver un véhicule
                  <ArrowIcon className="h-4 w-4" />
                </Link>
                <a
                  href={`tel:${site.contact.phone}`}
                  className="mt-3 flex items-center justify-center rounded-sm border border-ink-line px-5 py-4 font-semibold transition hover:border-paper/40"
                >
                  {site.contact.phoneDisplay}
                </a>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm text-muted-on-ink">
                  <p>
                    {site.hours[0].days} · {site.hours[0].value}
                  </p>
                  <p className="flex gap-4">
                    {site.socials.map((s) => (
                      <a key={s.label} href={s.url} target="_blank" rel="noreferrer noopener" className="py-1 hover:text-paper">
                        {s.label}
                      </a>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
