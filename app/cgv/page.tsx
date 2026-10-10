import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { MAX_ONLINE_DAYS } from "@/lib/fleet";
import { site } from "@/lib/site";

/**
 * Conditions générales de vente : la vente en ligne de la prestation
 * (réservation, prix, paiement, signature, annulation). L'usage du véhicule
 * relève des conditions de location (/conditions-de-location).
 *
 * ⚠️ MAQUETTE : délais et frais d'annulation, médiateur à faire valider par
 * le client avant publication.
 */

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: `Conditions générales de vente de ${site.name} : réservation en ligne, prix, paiement, caution, annulation.`,
  robots: { index: false, follow: true },
};

export default function CgvPage() {
  const { legal } = site;
  return (
    <LegalLayout
      title="Conditions générales de vente"
      intro="Comment se déroule une réservation sur ce site : prix, paiement, signature du contrat, caution et annulation."
    >
      <LegalSection title="1. Vendeur">
        <p>
          {legal.ownerName}, {legal.legalForm}, exerçant sous le nom commercial {legal.tradeName}, SIRET {legal.siret},
          dont le siège est situé {site.address.street}, {site.address.postalCode} {site.address.city}. Contact :{" "}
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>, {site.contact.phoneDisplay}.
        </p>
      </LegalSection>

      <LegalSection title="2. Champ d’application">
        <p>
          Les présentes conditions s’appliquent à toute réservation de location de véhicule passée sur ce site par un
          client, consommateur ou professionnel. Elles sont acceptées à la réservation, avec les{" "}
          <Link href="/conditions-de-location">conditions de location</Link> qui régissent l’usage du véhicule. La
          version applicable est celle en vigueur au jour de la réservation.
        </p>
      </LegalSection>

      <LegalSection title="3. Réservation">
        <p>La réservation se fait en cinq étapes :</p>
        <ul>
          <li>choix des dates, du véhicule, du lieu de remise des clés et des options ;</li>
          <li>informations sur le conducteur principal ;</li>
          <li>dépôt des copies de la pièce d’identité et du permis de conduire, avec leurs numéros ;</li>
          <li>relecture et signature électronique du contrat de location ;</li>
          <li>paiement, et choix du mode de versement de la caution.</li>
        </ul>
        <p>
          Un récapitulatif est affiché à chaque étape, et le client peut corriger ses informations avant de payer. La
          réservation est ferme à réception du paiement, confirmée par e-mail avec le contrat signé. Au-delà de{" "}
          {MAX_ONLINE_DAYS} jours, la location fait l’objet d’un devis.
        </p>
      </LegalSection>

      <LegalSection title="4. Vérification des pièces">
        <p>
          Le loueur vérifie les pièces transmises avant le départ. Si une pièce est illisible, expirée ou ne correspond
          pas aux conditions de location, le client est invité à la régulariser. À défaut, le loueur peut annuler la
          réservation ; le client est alors intégralement remboursé.
        </p>
      </LegalSection>

      <LegalSection title="5. Prix">
        <p>
          Les prix sont indiqués en euros toutes taxes comprises. Le prix de la location est déterminé par les forfaits
          du véhicule (semaine ou week-end) selon les dates choisies, auxquels s’ajoutent les options et l’éventuel
          supplément de livraison. Le total est affiché avant le paiement. Les frais pouvant survenir après la location
          (carburant, kilomètres supplémentaires, dommages, infractions) sont détaillés dans les conditions de location.
        </p>
      </LegalSection>

      <LegalSection title="6. Paiement">
        <p>
          Le paiement s’effectue en ligne par carte bancaire, via notre prestataire Stripe, certifié PCI-DSS. Les
          données de carte ne transitent pas par nos serveurs et ne nous sont jamais communiquées.
        </p>
      </LegalSection>

      <LegalSection title="7. Caution">
        <p>
          Aucune caution n’est demandée à la réservation. Son montant, propre à chaque véhicule, figure sur sa fiche et
          au contrat. Elle est versée à la remise des clés, au choix du client, par empreinte bancaire activée depuis son
          téléphone ou en espèces contre reçu, et lui est rendue à la récupération du véhicule, dans les conditions
          prévues par les <Link href="/conditions-de-location">conditions de location</Link>.
        </p>
      </LegalSection>

      <LegalSection title="8. Signature électronique">
        <p>
          Le contrat de location est signé en ligne. Le client relit le contrat, appose sa signature manuscrite à l’écran
          et la confirme par un code à usage unique envoyé à son adresse e-mail. Le loueur conserve le contrat signé
          avec un dossier de preuve (horodatage, adresse IP, empreinte numérique du document). Conformément aux articles
          1366 et 1367 du Code civil et au règlement européen eIDAS, cette signature a la même valeur qu’une signature
          sur papier, et le client accepte qu’elle lui soit opposée.
        </p>
      </LegalSection>

      <LegalSection title="9. Annulation et modification">
        <ul>
          <li>Plus de 48 heures avant le départ : annulation gratuite, remboursement intégral.</li>
          <li>Moins de 48 heures avant le départ : 50 % du montant de la location reste dû.</li>
          <li>Absence au rendez-vous ou refus de remise des clés imputable au client : le montant total reste dû.</li>
        </ul>
        <p>
          Les demandes se font par e-mail à <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>. Une
          modification de dates est possible sous réserve de disponibilité, au tarif applicable aux nouvelles dates.
          Le remboursement intervient sous 14 jours, sur la carte utilisée pour le paiement.
        </p>
      </LegalSection>

      <LegalSection title="10. Absence de droit de rétractation">
        <p>
          Conformément à l’article L.221-28 12° du Code de la consommation, le droit de rétractation ne s’applique pas
          aux prestations de location de véhicules fournies à une date ou selon une périodicité déterminée. Les
          conditions d’annulation ci-dessus s’appliquent.
        </p>
      </LegalSection>

      <LegalSection title="11. Réclamations et médiation">
        <p>
          Toute réclamation est à adresser à <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>. En cas de
          litige non résolu, le client consommateur peut recourir gratuitement au médiateur de la consommation :{" "}
          {legal.mediator.name}.
        </p>
      </LegalSection>

      <LegalSection title="12. Droit applicable">
        <p>
          Les présentes conditions sont soumises au droit français. À défaut de résolution amiable, le litige est porté
          devant les tribunaux compétents.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
