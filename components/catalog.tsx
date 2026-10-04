"use client";

import { useMemo, useState } from "react";
import { VehicleCard } from "@/components/vehicle-card";
import { categories, fleet, matchesCategory } from "@/lib/fleet";
import { cn } from "@/lib/utils";

const sorts = {
  "prix-asc": { label: "Prix croissant", fn: (a: number, b: number) => a - b },
  "prix-desc": { label: "Prix décroissant", fn: (a: number, b: number) => b - a },
} as const;

export function Catalog() {
  const [category, setCategory] = useState<string>("Toutes");
  const [gearbox, setGearbox] = useState<"Toutes" | "Automatique" | "Manuelle">("Toutes");
  const [sort, setSort] = useState<keyof typeof sorts>("prix-asc");

  const vehicles = useMemo(
    () =>
      fleet
        .filter((v) => matchesCategory(v, category))
        .filter((v) => gearbox === "Toutes" || v.gearbox === gearbox)
        .sort((a, b) => sorts[sort].fn(a.pricePerDay, b.pricePerDay)),
    [category, gearbox, sort],
  );

  return (
    <>
      <div className="sticky top-[72px] z-30 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Catégorie" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 lg:pb-0">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
                  category === c ? "border-ink bg-ink text-paper" : "border-line-strong hover:border-ink",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <label className="flex-1 lg:flex-none">
              <span className="sr-only">Boîte de vitesses</span>
              <select className="field !py-2" value={gearbox} onChange={(e) => setGearbox(e.target.value as typeof gearbox)}>
                <option value="Toutes">Toutes boîtes</option>
                <option value="Automatique">Automatique</option>
                <option value="Manuelle">Manuelle</option>
              </select>
            </label>
            <label className="flex-1 lg:flex-none">
              <span className="sr-only">Trier</span>
              <select className="field !py-2" value={sort} onChange={(e) => setSort(e.target.value as keyof typeof sorts)}>
                {Object.entries(sorts).map(([k, s]) => (
                  <option key={k} value={k}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 lg:py-16">
        <p className="text-sm text-muted" aria-live="polite">
          {vehicles.length} véhicule{vehicles.length > 1 ? "s" : ""} disponible{vehicles.length > 1 ? "s" : ""}
        </p>

        {vehicles.length ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vehicles.map((v, i) => (
              <VehicleCard key={v.slug} vehicle={v} priority={i < 4} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-line-strong p-12 text-center">
            <p className="font-display text-3xl">Aucun véhicule ne correspond.</p>
            <button
              type="button"
              onClick={() => {
                setCategory("Toutes");
                setGearbox("Toutes");
              }}
              className="mt-4 text-sm font-semibold underline underline-offset-4"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </>
  );
}
