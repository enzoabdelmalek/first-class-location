import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { site } from "@/lib/site";
import { euros } from "@/lib/utils";

/**
 * ⚠️ MAQUETTE : trame de conditions générales de location, à faire valider
 * par le client (franchises, frais, délais d'annulation) avant publication.
 */

export const metadata: Metadata = {
  title: "Conditions générales de location",
  description: `Conditions générales de location de véhicules ${site.name}.`,
  robots: { index: false, follow: true },
};

export default function CglPage() {
  const { booking } = site;
  return (
    <LegalLayout
      title="Conditions générales de location"
      intro="Les règles qui encadrent chaque location, de la réservation à la restitution des clés."
    >
      <LegalSection title="1. Objet">
        <p>
          Les présentes conditions régissent la location de véhicules par {site.legal.ownerName}, {site.legal.legalForm},
          exerçant sous le nom commercial {site.legal.tradeName} (SIRET {site.legal.siret}), ci-après « le loueur », à
          toute personne physique ou morale, ci-après « le locataire ». Toute réservation vaut acceptation sans réserve
          des présentes conditions.
        </p>
      </LegalSection>

      <LegalSection title="2. Conditions relatives au conducteur">
        <ul>
          <li>Être âgé d’au moins 21 ans, et de 23 à 25 ans selon la catégorie du véhicule.</li>
          <li>Être titulaire d’un permis B valide depuis au moins 2 ans, 3 ans pour les gammes premium.</li>
          <li>Présenter, lors de la remise des clés, une pièce d’identité, le permis original et une carte bancaire à son nom.</li>
        </ul>
        <p>Seuls le locataire et les conducteurs additionnels déclarés au contrat sont autorisés à conduire le véhicule.</p>
      </LegalSection>

      <LegalSection title="3. Réservation et paiement">
        <p>
          La réservation est ferme à réception du paiement intégral en ligne par carte bancaire. Les prix sont indiqués
          en euros toutes taxes comprises. Toute période de 24 heures entamée est facturée comme une journée complète.
        </p>
      </LegalSection>

      <LegalSection title="4. Caution">
        <p>
          Une caution, dont le montant dépend du véhicule, est exigée. Elle prend la forme d’une empreinte bancaire :
          le montant est bloqué sur la carte du locataire sans être débité, puis libéré dans un délai de{" "}
          {booking.releaseDays} jours après la restitution du véhicule, déduction faite des sommes éventuellement dues
          (dommages, carburant, kilomètres supplémentaires, amendes, frais de dossier).
        </p>
      </LegalSection>

      <LegalSection title="5. Prise en charge et restitution">
        <p>
          Un état des lieux contradictoire est réalisé au départ et au retour. Le véhicule est remis propre et avec le
          plein de carburant ; il doit être restitué dans le même état. Le carburant manquant est facturé au prix du
          marché, majoré de frais de service.
        </p>
        <p>
          Tout retard de plus d’une heure non signalé peut entraîner la facturation d’une journée supplémentaire.
        </p>
      </LegalSection>

      <LegalSection title="6. Kilométrage">
        <p>
          Chaque journée de location inclut {booking.kmPerDay} km. Les kilomètres supplémentaires sont facturés{" "}
          {euros(booking.extraKm)} par kilomètre, sauf souscription de l’option « Kilométrage illimité ».
        </p>
      </LegalSection>

      <LegalSection title="7. Assurance et franchise">
        <p>
          Les véhicules sont couverts par une assurance responsabilité civile. En cas de dommage, de vol ou
          d’incendie, une franchise reste à la charge du locataire, dans la limite du montant de la caution. L’option
          « Protection Sérénité » réduit cette franchise de moitié.
        </p>
      </LegalSection>

      <LegalSection title="8. Infractions">
        <p>
          Le locataire est seul responsable des infractions commises pendant la durée de la location. Conformément à
          l’article L.121-2 du Code de la route, le loueur désigne le conducteur auprès des autorités compétentes. Des
          frais de gestion peuvent être facturés.
        </p>
      </LegalSection>

      <LegalSection title="9. Annulation">
        <ul>
          <li>Plus de 48 heures avant la prise en charge : annulation gratuite, remboursement intégral.</li>
          <li>Moins de 48 heures avant : 50 % du montant de la location reste dû.</li>
          <li>Absence sans annulation : le montant total reste dû.</li>
        </ul>
        <p>
          Conformément à l’article L.221-28 12° du Code de la consommation, le droit de rétractation ne s’applique pas aux
          prestations de location de véhicules fournies à une date déterminée.
        </p>
      </LegalSection>

      <LegalSection title="10. Litiges">
        <p>
          Les présentes conditions sont soumises au droit français. En cas de litige, le locataire consommateur peut
          recourir gratuitement au médiateur de la consommation : {site.legal.mediator.name}. À défaut de résolution
          amiable, les tribunaux compétents seront saisis.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
