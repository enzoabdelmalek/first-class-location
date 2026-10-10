"use client";

import { useState } from "react";
import { DateInput } from "@/components/date-input";
import { ArrowIcon } from "@/components/icons";
import { offers, parseStay } from "@/lib/availability";
import { isoDay } from "@/lib/dates";
import { fleetFromPrice, MAX_ONLINE_DAYS } from "@/lib/fleet";
import { useMounted } from "@/lib/use-mounted";
import { cn, euros } from "@/lib/utils";

/**
 * Recherche par dates : hero de l'accueil et filtre de la page véhicules.
 * Le nombre de véhicules libres et le prix de départ s'affichent pendant la
 * saisie ; l'envoi mène à /vehicules?du=…&au=…, qui liste les véhicules
 * disponibles à ces dates. Sans JavaScript, le formulaire fonctionne aussi.
 */
export function DateSearch({
  initial,
  cta = "Voir les disponibilités",
  className,
}: {
  initial?: { du?: string; au?: string };
  cta?: string;
  className?: string;
}) {
  const mounted = useMounted();
  const [from, setFrom] = useState(initial?.du ?? "");
  const [to, setTo] = useState(initial?.au ?? "");

  const stay = parseStay(from, to);
  const free = stay && !stay.quote ? offers(stay.start, stay.end).filter((o) => o.available && o.rate?.kind === "price") : [];
  const best = free.length ? Math.min(...free.map((o) => (o.rate?.kind === "price" ? o.rate.price : Infinity))) : null;
  const tomorrow = mounted ? isoDay(1) : undefined;

  const status = !stay
    ? `Choisissez vos dates : les véhicules libres s’affichent aussitôt. Dès ${euros(fleetFromPrice)}, livraison incluse dans Paris.`
    : stay.quote
      ? `Au-delà de ${MAX_ONLINE_DAYS} jours, nous établissons un tarif sur mesure.`
      : free.length
        ? `${stay.days} jour${stay.days > 1 ? "s" : ""} · ${free.length} véhicule${free.length > 1 ? "s" : ""} disponible${free.length > 1 ? "s" : ""} · dès ${euros(best!)}`
        : "Aucun véhicule libre à ces dates : essayez d’autres dates ou appelez-nous.";

  return (
    <form
      action="/vehicules"
      className={cn(
        "grid gap-px overflow-hidden rounded-sm border border-ink-line bg-ink-line text-left sm:grid-cols-[1fr_1fr_auto]",
        className,
      )}
    >
      <label className="block bg-ink-soft px-4 py-3">
        <span className="eyebrow block text-muted-on-ink">Départ</span>
        <DateInput
          name="du"
          required
          min={tomorrow}
          value={from}
          onChange={(v) => {
            setFrom(v);
            if (to && to < v) setTo(v);
          }}
          className="mt-1 w-full bg-transparent text-paper [color-scheme:dark] focus:outline-none"
          placeholderClassName="mt-1 text-muted-on-ink"
        />
      </label>
      <label className="block bg-ink-soft px-4 py-3">
        <span className="eyebrow block text-muted-on-ink">Retour</span>
        <DateInput
          name="au"
          required
          min={from || tomorrow}
          value={to}
          onChange={setTo}
          className="mt-1 w-full bg-transparent text-paper [color-scheme:dark] focus:outline-none"
          placeholderClassName="mt-1 text-muted-on-ink"
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 bg-accent px-7 py-4 font-semibold whitespace-nowrap text-white transition hover:bg-accent-hover"
      >
        {cta}
        <ArrowIcon className="h-4 w-4" />
      </button>
      <p aria-live="polite" className="bg-ink px-4 py-2 text-xs text-muted-on-ink sm:col-span-3">
        {status}
      </p>
    </form>
  );
}
