"use client";

import { useState } from "react";
import { ArrowIcon } from "@/components/icons";
import { site } from "@/lib/site";
import { useMounted } from "@/lib/use-mounted";

/** Créneaux de prise en charge et de retour, de 8h à 19h30. */
export const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const h = 8 + Math.floor(i / 2);
  return `${String(h).padStart(2, "0")}:${i % 2 ? "30" : "00"}`;
});

export function isoDay(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("sv-SE"); // AAAA-MM-JJ, en heure locale
}

/**
 * Recherche rapide du hero. Formulaire GET classique vers /reserver :
 * il fonctionne même sans JavaScript, le script ne fait que pré-remplir
 * les dates (demain → dans 3 jours).
 */
export function QuickSearch() {
  const mounted = useMounted();
  const [picked, setPicked] = useState({ from: "", to: "" });
  const dates = {
    min: mounted ? isoDay(0) : "",
    from: picked.from || (mounted ? isoDay(1) : ""),
    to: picked.to || (mounted ? isoDay(4) : ""),
  };

  const label = "mb-1.5 block text-[0.68rem] font-semibold tracking-[0.18em] text-muted uppercase";

  return (
    <form
      action="/reserver"
      method="get"
      className="grid gap-3 rounded-2xl bg-surface p-3 text-ink shadow-2xl sm:grid-cols-2 sm:p-4 lg:grid-cols-[1.3fr_1fr_0.7fr_1fr_0.7fr_auto] lg:items-end"
    >
      <label className="sm:col-span-2 lg:col-span-1">
        <span className={label}>Lieu de prise en charge</span>
        <select name="lieu" className="field" defaultValue="agence">
          {site.locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className={label}>Départ</span>
        <input
          type="date"
          name="depart"
          required
          className="field"
          min={dates.min}
          value={dates.from}
          onChange={(e) => setPicked({ from: e.target.value, to: dates.to < e.target.value ? e.target.value : dates.to })}
        />
      </label>
      <label>
        <span className={label}>Heure</span>
        <select name="hd" className="field" defaultValue="10:00">
          {timeSlots.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={label}>Retour</span>
        <input
          type="date"
          name="retour"
          required
          className="field"
          min={dates.from || dates.min}
          value={dates.to}
          onChange={(e) => setPicked({ from: dates.from, to: e.target.value })}
        />
      </label>
      <label>
        <span className={label}>Heure</span>
        <select name="hr" className="field" defaultValue="10:00">
          {timeSlots.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="inline-flex h-[50px] items-center justify-center gap-2 rounded-xl bg-ink px-6 font-semibold text-paper transition hover:bg-champagne hover:text-ink sm:col-span-2 lg:col-span-1"
      >
        Voir les véhicules
        <ArrowIcon className="h-4 w-4" />
      </button>
    </form>
  );
}
