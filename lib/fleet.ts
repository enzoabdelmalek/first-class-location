/**
 * Flotte et tarification.
 *
 * ⚠️ MAQUETTE : modèles, tarifs et cautions sont des exemples pour la
 * validation de la direction artistique. À remplacer par la flotte réelle.
 * `image` accepte un chemin dans /public : tant qu'il est vide, la carte
 * affiche la silhouette dessinée correspondant à `body`.
 */

export type Body = "citadine" | "compacte" | "suv" | "berline" | "utilitaire";

export type Vehicle = {
  slug: string;
  brand: string;
  model: string;
  category: string;
  body: Body;
  gearbox: "Manuelle" | "Automatique";
  fuel: "Essence" | "Diesel" | "Hybride" | "Électrique";
  seats: number;
  bags: number;
  doors: number;
  pricePerDay: number;
  deposit: number;
  minAge: number;
  minLicenseYears: number;
  image?: string;
  highlight?: string;
};

export const fleet: Vehicle[] = [
  {
    slug: "peugeot-208",
    brand: "Peugeot",
    model: "208",
    category: "Citadine",
    body: "citadine",
    gearbox: "Manuelle",
    fuel: "Essence",
    seats: 5,
    bags: 2,
    doors: 5,
    pricePerDay: 39,
    deposit: 800,
    minAge: 21,
    minLicenseYears: 2,
  },
  {
    slug: "renault-clio-v",
    brand: "Renault",
    model: "Clio V E-Tech",
    category: "Citadine",
    body: "citadine",
    gearbox: "Automatique",
    fuel: "Hybride",
    seats: 5,
    bags: 2,
    doors: 5,
    pricePerDay: 45,
    deposit: 800,
    minAge: 21,
    minLicenseYears: 2,
    highlight: "La plus demandée",
  },
  {
    slug: "volkswagen-golf-8",
    brand: "Volkswagen",
    model: "Golf 8",
    category: "Compacte",
    body: "compacte",
    gearbox: "Automatique",
    fuel: "Essence",
    seats: 5,
    bags: 3,
    doors: 5,
    pricePerDay: 59,
    deposit: 1000,
    minAge: 21,
    minLicenseYears: 2,
  },
  {
    slug: "mercedes-classe-a",
    brand: "Mercedes-Benz",
    model: "Classe A 180",
    category: "Compacte premium",
    body: "compacte",
    gearbox: "Automatique",
    fuel: "Essence",
    seats: 5,
    bags: 3,
    doors: 5,
    pricePerDay: 79,
    deposit: 1500,
    minAge: 23,
    minLicenseYears: 3,
  },
  {
    slug: "peugeot-3008",
    brand: "Peugeot",
    model: "3008 Hybrid",
    category: "SUV",
    body: "suv",
    gearbox: "Automatique",
    fuel: "Hybride",
    seats: 5,
    bags: 4,
    doors: 5,
    pricePerDay: 75,
    deposit: 1200,
    minAge: 21,
    minLicenseYears: 2,
    highlight: "Idéal en famille",
  },
  {
    slug: "audi-q5",
    brand: "Audi",
    model: "Q5 Sportback",
    category: "SUV premium",
    body: "suv",
    gearbox: "Automatique",
    fuel: "Diesel",
    seats: 5,
    bags: 4,
    doors: 5,
    pricePerDay: 129,
    deposit: 2500,
    minAge: 25,
    minLicenseYears: 3,
  },
  {
    slug: "mercedes-classe-c",
    brand: "Mercedes-Benz",
    model: "Classe C 220d",
    category: "Berline premium",
    body: "berline",
    gearbox: "Automatique",
    fuel: "Diesel",
    seats: 5,
    bags: 3,
    doors: 4,
    pricePerDay: 99,
    deposit: 2000,
    minAge: 25,
    minLicenseYears: 3,
    highlight: "First Class",
  },
  {
    slug: "renault-trafic",
    brand: "Renault",
    model: "Trafic 9 places",
    category: "Minibus",
    body: "utilitaire",
    gearbox: "Manuelle",
    fuel: "Diesel",
    seats: 9,
    bags: 6,
    doors: 4,
    pricePerDay: 109,
    deposit: 1500,
    minAge: 23,
    minLicenseYears: 3,
  },
];

export const categories = ["Toutes", "Citadine", "Compacte", "SUV", "Berline", "Minibus"] as const;

export function vehicleBySlug(slug: string | undefined) {
  return fleet.find((v) => v.slug === slug);
}

/** Correspondance large : « SUV » couvre « SUV premium », etc. */
export function matchesCategory(vehicle: Vehicle, category: string) {
  return category === "Toutes" || vehicle.category.startsWith(category);
}

/* -------------------------- Tarification -------------------------- */

/** Dégressivité selon la durée. Au-delà de 30 jours : longue durée, sur devis. */
export const degressive = [
  { minDays: 7, rate: 0.2, label: "-20 % dès 7 jours" },
  { minDays: 3, rate: 0.1, label: "-10 % dès 3 jours" },
];

export const extras = [
  {
    id: "serenite",
    label: "Protection Sérénité",
    description: "Rachat partiel de franchise : votre caution est divisée par deux.",
    perDay: 15,
  },
  {
    id: "km",
    label: "Kilométrage illimité",
    description: "Roulez sans compter, au-delà du forfait de 200 km par jour.",
    perDay: 12,
  },
  {
    id: "conducteur",
    label: "Conducteur additionnel",
    description: "Un second conducteur, soumis aux mêmes conditions d'âge et de permis.",
    perDay: 8,
  },
  {
    id: "siege",
    label: "Siège enfant",
    description: "Siège auto homologué, installé avant votre arrivée.",
    perDay: 5,
  },
] as const;

export type ExtraId = (typeof extras)[number]["id"];

/** Nombre de jours facturés : toute période de 24 h entamée est due. */
export function rentalDays(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / 86_400_000));
}

export function quote({
  vehicle,
  days,
  extraIds,
  locationFee,
}: {
  vehicle: Vehicle;
  days: number;
  extraIds: ExtraId[];
  locationFee: number;
}) {
  const base = vehicle.pricePerDay * days;
  const tier = degressive.find((t) => days >= t.minDays);
  const discount = tier ? Math.round(base * tier.rate) : 0;
  const extrasLines = extras
    .filter((e) => extraIds.includes(e.id))
    .map((e) => ({ id: e.id, label: e.label, amount: e.perDay * days }));
  const extrasTotal = extrasLines.reduce((sum, l) => sum + l.amount, 0);
  const total = base - discount + extrasTotal + locationFee;
  const deposit = extraIds.includes("serenite") ? vehicle.deposit / 2 : vehicle.deposit;

  return { base, discount, tier, extrasLines, locationFee, total, deposit };
}
