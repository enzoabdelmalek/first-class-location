"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

/**
 * Bandeau et centre de préférences cookies, conformes aux recommandations
 * de la CNIL :
 * - « Tout refuser » aussi visible et aussi simple que « Tout accepter » ;
 * - aucun traceur non essentiel avant consentement ;
 * - choix conservé 6 mois, puis redemandé ;
 * - préférences modifiables à tout moment (pied de page, page Cookies).
 *
 * Les autres composants lisent le choix via `readConsent()` et écoutent
 * l'évènement `fc:consent` pour charger un traceur une fois autorisé.
 */

const STORAGE_KEY = "fc-consent";
const OPEN_EVENT = "fc:open-cookies";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 182; // ~6 mois

export type Consent = {
  analytics: boolean;
  marketing: boolean;
  date: string;
};

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Consent;
    if (Date.now() - new Date(parsed.date).getTime() > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveConsent(choice: Omit<Consent, "date">) {
  const consent: Consent = { ...choice, date: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Stockage indisponible (navigation privée) : le choix vaut pour la session.
  }
  window.dispatchEvent(new CustomEvent("fc:consent", { detail: consent }));
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function CookieSettingsButton({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button type="button" onClick={openCookieSettings} className={cn("text-left", className)}>
      {children}
    </button>
  );
}

const purposes = [
  {
    id: "necessary",
    title: "Strictement nécessaires",
    text: "Sécurité, réservation et paiement, mémorisation de vos choix. Exemptés de consentement.",
    locked: true,
  },
  {
    id: "analytics",
    title: "Mesure d’audience",
    text: "Statistiques de fréquentation anonymisées, pour améliorer le site.",
    locked: false,
  },
  {
    id: "marketing",
    title: "Publicité et réseaux sociaux",
    text: "Mesure de nos campagnes et contenus des réseaux sociaux.",
    locked: false,
  },
] as const;

export function CookieConsent() {
  const mounted = useMounted();
  // "auto" : le bandeau s'affiche tant qu'aucun choix valide n'est enregistré.
  const [mode, setMode] = useState<"auto" | "open" | "closed">("auto");
  const [details, setDetails] = useState(false);
  const [choice, setChoice] = useState({ analytics: false, marketing: false });
  const visible = mode === "open" || (mode === "auto" && mounted && !readConsent());

  useEffect(() => {
    const open = () => {
      const current = readConsent();
      if (current) setChoice({ analytics: current.analytics, marketing: current.marketing });
      setDetails(true);
      setMode("open");
    };
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  if (!visible) return null;

  const decide = (c: { analytics: boolean; marketing: boolean }) => {
    saveConsent(c);
    setChoice(c);
    setMode("closed");
    setDetails(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-5"
    >
      <div className="mx-auto max-w-3xl rounded-md border border-ink-line bg-ink p-5 text-paper shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-accent-light">Cookies</p>
            <h2 id="cookie-title" className="mt-2 font-display text-lg sm:text-2xl">
              Votre vie privée, vos règles.
            </h2>
          </div>
          {/* Fermer sans choisir vaut refus. Les deux boutons « Tout refuser » et
              « Tout accepter » ont volontairement le même poids visuel. */}
          <button
            type="button"
            onClick={() => decide({ analytics: false, marketing: false })}
            className="shrink-0 text-xs text-muted-on-ink underline underline-offset-4 hover:text-paper"
          >
            Continuer sans accepter
          </button>
        </div>

        <p className="mt-3 text-sm/relaxed text-muted-on-ink">
          Nous utilisons des cookies nécessaires au fonctionnement du site et, avec votre accord, des
          cookies de mesure d’audience et de publicité. Vous pouvez changer d’avis à tout moment.{" "}
          <Link href="/cookies" className="text-paper underline underline-offset-4">
            En savoir plus
          </Link>
        </p>

        {details ? (
          <ul className="mt-5 divide-y divide-ink-line rounded-sm border border-ink-line">
            {purposes.map((p) => {
              const checked = p.locked ? true : choice[p.id as "analytics" | "marketing"];
              return (
                <li key={p.id} className="flex items-start justify-between gap-4 p-4">
                  <div>
                    <p className="text-sm font-semibold">{p.title}</p>
                    <p className="mt-1 text-xs/relaxed text-muted-on-ink">{p.text}</p>
                  </div>
                  <label className={cn("relative inline-flex shrink-0 items-center", p.locked ? "cursor-not-allowed" : "cursor-pointer")}>
                    <span className="sr-only">{p.title}</span>
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={checked}
                      disabled={p.locked}
                      onChange={(e) => setChoice((c) => ({ ...c, [p.id]: e.target.checked }))}
                    />
                    <span className="h-6 w-11 rounded-full bg-ink-line transition peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-disabled:opacity-60" />
                    <span className="absolute left-1 h-4 w-4 rounded-full bg-paper transition peer-checked:translate-x-5" />
                  </label>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => decide({ analytics: false, marketing: false })}
            className="rounded-sm bg-paper px-5 py-3 text-sm font-semibold text-ink hover:bg-accent"
          >
            Tout refuser
          </button>
          {details ? (
            <button
              type="button"
              onClick={() => decide(choice)}
              className="rounded-sm border border-paper/40 px-5 py-3 text-sm font-semibold hover:border-paper"
            >
              Enregistrer mes choix
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDetails(true)}
              className="rounded-sm border border-paper/40 px-5 py-3 text-sm font-semibold hover:border-paper"
            >
              Personnaliser
            </button>
          )}
          <button
            type="button"
            onClick={() => decide({ analytics: true, marketing: true })}
            className="rounded-sm bg-paper px-5 py-3 text-sm font-semibold text-ink hover:bg-accent"
          >
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
