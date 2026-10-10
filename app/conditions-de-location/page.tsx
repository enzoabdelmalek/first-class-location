import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { extras, fleetMinAge, GRACE_MINUTES } from "@/lib/fleet";
import { site } from "@/lib/site";
import { euros } from "@/lib/utils";

/**
 * Conditions de location : l'usage du véhicule, de la remise des clés à la
 * restitution. Annexées au contrat signé en ligne. La vente elle-même
 * (réservation, paiement, annulation) relève des CGV (/cgv).
 *
 * ⚠️ MAQUETTE : franchise, frais, kilométrage et usages interdits à faire
 * valider par le client ET par son assureur avant publication.
 */

export const metadata: Metadata = {
  title: "Conditions de location",
  description: `Conditions de location des véhicules ${site.name} : conducteur, usage, caution, assurance, restitution.`,
  robots: { index: false, follow: true },
};

const serenite = extras.find((e) => e.id === "serenite")!;

export default function ConditionsDeLocationPage() {
  const { booking } = site;
  return (
    <LegalLayout
      title="Conditions de location"
      intro="Les règles d’usage du véhicule, de la remise des clés à la restitution. Elles font partie du contrat que vous signez en ligne."
    >
      <LegalSection title="1. Objet">
        <p>
          Les présentes conditions encadrent la mise à disposition d’un véhicule par {site.legal.ownerName},{" "}
          {site.legal.legalForm}, exerçant sous le nom commercial {site.legal.tradeName} (SIRET {site.legal.siret}),
          ci-après « le loueur », au profit du signataire du contrat, ci-après « le locataire ». Elles complètent le
          contrat de location et les <Link href="/cgv">conditions générales de vente</Link>. En cas de contradiction, le
          contrat signé prévaut.
        </p>
      </LegalSection>

      <LegalSection title="2. Conducteur">
        <ul>
          <li>
            Avoir l’âge minimum et l’ancienneté de permis B indiqués sur la fiche du véhicule et au contrat, soit au
            moins <strong>{fleetMinAge} ans révolus</strong> au jour du départ, avec un permis en cours de validité.
          </li>
          <li>
            Avoir transmis à la réservation une copie de sa pièce d’identité (carte d’identité recto verso ou passeport) et
            de son permis de conduire recto verso, et présenter les <strong>originaux</strong> à la remise des clés.
          </li>
        </ul>
        <p>
          Seuls le locataire et les conducteurs additionnels déclarés au contrat, soumis aux mêmes conditions, sont
          autorisés à conduire. Le loueur peut refuser la remise des clés si les originaux ne correspondent pas aux
          copies transmises, ou si le conducteur ne remplit pas ces conditions ; les sommes versées sont alors
          remboursées, déduction faite des frais de livraison engagés.
        </p>
      </LegalSection>

      <LegalSection title="3. Remise des clés et état des lieux">
        <p>
          Le véhicule est livré à l’adresse indiquée à la réservation, à l’heure convenue. Un état des lieux
          contradictoire, avec photographies datées, est réalisé au départ et au retour, et signé des deux parties. Le
          véhicule est remis propre, avec le plein de carburant, et doit être restitué dans le même état.
        </p>
      </LegalSection>

      <LegalSection title="4. Usage du véhicule">
        <p>Le locataire utilise le véhicule en bon père de famille. Sont notamment interdits :</p>
        <ul>
          <li>la conduite sous l’emprise de l’alcool, de stupéfiants ou de médicaments déconseillés à la conduite ;</li>
          <li>la participation à toute course, rallye, essai ou usage sur circuit ;</li>
          <li>la sous-location, le transport rémunéré de personnes ou de marchandises, le remorquage ;</li>
          <li>la sortie du territoire français sans l’accord écrit préalable du loueur ;</li>
          <li>le fait de fumer dans le véhicule ou d’y transporter des animaux sans accord préalable.</li>
        </ul>
        <p>Tout manquement grave autorise le loueur à reprendre le véhicule sans délai, aux frais du locataire.</p>
      </LegalSection>

      <LegalSection title="5. Carburant et kilométrage">
        <p>
          Chaque journée de location inclut {booking.kmPerDay} km. Les kilomètres supplémentaires sont facturés{" "}
          {euros(booking.extraKm)} par kilomètre. Le carburant manquant au retour est facturé au prix du marché, majoré
          de frais de service, sauf option « Plein à la restitution ».
        </p>
      </LegalSection>

      <LegalSection title="6. Restitution et retard">
        <p>
          Le véhicule est restitué à la date, à l’heure et au lieu prévus au contrat. Une tolérance de {GRACE_MINUTES}{" "}
          minutes s’applique ; au-delà, chaque période de 24 heures entamée est facturée au tarif en vigueur. Un retard
          de plus de 24 heures sans nouvelles du locataire peut donner lieu à un dépôt de plainte.
        </p>
      </LegalSection>

      <LegalSection title="7. Caution">
        <p>
          Le montant de la caution, propre à chaque véhicule, figure sur sa fiche et au contrat. Elle est versée à la
          remise des clés, au choix du locataire :
        </p>
        <ul>
          <li>
            par <strong>empreinte bancaire</strong>, activée par le locataire depuis son téléphone sur une carte à son
            nom : le montant est bloqué, non débité ;
          </li>
          <li>
            en <strong>espèces</strong>, contre un reçu signé des deux parties.
          </li>
        </ul>
        <p>
          À la récupération du véhicule, après l’état des lieux de retour, le loueur lève l’empreinte ou rend les
          espèces, déduction faite des seules sommes dues et justifiées : dommages dans la limite de la franchise,
          carburant, kilomètres supplémentaires, nettoyage exceptionnel. Le détail est remis au locataire.
        </p>
        <p>
          Si la caution ne peut être versée (plafond insuffisant, carte refusée, somme incomplète), le loueur peut
          refuser la remise des clés.
        </p>
      </LegalSection>

      <LegalSection title="8. Assurance, sinistre et franchise">
        <p>
          Le véhicule est assuré auprès de {site.legal.insurer} : responsabilité civile, dommages, vol et incendie. En
          cas de sinistre responsable ou sans tiers identifié, une franchise, indiquée au contrat pour chaque véhicule,
          reste à la charge du locataire, réduite avec l’option « {serenite.label} ».
        </p>
        <p>
          Tout accident, vol ou dommage doit être signalé au loueur sans délai, et au plus tard sous 24 heures. En cas
          d’accident avec un tiers, le locataire établit un constat amiable. Les dommages causés par un usage interdit,
          une négligence grave ou un conducteur non déclaré ne sont pas couverts.
        </p>
      </LegalSection>

      <LegalSection title="9. Panne">
        <p>
          En cas de panne, le locataire contacte le loueur au {site.contact.phoneDisplay} avant toute intervention.
          Aucune réparation ne peut être engagée sans son accord écrit.
        </p>
      </LegalSection>

      <LegalSection title="10. Infractions">
        <p>
          Le locataire est seul responsable des infractions commises pendant la location. Conformément à l’article
          L.121-2 du Code de la route, le loueur le désigne comme conducteur auprès de l’ANTAI. Des frais de gestion
          peuvent être facturés.
        </p>
      </LegalSection>

      {booking.gpsTracker ? (
        <LegalSection title="11. Géolocalisation">
          <p>
            Le véhicule est équipé d’un dispositif de géolocalisation, utilisé uniquement en cas de vol, de non-restitution
            ou de manquement grave au contrat. Voir la <Link href="/confidentialite">politique de confidentialité</Link>.
          </p>
        </LegalSection>
      ) : null}
    </LegalLayout>
  );
}
