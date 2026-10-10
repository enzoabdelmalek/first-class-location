"use client";

import { useState } from "react";
import { ArrowIcon } from "@/components/icons";
import { isoDay } from "@/lib/dates";
import { fromPrice, MAX_ONLINE_DAYS, tariff, tariffLabel, type Vehicle } from "@/lib/fleet";
import { useMounted } from "@/lib/use-mounted";
import { euros } from "@/lib/utils";

/**
 * Entrée du tunnel depuis le hero : deux dates, le prix tombe tout de suite,
 * et le bouton ouvre la réservation avec les dates déjà remplies. Sans
 * JavaScript, le formulaire envoie quand même vers /reserver.
 */
export function QuickBooking({ vehicle }: { vehicle: Vehicle }) {
  const mounted = useMounted();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Mêmes heures par défaut que le tunnel : 10 h au départ comme au retour.
  const rate = from && to ? tariff(vehicle, new Date(`${from}T10:00`), new Date(`${to}T10:00`)) : null;
  const tomorrow = mounted ? isoDay(1) : undefined;

  const cta =
    rate?.kind === "price"
      ? `Réserver · ${euros(rate.price)}`
      : rate?.kind === "quote"
        ? "Demander un devis"
        : `Réserver · dès ${euros(fromPrice(vehicle))}`;

  return (
    <form action="/reserver" className="mx-auto mt-8 grid max-w-3xl gap-px overflow-hidden rounded-sm border border-ink-line bg-ink-line text-left sm:grid-cols-[1fr_1fr_auto]">
      <input type="hidden" name="vehicule" value={vehicle.slug} />
      <label className="block bg-ink-soft px-4 py-3">
        <span className="eyebrow block text-muted-on-ink">Départ</span>
        <input
          type="date"
          name="du"
          min={tomorrow}
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            if (to && to < e.target.value) setTo(e.target.value);
          }}
          className="mt-1 w-full bg-transparent text-paper [color-scheme:dark] focus:outline-none"
        />
      </label>
      <label className="block bg-ink-soft px-4 py-3">
        <span className="eyebrow block text-muted-on-ink">Retour</span>
        <input
          type="date"
          name="au"
          min={from || tomorrow}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="mt-1 w-full bg-transparent text-paper [color-scheme:dark] focus:outline-none"
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
        {rate?.kind === "price"
          ? `${rate.days} jour${rate.days > 1 ? "s" : ""} · forfait ${tariffLabel(rate)} · livraison incluse dans Paris`
          : rate?.kind === "quote"
            ? `Au-delà de ${MAX_ONLINE_DAYS} jours, tarif sur mesure.`
            : "Choisissez vos dates : le prix s’affiche aussitôt. Livraison incluse dans Paris."}
      </p>
    </form>
  );
}
