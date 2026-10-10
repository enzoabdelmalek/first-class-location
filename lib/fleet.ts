/**
 * Flotte et forfaits. Le site ne met en avant AUCUN véhicule en particulier :
 * chaque entrée de `fleet` donne une carte dans les listes et sa propre page
 * /vehicules/[slug]. Ajouter un véhicule = ajouter une entrée ici (puis, en
 * production, une ligne en base gérée depuis le dashboard).
 *
 * Données client (04/10/2026) : une Audi RS3 Sportback gris mat, cinq
 * forfaits, caution de 6 000 €. Les autres véhicules sont des EXEMPLES
 * (`placeholder: true`) pour montrer la grille ; à remplacer.
 *
 * Le client choisit librement ses dates ; le prix est déduit des forfaits
 * par `tariff()` (voir sa règle plus bas).
 *
 * Âge minimum : 21 ans, demandé par le client le 10/10/2026.
 *
 * ⚠️ À CONFIRMER avec le client : la règle de tarification, l'ancienneté de
 * permis, la franchise, l'immatriculation ; les options et leurs tarifs sont
 * des propositions de la maquette. L'âge et l'ancienneté de permis doivent
 * aussi être acceptés par l'assureur de la flotte.
 */

export type Body = "citadine" | "compacte" | "suv" | "berline" | "utilitaire";

export type Package = {
  id: string;
  label: string;
  period: "Semaine" | "Week-end";
  /** Durée en jours, pour calculer le retour et les options. */
  days: number;
  price: number;
  rule: string;
};

export type Vehicle = {
  slug: string;
  brand: string;
  model: string;
  finish: string;
  category: string;
  body: Body;
  /** Accroche de la fiche, deux phrases. */
  description: string;
  headline: { value: string; label: string }[];
  specs: { label: string; value: string }[];
  /** Immatriculation, reprise sur le contrat. */
  plate: string;
  deposit: number;
  /** Franchise restant à la charge du locataire en cas de sinistre ; `null` tant qu'elle n'est pas connue. */
  excess: number | null;
  minAge: number;
  minLicenseYears: number;
  packages: Package[];
  image?: string;
  /** Véhicule d'exemple de la maquette : badge « Exemple » sur la carte. */
  placeholder?: boolean;
};

