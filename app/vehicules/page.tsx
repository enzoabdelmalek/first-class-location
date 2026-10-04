import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { PackageGrid, VehicleHeadline, VehicleVisual } from "@/components/vehicle";
import { fleet, fromPrice } from "@/lib/fleet";
import { site } from "@/lib/site";
import { euros } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Nos véhicules",
  description: `Audi RS3 Sportback gris mat à louer à ${site.city} : fiche technique, forfaits semaine et week-end.`,
};

/**
 * Catalogue : une fiche pleine page par véhicule. Avec un seul modèle, la
 * page fait office de fiche produit ; elle s'allonge d'elle-même quand la
 * flotte grandit.
 */
export default function VehiclesPage() {
  return (
    <div className="bg-ink text-paper">
      {fleet.map((car, i) => (
        <article key={car.slug} className={i > 0 ? "border-t border-ink-line" : undefined}>
          <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-8 lg:pt-20">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="eyebrow rise text-accent-light">
                  {car.category} · {car.finish}
                </p>
                <h1 className="rise mt-4 font-display text-4xl/[1.02] sm:text-6xl/[1.02]">
                  {car.brand} <span className="text-accent-light italic">{car.model}</span>
                </h1>
              </div>
              <Link
                href={`/reserver?vehicule=${car.slug}`}
                className="inline-flex items-center justify-center gap-2 self-start rounded-sm bg-accent px-7 py-4 font-semibold text-white transition hover:bg-accent-hover lg:self-auto"
              >
                Réserver · dès {euros(fromPrice(car))}
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </div>

            <VehicleVisual vehicle={car} animated={i === 0} priority={i === 0} className="mx-auto mt-6 max-w-4xl" />
            <VehicleHeadline vehicle={car} />
          </div>

          <div className="bg-paper text-ink">
            <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:gap-20 lg:py-24">
              <div>
                <p className="eyebrow text-accent">Fiche technique</p>
                <h2 className="mt-3 font-display text-3xl/[1.08] sm:text-4xl/[1.08]">Dans le détail.</h2>
                <p className="mt-6 max-w-md text-base/relaxed text-muted">
                  Remise propre, avec le plein, après un contrôle complet. Le véhicule est accessible dès {car.minAge} ans
                  avec {car.minLicenseYears} ans de permis.
                </p>
              </div>
              <dl className="divide-y divide-line border-y border-line">
                {car.specs.map((s) => (
                  <div key={s.label} className="flex items-baseline justify-between gap-6 py-4">
                    <dt className="eyebrow text-muted">{s.label}</dt>
                    <dd className="text-right font-medium">{s.value}</dd>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-6 py-4">
                  <dt className="eyebrow text-muted">Caution</dt>
                  <dd className="text-right font-medium">{euros(car.deposit)}, par empreinte bancaire</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-24">
            <p className="eyebrow text-accent-light">Forfaits</p>
            <h2 className="mt-3 mb-12 font-display text-3xl/[1.08] sm:text-4xl/[1.08]">
              Semaine <span className="text-accent-light italic">ou week-end.</span>
            </h2>
            <PackageGrid vehicle={car} />
          </div>
        </article>
      ))}
    </div>
  );
}
