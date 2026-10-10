import type { Metadata } from "next";
import { DepositActivation } from "@/components/deposit-activation";
import { fleet, vehicleBySlug } from "@/lib/fleet";

export const metadata: Metadata = {
  title: "Activer ma caution",
  description: "Activez l’empreinte bancaire de votre caution à la remise des clés.",
  robots: { index: false, follow: false },
};

/**
 * Page ouverte par le QR code que le chauffeur présente à la remise des
 * clés. En production, `r` est un jeton signé propre à la réservation, pas
 * le numéro lisible : impossible d'activer la caution d'un autre. Le
 * véhicule et le montant viennent alors de la réservation, pas de l'URL.
 */
export default async function CautionPage({ searchParams }: PageProps<"/caution">) {
  const { r, v } = await searchParams;
  const vehicle = vehicleBySlug(typeof v === "string" ? v : undefined) ?? fleet[0];
  return (
    <div className="bg-paper">
      <div className="border-b border-ink-line bg-ink text-paper">
        <div className="mx-auto max-w-xl px-4 py-10 sm:px-8">
          <p className="eyebrow text-accent-light">Remise des clés</p>
          <h1 className="mt-3 font-display text-3xl/[1.08] sm:text-4xl/[1.08]">
            Activez votre <span className="text-accent-light italic">caution.</span>
          </h1>
        </div>
      </div>
      <DepositActivation code={typeof r === "string" ? r : "FC-DEMO42"} vehicle={vehicle} />
    </div>
  );
}
