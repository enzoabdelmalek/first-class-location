import type { Metadata } from "next";
import { Booking, type BookingInitial } from "@/components/booking";

export const metadata: Metadata = {
  title: "Réserver",
  description: "Réservez l’Audi RS3 Sportback gris mat en ligne : forfait, date, options et paiement sécurisé.",
};

export default async function ReservePage({ searchParams }: PageProps<"/reserver">) {
  const params = await searchParams;
  const pick = (k: keyof BookingInitial) => {
    const v = params[k];
    return typeof v === "string" ? v : undefined;
  };

  return (
    <div className="bg-paper">
      <div className="border-b border-ink-line bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
          <p className="eyebrow text-accent-light">Réservation</p>
          <h1 className="mt-3 font-display text-3xl/[1.08] sm:text-4xl/[1.08]">
            Préparez votre <span className="text-accent-light italic">départ.</span>
          </h1>
        </div>
      </div>
      <Booking initial={{ forfait: pick("forfait"), vehicule: pick("vehicule"), lieu: pick("lieu") }} />
    </div>
  );
}
