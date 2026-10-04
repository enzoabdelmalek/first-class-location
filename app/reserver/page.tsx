import type { Metadata } from "next";
import { Booking, type BookingInitial } from "@/components/booking";

export const metadata: Metadata = {
  title: "Réserver un véhicule",
  description: "Réservez votre voiture de location en ligne : dates, véhicule, options et paiement sécurisé.",
};

export default async function ReservePage({ searchParams }: PageProps<"/reserver">) {
  const params = await searchParams;
  const pick = (k: keyof BookingInitial) => {
    const v = params[k];
    return typeof v === "string" ? v : undefined;
  };
  const dateOk = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);

  const initial: BookingInitial = {
    lieu: pick("lieu"),
    depart: dateOk(pick("depart")),
    hd: pick("hd"),
    retour: dateOk(pick("retour")),
    hr: pick("hr"),
    vehicule: pick("vehicule"),
  };

  return (
    <div className="bg-paper">
      <div className="border-b border-ink-line bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
          <p className="eyebrow text-champagne">Réservation</p>
          <h1 className="mt-3 font-display text-5xl/[1.02] tracking-tight">
            Préparez votre <span className="text-champagne italic">départ.</span>
          </h1>
        </div>
      </div>
      <Booking initial={initial} />
    </div>
  );
}
