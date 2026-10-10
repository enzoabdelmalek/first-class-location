import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowIcon } from "@/components/icons";
import { FleetGrid, PackageGrid, VehicleHeadline, VehicleVisual } from "@/components/vehicle";
import { VehicleGallery } from "@/components/vehicle-gallery";
import { fleet, fromPrice, vehicleBySlug } from "@/lib/fleet";
import { site } from "@/lib/site";
import { euros } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return fleet.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/vehicules/[slug]">): Promise<Metadata> {
  const car = vehicleBySlug((await params).slug);
  if (!car) return {};
  return {
    title: `${car.brand} ${car.model}`,
    description: `${car.brand} ${car.model} ${car.finish.toLowerCase()} à louer à ${site.city}, livrée à l’adresse de votre choix. Dès ${euros(fromPrice(car))}.`,
  };
}

/** Fiche d'un véhicule : visuel, chiffres clés, fiche technique, conditions, forfaits. */
export default async function VehiclePage({ params }: PageProps<"/vehicules/[slug]">) {
  const car = vehicleBySlug((await params).slug);
  if (!car) notFound();
  const others = fleet.filter((v) => v.slug !== car.slug);
  const reserve = `/reserver?vehicule=${car.slug}`;

  const conditions = [
    { label: "Âge minimum", value: `${car.minAge} ans`, note: "Révolus au jour du départ" },
    { label: "Permis B", value: `${car.minLicenseYears} ans`, note: "En cours de validité" },
    { label: "Caution", value: euros(car.deposit), note: "Empreinte ou espèces, rendue au retour" },
    { label: "Kilométrage", value: `${site.booking.kmPerDay} km/j`, note: `Puis ${euros(site.booking.extraKm)} par km` },
  ];

  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-8 lg:pt-14">
        <nav aria-label="Fil d’Ariane" className="text-sm text-muted-on-ink">
          <Link href="/vehicules" className="hover:text-paper">
            Nos véhicules
          </Link>{" "}
          / <span className="text-paper">{car.brand} {car.model}</span>
        </nav>

        <div className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow rise text-accent-light">
              {car.category} · {car.finish}
            </p>
            <h1 className="rise mt-4 font-display text-4xl/[1.02] sm:text-6xl/[1.02]">
              {car.brand} <span className="text-accent-light italic">{car.model}</span>
            </h1>
          </div>
          <Link
            href={reserve}
            className="inline-flex items-center justify-center gap-2 self-start rounded-sm bg-accent px-7 py-4 font-semibold text-white transition hover:bg-accent-hover lg:self-auto"
          >
            Réserver · dès {euros(fromPrice(car))}
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>

        {car.image ? (
          <VehicleVisual vehicle={car} priority ratio="aspect-[4/3] sm:aspect-[16/9]" sizes="(min-width: 1280px) 1216px, 100vw" className="mt-8" />
        ) : (
          <VehicleVisual vehicle={car} animated priority className="mx-auto mt-6 max-w-4xl" />
        )}
        <VehicleHeadline vehicle={car} />
      </div>

      <div className="bg-paper text-ink">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:gap-20 lg:py-24">
          <div>
            <p className="eyebrow text-accent">Fiche technique</p>
            <h2 className="mt-3 font-display text-3xl/[1.08] sm:text-4xl/[1.08]">Dans le détail.</h2>
            <p className="mt-6 max-w-md text-base/relaxed text-muted">{car.description}</p>
            <p className="mt-4 max-w-md text-base/relaxed text-muted">
              Livrée propre, avec le plein, après un contrôle complet, à l’adresse de votre choix dans {site.city}.
            </p>
          </div>
          <dl className="divide-y divide-line border-y border-line">
            {car.specs.map((s) => (
              <div key={s.label} className="flex items-baseline justify-between gap-6 py-4">
                <dt className="eyebrow text-muted">{s.label}</dt>
                <dd className="text-right font-medium">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-paper-alt">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:py-20">
            <p className="eyebrow text-accent">Conditions</p>
            <dl className="mt-6 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {conditions.map((c) => (
                <div key={c.label} className="bg-surface p-6">
                  <dt className="eyebrow text-muted">{c.label}</dt>
                  <dd className="mt-3 font-display text-2xl">{c.value}</dd>
                  <dd className="mt-1 text-sm text-muted">{c.note}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-muted">
              Le détail figure dans nos{" "}
              <Link href="/conditions-de-location" className="text-accent underline underline-offset-4">
                conditions de location
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {car.gallery?.length ? (
        <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-8 lg:pt-24">
          <p className="eyebrow text-accent-light">Galerie</p>
          <h2 className="mt-3 mb-10 font-display text-3xl/[1.08] sm:text-4xl/[1.08]">
            Sous <span className="text-accent-light italic">tous les angles.</span>
          </h2>
          <VehicleGallery photos={car.gallery} />
        </div>
      ) : null}

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-24">
        <p className="eyebrow text-accent-light">Forfaits</p>
        <h2 className="mt-3 mb-12 font-display text-3xl/[1.08] sm:text-4xl/[1.08]">
          Semaine <span className="text-accent-light italic">ou week-end.</span>
        </h2>
        <PackageGrid vehicle={car} />
      </div>

      {others.length ? (
        <div className="border-t border-ink-line">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-24">
            <p className="eyebrow text-accent-light">La flotte</p>
            <h2 className="mt-3 mb-12 font-display text-3xl/[1.08] sm:text-4xl/[1.08]">
              Vous aimerez <span className="text-accent-light italic">aussi.</span>
            </h2>
            <FleetGrid vehicles={others} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