export const fleet: Vehicle[] = [
  {
    slug: "audi-rs3-sportback",
    brand: "Audi",
    model: "RS3 Sportback",
    finish: "Gris mat",
    category: "Compacte sportive",
    body: "compacte",
    description:
      "La compacte la plus radicale d’Audi Sport, dans une finition mate rare. Un cinq cylindres au son inimitable, la transmission quattro et un châssis réglé pour la route comme pour le plaisir.",
    headline: [
      { value: "400", label: "ch" },
      { value: "3,8 s", label: "de 0 à 100 km/h" },
      { value: "500", label: "Nm de couple" },
      { value: "5", label: "cylindres" },
    ],
    specs: [
      { label: "Moteur", value: "2.5 TFSI, 5 cylindres en ligne" },
      { label: "Puissance", value: "400 ch" },
      { label: "Couple", value: "500 Nm" },
      { label: "0 à 100 km/h", value: "3,8 s" },
      { label: "Transmission", value: "quattro, S tronic 7 rapports" },
      { label: "Teinte", value: "Gris mat, teinte exclusive Audi" },
      { label: "Places", value: "5" },
    ],
    plate: "À compléter", // TODO immatriculation
    deposit: 6000,
    excess: null, // TODO montant de la franchise (contrat d'assurance)
    minAge: 21,
    minLicenseYears: 3, // TODO à confirmer avec l'assureur
    packages: [
      {
        id: "24h-semaine",
        label: "24 h",
        period: "Semaine",
        days: 1,
        price: 350,
        rule: "Une journée en semaine, rendue le lendemain à la même heure.",
      },
      {
        id: "48h-semaine",
        label: "48 h",
        period: "Semaine",
        days: 2,
        price: 650,
        rule: "Deux jours en semaine.",
      },
      {
        id: "lundi-vendredi",
        label: "Lundi → Vendredi",
        period: "Semaine",
        days: 4,
        price: 1200,
        rule: "Toute la semaine, du lundi au vendredi.",
      },
      {
        id: "48h-weekend",
        label: "48 h",
        period: "Week-end",
        days: 2,
        price: 1000,
        rule: "Le week-end, 48 h au volant.",
      },
      {
        id: "72h-weekend",
        label: "72 h",
        period: "Week-end",
        days: 3,
        price: 1200,
        rule: "Le week-end prolongé, 72 h au volant.",
      },
    ],
  },
  {
    // EXEMPLE de maquette, à remplacer par un véhicule réel du client.
    slug: "bmw-m4-competition",
    brand: "BMW",
    model: "M4 Competition",
    finish: "Noir saphir",
    category: "Coupé sportif",
    body: "berline",
    description:
      "Un six cylindres biturbo de 510 chevaux dans un coupé quatre places. Une sportive de caractère qui reste utilisable au quotidien.",
    headline: [
      { value: "510", label: "ch" },
      { value: "3,9 s", label: "de 0 à 100 km/h" },
      { value: "650", label: "Nm de couple" },
      { value: "6", label: "cylindres" },
    ],
    specs: [
      { label: "Moteur", value: "3.0 biturbo, 6 cylindres en ligne" },
      { label: "Puissance", value: "510 ch" },
      { label: "Couple", value: "650 Nm" },
      { label: "0 à 100 km/h", value: "3,9 s" },
      { label: "Transmission", value: "Propulsion, M Steptronic 8 rapports" },
      { label: "Places", value: "4" },
    ],
    plate: "À compléter",
    deposit: 8000,
    excess: null,
    minAge: 25,
    minLicenseYears: 5,
    packages: [
      { id: "24h-semaine", label: "24 h", period: "Semaine", days: 1, price: 450, rule: "Une journée en semaine." },
      { id: "48h-semaine", label: "48 h", period: "Semaine", days: 2, price: 850, rule: "Deux jours en semaine." },
      { id: "48h-weekend", label: "48 h", period: "Week-end", days: 2, price: 1300, rule: "Le week-end, 48 h au volant." },
    ],
    placeholder: true,
  },
  {
    // EXEMPLE de maquette, à remplacer par un véhicule réel du client.
    slug: "range-rover-sport",
    brand: "Range Rover",
    model: "Sport P400",
    finish: "Blanc Fuji",
    category: "SUV de luxe",
    body: "suv",
    description:
      "Le SUV de prestige par excellence : cinq places, un confort de limousine et 400 chevaux pour les longs trajets comme pour Paris.",
    headline: [
      { value: "400", label: "ch" },
      { value: "5,9 s", label: "de 0 à 100 km/h" },
      { value: "550", label: "Nm de couple" },
      { value: "5", label: "places" },
    ],
    specs: [
      { label: "Moteur", value: "3.0 hybride léger, 6 cylindres" },
      { label: "Puissance", value: "400 ch" },
      { label: "Couple", value: "550 Nm" },
      { label: "0 à 100 km/h", value: "5,9 s" },
      { label: "Transmission", value: "Intégrale, automatique 8 rapports" },
      { label: "Places", value: "5" },
    ],
    plate: "À compléter",
    deposit: 6000,
    excess: null,
    minAge: 23,
    minLicenseYears: 3,
    packages: [
      { id: "24h-semaine", label: "24 h", period: "Semaine", days: 1, price: 390, rule: "Une journée en semaine." },
      { id: "48h-semaine", label: "48 h", period: "Semaine", days: 2, price: 720, rule: "Deux jours en semaine." },
      { id: "48h-weekend", label: "48 h", period: "Week-end", days: 2, price: 1100, rule: "Le week-end, 48 h au volant." },
    ],
    placeholder: true,
  },
];

export function vehicleBySlug(slug: string | undefined) {
  return fleet.find((v) => v.slug === slug);
}

/** Prix le plus bas d'un véhicule, pour les accroches « dès … ». */
export const fromPrice = (vehicle: Vehicle) => Math.min(...vehicle.packages.map((p) => p.price));

/** Le moins cher de toute la flotte, pour les accroches générales. */
export const fleetFromPrice = Math.min(...fleet.map(fromPrice));

/** Âge minimum le plus bas de la flotte : « dès 21 ans ». */
export const fleetMinAge = Math.min(...fleet.map((v) => v.minAge));

/* ----------------------------- Options ----------------------------- */

