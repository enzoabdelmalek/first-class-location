import Link from "next/link";
import type { ReactNode } from "react";
import type { quote, Vehicle } from "@/lib/fleet";
import { site } from "@/lib/site";
import { euros } from "@/lib/utils";

/**
 * Contrat de location tel que le locataire le relit avant de signer.
 *
 * En production, ce même contenu est rendu en PDF côté serveur, son
 * empreinte (SHA-256) est calculée, puis scellée avec la signature et le
 * journal de preuve (horodatage, IP, code reçu par e-mail).
 */

export type ContractParty = {
  fullName: string;
  birthDate: string;
  birthPlace: string;
  address: string;
  email: string;
  phone: string;
  idLabel: string;
  idNumber: string;
  licenseNumber: string;
  licenseDate: string;
};

const day = (iso: string) => (iso ? new Date(iso).toLocaleDateString("fr-FR") : "-");
const when = (d: Date) =>
  d.toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function RentalContract({
  renter,
  vehicle,
  start,
  end,
  days,
  label,
  location,
  price,
}: {
  renter: ContractParty;
  vehicle: Vehicle;
  start: Date;
  end: Date;
  days: number;
  label: string;
  location: string;
  price: ReturnType<typeof quote>;
}) {
  const { legal, booking } = site;

  return (
    <article className="max-h-[32rem] overflow-y-auto rounded-sm border border-line-strong bg-surface text-sm/relaxed" tabIndex={0} aria-label="Contrat de location">
      <header className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-7">
        <span className="text-xs font-semibold tracking-[0.18em] [font-stretch:125%]">
          FIRST <span className="text-accent">/</span> CLASS
        </span>
        <span className="eyebrow text-muted">Contrat de location</span>
      </header>

      <div className="space-y-6 px-5 py-6 sm:px-7">
        <p className="text-xs text-muted">Le numéro de contrat est attribué au paiement.</p>

        <Block title="Le loueur">
          <p>
            {legal.ownerName}, {legal.legalForm}, exerçant sous le nom commercial {legal.tradeName}, SIRET {legal.siret},{" "}
            {site.address.street}, {site.address.postalCode} {site.address.city}.
          </p>
        </Block>

        <Block title="Le locataire, conducteur principal">
          <Rows
            rows={[
              ["Nom", renter.fullName],
              ["Né(e) le", `${day(renter.birthDate)} à ${renter.birthPlace}`],
              ["Adresse", renter.address],
              ["Contact", `${renter.email} · ${renter.phone}`],
              [renter.idLabel, renter.idNumber],
              ["Permis de conduire", `n° ${renter.licenseNumber}, obtenu le ${day(renter.licenseDate)}`],
            ]}
          />
        </Block>

        <Block title="Le véhicule">
          <Rows
            rows={[
              ["Modèle", `${vehicle.brand} ${vehicle.model}, ${vehicle.finish.toLowerCase()}`],
              ["Immatriculation", vehicle.plate],
              ["Carburant", "Remis avec le plein, à restituer avec le plein"],
              ["Kilométrage inclus", `${booking.kmPerDay * days} km, puis ${euros(booking.extraKm)} par km`],
            ]}
          />
        </Block>

        <Block title="La location">
          <Rows
            rows={[
              ["Départ", when(start)],
              ["Retour", when(end)],
              ["Remise des clés", location],
              ["Forfait", `${label} · ${euros(price.base)}`],
              ...price.extrasLines.map((l): [string, string] => [l.label, euros(l.amount)]),
              ...(price.locationFee ? [["Livraison", euros(price.locationFee)] as [string, string]] : []),
              ["Total TTC", euros(price.total)],
            ]}
          />
        </Block>

        <Block title="Caution et franchise">
          <p>
            Caution de <strong>{euros(price.deposit)}</strong>, versée à la remise des clés par empreinte bancaire ou en
            espèces contre reçu, et rendue à la récupération du véhicule après l’état des lieux de retour, déduction
            faite des sommes dues au titre des conditions de location.
          </p>
          <p>
            Franchise en cas de sinistre : {vehicle.excess === null ? "à compléter" : euros(vehicle.excess)}
            {price.extrasLines.some((l) => l.id === "serenite") ? ", réduite par la Protection Sérénité." : "."}
          </p>
        </Block>

        <Block title="Conditions">
          <p>
            Le locataire déclare avoir lu et accepté les{" "}
            <Link href="/conditions-de-location" target="_blank" className="text-accent underline underline-offset-4">
              conditions de location
            </Link>{" "}
            et les{" "}
            <Link href="/cgv" target="_blank" className="text-accent underline underline-offset-4">
              conditions générales de vente
            </Link>
            , qui font partie du présent contrat. Il s’engage à présenter les originaux de ses pièces à la remise des clés.
            Un état des lieux contradictoire, signé des deux parties, est dressé au départ et au retour.
          </p>
        </Block>
      </div>
    </article>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="eyebrow text-accent">{title}</h3>
      <div className="mt-2 space-y-2 text-muted [&_strong]:text-ink">{children}</div>
    </section>
  );
}

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="divide-y divide-line border-y border-line">
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-0.5 py-2 sm:flex-row sm:justify-between sm:gap-6">
          <dt className="text-muted">{k}</dt>
          <dd className="text-ink sm:text-right">{v || "-"}</dd>
        </div>
      ))}
    </dl>
  );
}
