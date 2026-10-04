import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Comment ${site.name} collecte, utilise et protège vos données personnelles.`,
  robots: { index: false, follow: true },
};

const purposes = [
  {
    purpose: "Gestion des réservations et des contrats de location",
    basis: "Exécution du contrat",
    retention: "Durée de la relation, puis 5 ans (prescription civile)",
  },
  {
    purpose: "Vérification de l’âge et du permis de conduire",
    basis: "Exécution du contrat · intérêt légitime (sécurité)",
    retention: "1 an après la fin de la location",
  },
  {
    purpose: "Paiement, caution et prévention de la fraude",
    basis: "Exécution du contrat · intérêt légitime",
    retention: "13 mois après le paiement (données de transaction)",
  },
  {
    purpose: "Désignation du conducteur en cas d’infraction",
    basis: "Obligation légale (art. L.121-2 du Code de la route)",
    retention: "Jusqu’à 1 an après la fin de la location",
  },
  {
    purpose: "Facturation et comptabilité",
    basis: "Obligation légale",
    retention: "10 ans (art. L.123-22 du Code de commerce)",
  },
  {
    purpose: "Réponse à vos demandes de contact et de devis",
    basis: "Intérêt légitime · mesures précontractuelles",
    retention: "3 ans après le dernier contact",
  },
  {
    purpose: "Mesure d’audience et publicité",
    basis: "Consentement",
    retention: "13 mois maximum",
  },
];

export default function ConfidentialitePage() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      intro="Les données que nous collectons, pourquoi, combien de temps, et qui y a accès."
    >
      <LegalSection title="Responsable du traitement">
        <p>
          {site.legal.ownerName}, {site.legal.legalForm}, exerçant sous le nom commercial {site.legal.tradeName},{" "}
          {site.address.street}, {site.address.postalCode} {site.address.city}. Contact :{" "}
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
        </p>
      </LegalSection>

      <LegalSection title="Données collectées">
        <ul>
          <li>
            <strong>Identité et contact</strong> : nom, prénom, e-mail, téléphone, adresse de livraison le cas échéant.
          </li>
          <li>
            <strong>Conducteur</strong> : date de naissance, numéro et date d’obtention du permis de conduire. Une copie du
            permis et d’une pièce d’identité est vérifiée lors de la remise des clés.
          </li>
          <li>
            <strong>Location</strong> : dates, véhicule, options, état des lieux, kilométrage.
          </li>
          <li>
            <strong>Paiement</strong> : vos données de carte sont saisies et traitées directement par notre prestataire de
            paiement certifié PCI-DSS. Nous n’y avons jamais accès et ne les conservons pas.
          </li>
          <li>
            <strong>Navigation</strong> : uniquement les cookies que vous avez acceptés (voir la{" "}
            <Link href="/cookies">politique cookies</Link>).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Finalités, bases légales et durées de conservation">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line-strong text-ink">
                <th className="py-3 pr-4 font-semibold">Finalité</th>
                <th className="py-3 pr-4 font-semibold">Base légale</th>
                <th className="py-3 font-semibold">Conservation</th>
              </tr>
            </thead>
            <tbody>
              {purposes.map((p) => (
                <tr key={p.purpose} className="border-b border-line align-top">
                  <td className="py-3 pr-4 text-ink">{p.purpose}</td>
                  <td className="py-3 pr-4">{p.basis}</td>
                  <td className="py-3">{p.retention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="Destinataires">
        <ul>
          <li>Le personnel de {site.legal.tradeName}, dans la limite de ses fonctions.</li>
          <li>Notre prestataire de paiement (Stripe Payments Europe Ltd.).</li>
          <li>Notre hébergeur ({site.legal.host.name}).</li>
          <li>Notre assureur, en cas de sinistre.</li>
          <li>
            Les autorités habilitées, notamment l’Agence nationale de traitement automatisé des infractions (ANTAI)
            pour la désignation du conducteur.
          </li>
        </ul>
        <p>Vos données ne sont jamais vendues ni louées à des tiers.</p>
      </LegalSection>

      <LegalSection title="Transferts hors de l’Union européenne">
        <p>
          Certains prestataires (hébergement, paiement) peuvent traiter des données aux États-Unis. Ces transferts sont
          encadrés par le Data Privacy Framework UE-États-Unis ou par les clauses contractuelles types de la Commission
          européenne.
        </p>
      </LegalSection>

      <LegalSection title="Sécurité">
        <p>
          Le site est servi exclusivement en HTTPS. L’accès aux données est limité aux personnes habilitées et protégé
          par authentification.
        </p>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de
          portabilité, ainsi que du droit de définir des directives sur le sort de vos données après votre décès.
          Pour les exercer, rendez-vous sur la page <Link href="/rgpd">Vos droits (RGPD)</Link>.
        </p>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL (
          <a href="https://www.cnil.fr" target="_blank" rel="noreferrer noopener">
            cnil.fr
          </a>
          ).
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
