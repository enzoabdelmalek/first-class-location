import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalRow, LegalSection } from "@/components/legal-layout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales du site ${site.name} : éditeur, hébergeur et propriété intellectuelle.`,
  robots: { index: false, follow: true },
};

export default function MentionsLegalesPage() {
  const { legal } = site;
  return (
    <LegalLayout title="Mentions légales" intro="Les informations relatives à l’éditeur et à l’hébergeur de ce site.">
      <LegalSection title="Éditeur du site">
        <LegalRow label="Nom commercial">{legal.tradeName}</LegalRow>
        <LegalRow label="Exploitant">
          {legal.ownerName}, {legal.legalForm}
        </LegalRow>
        <LegalRow label="SIREN">{legal.siren}</LegalRow>
        <LegalRow label="SIRET">{legal.siret}</LegalRow>
        <LegalRow label="Immatriculation">{legal.registry}</LegalRow>
        <LegalRow label="Code APE">{legal.ape}</LegalRow>
        <LegalRow label="TVA intracommunautaire">{legal.vatNumber}</LegalRow>
        <LegalRow label="Siège">
          {site.address.street}, {site.address.postalCode} {site.address.city}, France
        </LegalRow>
        <LegalRow label="Téléphone">
          <a href={`tel:${site.contact.phone}`}>{site.contact.phoneDisplay}</a>
        </LegalRow>
        <LegalRow label="E-mail">
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
        </LegalRow>
      </LegalSection>

      <LegalSection title="Directeur de la publication">
        <p>{legal.publicationDirector}</p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <LegalRow label="Hébergeur">{legal.host.name}</LegalRow>
        <p>{legal.host.address}</p>
        <p>
          <a href={legal.host.url} target="_blank" rel="noreferrer noopener">
            {legal.host.url.replace("https://", "")}
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Assurance">
        <p>
          Les véhicules proposés à la location sont assurés auprès de : {legal.insurer}.
        </p>
      </LegalSection>

      <LegalSection title="Médiation de la consommation">
        <p>
          Conformément aux articles L.611-1 et suivants du Code de la consommation, en cas de litige non résolu
          avec nos services, vous pouvez recourir gratuitement au médiateur de la consommation suivant :{" "}
          {legal.mediator.name}.
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L’ensemble des contenus de ce site (textes, illustrations, logotype, identité visuelle et structure) est
          protégé par le droit d’auteur. Toute reproduction ou représentation, totale ou partielle, sans autorisation
          écrite préalable est interdite. Les marques et modèles de véhicules cités appartiennent à leurs
          propriétaires respectifs.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles et cookies">
        <p>
          Le traitement de vos données est détaillé dans notre{" "}
          <Link href="/confidentialite">politique de confidentialité</Link>. Vos droits et la manière de les exercer
          sont décrits sur la page <Link href="/rgpd">Vos droits (RGPD)</Link>. L’usage des cookies est expliqué dans
          notre <Link href="/cookies">politique cookies</Link>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