export const extras = [
  {
    id: "serenite",
    label: "Protection Sérénité",
    description: "Rachat partiel de franchise : en cas de sinistre, votre participation est réduite.",
    perDay: 49,
  },
  {
    id: "conducteur",
    label: "Conducteur additionnel",
    description: "Un second conducteur, soumis aux mêmes conditions d'âge et de permis.",
    perDay: 25,
  },
  {
    id: "plein",
    label: "Plein à la restitution",
    description: "Rendez le véhicule sans repasser à la pompe : nous faisons le plein pour vous.",
    perDay: 20,
  },
] as const;

export type ExtraId = (typeof extras)[number]["id"];

/* --------------------------- Tarification --------------------------- */

/** Au-delà, la location se fait sur devis. */
export const MAX_ONLINE_DAYS = 7;

/**
 * Tolérance au-delà de chaque tranche de 24 h, en minutes. Mêmes règles que
 * les CGL : un retour jusqu'à une heure après l'échéance ne déclenche pas
 * de journée supplémentaire.
 */
export const GRACE_MINUTES = 60;

/** Nombre de jours facturés : toute période de 24 h entamée au-delà de la tolérance est due. */
export function rentalDays(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.max(1, Math.ceil((ms - GRACE_MINUTES * 60_000) / 86_400_000));
}

/** La location touche-t-elle un samedi ou un dimanche ? */
export function includesWeekend(start: Date, end: Date) {
  const day = new Date(start);
  day.setHours(0, 0, 0, 0);
  while (day < end) {
    if (day.getDay() === 0 || day.getDay() === 6) return true;
    day.setDate(day.getDate() + 1);
  }
  return false;
}

export type Tariff =
  | { kind: "price"; days: number; period: Package["period"]; packs: Package[]; price: number }
  | { kind: "quote"; days: number };

/**
 * Prix d'une location à partir des forfaits du véhicule.
 *
 * Règle (⚠️ à valider avec le client) :
 * - une location qui touche un samedi ou un dimanche est facturée aux
 *   forfaits week-end, sinon aux forfaits semaine ;
 * - on retient la combinaison de forfaits LA MOINS CHÈRE couvrant la durée
 *   (ex. 3 jours en semaine = 24 h + 48 h = 1 000 €, plutôt que 1 200 €) ;
 * - au-delà de MAX_ONLINE_DAYS jours : sur devis.
 */
export function tariff(vehicle: Vehicle, start: Date, end: Date): Tariff | null {
  const days = rentalDays(start, end);
  if (days <= 0) return null;
  if (days > MAX_ONLINE_DAYS) return { kind: "quote", days };

  const period: Package["period"] = includesWeekend(start, end) ? "Week-end" : "Semaine";
  const packs = vehicle.packages.filter((p) => p.period === period);

  // Couverture au moindre coût : best[d] = combinaison la moins chère couvrant d jours.
  const best: { price: number; packs: Package[] }[] = [{ price: 0, packs: [] }];
  for (let d = 1; d <= days; d++) {
    let choice: { price: number; packs: Package[] } | null = null;
    for (const p of packs) {
      const prev = best[Math.max(0, d - p.days)];
      const price = prev.price + p.price;
      if (!choice || price < choice.price) choice = { price, packs: [...prev.packs, p] };
    }
    best[d] = choice!;
  }
  return { kind: "price", days, period, ...best[days] };
}

/** Libellé lisible d'une combinaison : « 24 h + 48 h · semaine ». */
export const tariffLabel = (t: Extract<Tariff, { kind: "price" }>) =>
  `${t.packs.map((p) => p.label).join(" + ")} · ${t.period.toLowerCase()}`;

export function quote({
  vehicle,
  base,
  days,
  extraIds,
  locationFee,
}: {
  vehicle: Vehicle;
  base: number;
  days: number;
  extraIds: ExtraId[];
  locationFee: number;
}) {
  const extrasLines = extras
    .filter((e) => extraIds.includes(e.id))
    .map((e) => ({ id: e.id, label: e.label, amount: e.perDay * days }));
  const extrasTotal = extrasLines.reduce((sum, l) => sum + l.amount, 0);
  return {
    base,
    extrasLines,
    locationFee,
    total: base + extrasTotal + locationFee,
    deposit: vehicle.deposit,
  };
}
