import type { Metadata } from "next";
import { CookieSettingsButton } from "@/components/cookie-consent";
import { LegalLayout, LegalSection } from "@/components/legal-layout";

export const metadata: Metadata = {
  title: "Politique cookies",
  description: "Les cookies utilisés sur le site, leur finalité, leur durée, et comment modifier vos choix.",
  robots: { index: false, follow: true },
};

const groups = [
  {
    title: "Strictement nécessaires",
    note: "Exemptés de consentement : sans eux, la réservation et le paiement ne fonctionnent pas.",
    rows: [
      ["fc-consent", "First Class", "Mémorise vos choix en matière de cookies", "6 mois"],
      ["__stripe_mid", "Stripe", "Prévention de la fraude au paiement", "1 an"],
      ["__stripe_sid", "Stripe", "Prévention de la fraude au paiement", "30 minutes"],
    ],
  },
  {
    title: "Mesure d’audience",
    note: "Déposés uniquement avec votre accord.",
    rows: [["À définir", "-", "Statistiques de fréquentation", "13 mois max."]],
  },
  {
    title: "Publicité et réseaux sociaux",
    note: "Déposés uniquement avec votre accord.",
    rows: [["Aucun à ce jour", "-", "-", "-"]],
  },
];

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Politique cookies"
      intro="Ce que nous déposons sur votre appareil, pourquoi, et comment changer d’avis à tout moment."
    >
      <LegalSection title="Qu’est-ce qu’un cookie ?">
        <p>
          Un cookie est un petit fichier déposé sur votre appareil lors de la visite d’un site. Cette page couvre aussi
          les technologies similaires (stockage local du navigateur). Certains sont indispensables au fonctionnement
          du site ; les autres ne sont déposés qu’après votre accord, conformément à l’article 82 de la loi
          Informatique et Libertés.
        </p>
      </LegalSection>

      <LegalSection title="Vos choix">
        <p>
          Accepter ou refuser est aussi simple dans un sens que dans l’autre, et le refus n’a aucune conséquence sur
          votre réservation. Votre choix est conservé 6 mois, après quoi nous vous le redemandons.
        </p>
        <CookieSettingsButton className="rounded-sm bg-ink px-6 py-3.5 font-semibold text-paper transition hover:bg-accent hover:text-white">
          Modifier mes préférences
        </CookieSettingsButton>
      </LegalSection>

      {groups.map((g) => (
        <LegalSection key={g.title} title={g.title}>
          <p>{g.note}</p>
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line-strong text-ink">
                  <th className="py-3 pr-4 font-semibold">Nom</th>
                  <th className="py-3 pr-4 font-semibold">Émetteur</th>
                  <th className="py-3 pr-4 font-semibold">Finalité</th>
                  <th className="py-3 font-semibold">Durée</th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map(([name, issuer, purpose, duration]) => (
                  <tr key={name} className="border-b border-line align-top">
                    <td className="py-3 pr-4 font-mono text-xs text-ink">{name}</td>
                    <td className="py-3 pr-4">{issuer}</td>
                    <td className="py-3 pr-4">{purpose}</td>
                    <td className="py-3">{duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LegalSection>
      ))}

      <LegalSection title="Paramétrer votre navigateur">
        <p>
          Vous pouvez aussi bloquer ou supprimer les cookies depuis les réglages de votre navigateur. Le blocage des
          cookies nécessaires peut toutefois empêcher la réservation en ligne.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
