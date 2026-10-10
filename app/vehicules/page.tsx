import type { Metadata } from "next";
import Link from "next/link";
import { DateSearch } from "@/components/date-search";
import { PageHeader } from "@/components/page-header";
import { FleetGrid, OfferGrid } from "@/components/vehicle";
import { offers, parseStay } from "@/lib/availability";
import { fleet, fleetFromPrice, MAX_ONLINE_DAYS } from "@/lib/fleet";
import { site } from "@/lib/site";
import { euros } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Nos véhicules",
  description: `Voitures de luxe et sportives à louer à ${site.city}, livrées à l’adresse de votre choix : disponibilités, fiches techniques, forfaits semaine et week-end.`,
};

const day = (d: Date) => d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

/**
 * Catalogue. Sans dates : toute la flotte. Avec ?du=…&au=… (hero de
 * l'accueil ou filtre ci-dessous) : les véhicules libres d'abord, avec leur
 * prix pour la période et un lien direct vers la réservation.
 */
export default async function VehiclesPage({ searchParams }: PageProps<"/vehicules">) {
  const { du, au } = await searchParams;
  const stay = parseStay(typeof du === "string" ? du : undefined, typeof au === "string" ? au : undefined);
  const list = stay && !stay.quote ? offers(stay.start, stay.end) : null;
  const free = list?.filter((o) => o.available).length ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="La flotte"
        title={
          <>
            Nos <span className="text-accent-light italic">véhicules.</span>
          </>
        }
        image="/vehicules/audi-rs3-sportback/jante.jpg"
        intro={`${fleet.length} modèles d’exception, livrés à l’adresse de votre choix dans ${site.city}. Indiquez vos dates pour voir ceux qui sont libres.`}
      >
        <DateSearch initial={stay ? { du: stay.du, au: stay.au } : undefined} cta={stay ? "Mettre à jour" : undefined} className="mt-8 max-w-3xl" />
      </PageHeader>

      <div className="bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-8 lg:pb-28">
          {list && stay ? (
            <>
              <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 border-b border-ink-line pb-5">
                <p className="text-lg">
                  <strong className="font-display">
                    {free} véhicule{free > 1 ? "s" : ""} disponible{free > 1 ? "s" : ""}
                  </strong>{" "}
                  <span className="text-muted-on-ink">
                    du {day(stay.start)} au {day(stay.end)}
                  </span>
                </p>
                <Link href="/vehicules" className="text-sm text-muted-on-ink underline-offset-4 hover:text-paper hover:underline">
                  Voir toute la flotte
                </Link>
              </div>
              <OfferGrid offers={list} du={stay.du} au={stay.au} />
              {free === 0 ? (
                <p className="mt-8 text-sm text-muted-on-ink">
                  Tout est réservé à ces dates. Essayez d’autres dates, ou appelez-nous au{" "}
                  <a href={`tel:${site.contact.phone}`} className="text-paper underline underline-offset-4">
                    {site.contact.phoneDisplay}
                  </a>
                  .
                </p>
              ) : null}
            </>
          ) : (
            <>
              {stay?.quote ? (
                <p className="mb-8 border-l-2 border-accent bg-ink-soft px-5 py-4 text-sm">
                  Au-delà de {MAX_ONLINE_DAYS} jours, nous établissons un tarif sur mesure :{" "}
                  <a href={`tel:${site.contact.phone}`} className="font-semibold underline underline-offset-4">
                    {site.contact.phoneDisplay}
                  </a>
                  .
                </p>
              ) : null}
              <p className="mb-8 text-sm text-muted-on-ink">Toute la flotte · dès {euros(fleetFromPrice)}</p>
              <FleetGrid vehicles={fleet} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
