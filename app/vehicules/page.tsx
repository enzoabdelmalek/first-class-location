import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { FleetGrid } from "@/components/vehicle";
import { fleet, fleetFromPrice } from "@/lib/fleet";
import { site } from "@/lib/site";
import { euros } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Nos véhicules",
  description: `Voitures de luxe et sportives à louer à ${site.city}, livrées à l’adresse de votre choix : fiches techniques, forfaits semaine et week-end.`,
};

/** Catalogue : une carte par véhicule, chacune menant à sa fiche. */
export default function VehiclesPage() {
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
        intro={`${fleet.length} modèles d’exception, livrés à l’adresse de votre choix dans ${site.city}. À partir de ${euros(fleetFromPrice)}.`}
      />
      <div className="bg-ink">
        <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-8 lg:pb-28">
          <FleetGrid vehicles={fleet} />
        </div>
      </div>
    </>
  );
}
