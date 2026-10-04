import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { RightsForm } from "@/components/rights-form";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Vos droits (RGPD)",
  description: "Exercer vos droits sur vos données personnelles : accès, rectification, effacement, opposition, portabilité.",
  robots: { index: false, follow: true },
};

const rights = [
  ["Droit d’accès", "Savoir si nous traitons vos données et en obtenir une copie."],
  ["Droit de rectification", "Corriger des données inexactes ou incomplètes."],
  ["Droit à l’effacement", "Obtenir la suppression de vos données, sauf obligation légale de conservation (factures, infractions)."],
  ["Droit à la limitation", "Geler temporairement l’utilisation de vos données, par exemple le temps d’une vérification."],
  ["Droit d’opposition", "Vous opposer à un traitement fondé sur notre intérêt légitime, et à tout moment à la prospection."],
  ["Droit à la portabilité", "Recevoir les données que vous nous avez fournies dans un format lisible par machine."],
  ["Retrait du consentement", "Revenir à tout moment sur un consentement donné, notamment pour les cookies."],
  ["Directives post-mortem", "Définir le sort de vos données après votre décès."],
] as const;

export default function RgpdPage() {
  return (
    <LegalLayout
      eyebrow="Données personnelles"
      title="Vos droits (RGPD)"
      intro="Le Règlement général sur la protection des données vous donne la maîtrise de vos informations. Voici comment l’exercer."
    >
      <LegalSection title="Ce que vous pouvez demander">
        <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {rights.map(([title, text]) => (
            <div key={title} className="bg-surface p-5">
              <dt className="font-semibold text-ink">{title}</dt>
              <dd className="mt-1 text-sm/relaxed">{text}</dd>
            </div>
          ))}
        </dl>
      </LegalSection>

      <LegalSection title="Faire une demande">
        <p>
          Remplissez le formulaire ci-dessous, ou écrivez-nous à{" "}
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> ou par courrier à {site.legal.tradeName},{" "}
          {site.address.street}, {site.address.postalCode} {site.address.city}.
        </p>
        <p>
          Nous répondons dans un délai d’un mois, prolongeable de deux mois pour les demandes complexes (vous en serez
          informé). Un justificatif d’identité ne vous sera demandé qu’en cas de doute raisonnable sur votre identité.
        </p>
        <RightsForm />
      </LegalSection>

      <LegalSection title="Réclamation">
        <p>
          Si notre réponse ne vous satisfait pas, vous pouvez saisir la Commission nationale de l’informatique et des
          libertés (CNIL), 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07 ou sur{" "}
          <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noreferrer noopener">
            cnil.fr/fr/plaintes
          </a>
          .
        </p>
        <p>
          Le détail des traitements figure dans notre <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
