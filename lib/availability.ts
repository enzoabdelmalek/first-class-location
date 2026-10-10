import { isoDay } from "@/lib/dates";
import { fleet, MAX_ONLINE_DAYS, rentalDays, tariff, type Tariff, type Vehicle } from "@/lib/fleet";

/**
 * Disponibilités des véhicules.
 *
 * ⚠️ MAQUETTE : les périodes occupées sont fictives. En production, elles
 * viennent de la base (réservations payées + blocages saisis par l'agence
 * dans le dashboard : entretien, usage personnel) et la disponibilité est
 * revérifiée côté serveur au paiement, pour éviter une double réservation.
 */

/** Temps de préparation entre deux locations : retour, nettoyage, plein, livraison suivante. */
export const TURNAROUND_HOURS = 3;

type Busy = { slug: string; from: Date; to: Date };

/** Exemple : la BMW est prise de J+3 à J+6, pour montrer un véhicule indisponible. */
function busyPeriods(): Busy[] {
  return [{ slug: "bmw-m4-competition", from: new Date(`${isoDay(3)}T09:00`), to: new Date(`${isoDay(6)}T18:00`) }];
}

export function isAvailable(vehicle: Vehicle, start: Date, end: Date) {
  const margin = TURNAROUND_HOURS * 3_600_000;
  return !busyPeriods().some(
    (b) => b.slug === vehicle.slug && start.getTime() < b.to.getTime() + margin && end.getTime() + margin > b.from.getTime(),
  );
}

export type Offer = { vehicle: Vehicle; available: boolean; rate: Tariff | null };

/** Dates du formulaire (AAAA-MM-JJ), lues avec l'heure par défaut du tunnel. */
export const DEFAULT_TIME = "10:00";

export function parseStay(du?: string, au?: string) {
  if (!du || !au || !/^\d{4}-\d{2}-\d{2}$/.test(du) || !/^\d{4}-\d{2}-\d{2}$/.test(au)) return null;
  const start = new Date(`${du}T${DEFAULT_TIME}`);
  const end = new Date(`${au}T${DEFAULT_TIME}`);
  const days = rentalDays(start, end);
  if (days <= 0) return null;
  return { du, au, start, end, days, quote: days > MAX_ONLINE_DAYS };
}

/** Toute la flotte pour des dates : disponibles d'abord, du moins cher au plus cher. */
export function offers(start: Date, end: Date): Offer[] {
  const price = (o: Offer) => (o.rate?.kind === "price" ? o.rate.price : Infinity);
  return fleet
    .map((vehicle) => ({ vehicle, available: isAvailable(vehicle, start, end), rate: tariff(vehicle, start, end) }))
    .sort((a, b) => Number(b.available) - Number(a.available) || price(a) - price(b));
}
