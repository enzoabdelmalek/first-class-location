import type { Metadata } from "next";
import { Catalog } from "@/components/catalog";
import { PageHeader } from "@/components/page-header";
import { degressive } from "@/lib/fleet";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Nos véhicules",
  description: `Citadines, compactes, SUV, berlines et minibus à louer à ${site.city}. Tarifs à la journée, dégressifs dès 3 jours.`,
};

export default function VehiclesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title={
          <>
            Nos <span className="text-champagne italic">véhicules.</span>
          </>
        }
        intro="Des modèles récents, entretenus à l’agence, livrés propres et avec le plein. Les prix affichés sont des tarifs à la journée, assurance incluse."
      >
        <ul className="mt-8 flex flex-wrap gap-2">
          {[...degressive].reverse().map((t) => (
            <li key={t.label} className="rounded-full border border-champagne/40 px-4 py-1.5 text-sm text-champagne">
              {t.label}
            </li>
          ))}
          <li className="rounded-full border border-champagne/40 px-4 py-1.5 text-sm text-champagne">
            {site.booking.kmPerDay} km / jour inclus
          </li>
        </ul>
      </PageHeader>
      <Catalog />
    </>
  );
}
