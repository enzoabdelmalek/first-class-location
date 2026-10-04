/**
 * Véhicule et forfaits.
 *
 * Données client (04/10/2026) : une Audi RS3 Sportback gris mat, cinq
 * forfaits, caution de 6 000 €. Le modèle reste une liste pour accueillir
 * d'autres véhicules plus tard sans toucher aux pages.
 *
 * ⚠️ À CONFIRMER avec le client : les jours de départ de chaque forfait
 * (`startDays`), l'âge et l'ancienneté de permis minimum ; les options et
 * leurs tarifs sont des propositions de la maquette.
 */

export type Body = "citadine" | "compacte" | "suv" | "berline" | "utilitaire";

export type Package = {
  id: string;
  label: string;
  period: "Semaine" | "Week-end";
  /** Durée en jours, pour calculer le retour et les options. */
  days: number;
  price: number;
  /** Jours de départ autorisés (0 = dimanche … 6 = samedi). */
  startDays: readonly number[];
  rule: string;
};

export type Vehicle = {
  slug: string;
  brand: string;
  model: string;
  finish: string;
  category: string;
  body: Body;
  headline: { value: string; label: string }[];
  specs: { label: string; value: string }[];
  deposit: number;
  minAge: number;
  minLicenseYears: number;
  packages: Package[];
  image?: string;
};

export const fleet: Vehicle[] = [
  {
    slug: "audi-rs3-sportback",
    brand: "Audi",
    model: "RS3 Sportback",
    finish: "Gris mat",
    category: "Compacte sportive",
    body: "compacte",
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
    deposit: 6000,
    minAge: 25, // TODO à confirmer
    minLicenseYears: 3, // TODO à confirmer
    packages: [
      {
        id: "24h-semaine",
        label: "24 h",
        period: "Semaine",
        days: 1,
        price: 350,
        startDays: [1, 2, 3, 4],
        rule: "Départ du lundi au jeudi, retour le lendemain à la même heure.",
      },
      {
        id: "48h-semaine",
        label: "48 h",
        period: "Semaine",
        days: 2,
        price: 650,
        startDays: [1, 2, 3],
        rule: "Départ du lundi au mercredi, retour 48 h plus tard.",
      },
      {
        id: "lundi-vendredi",
        label: "Lundi → Vendredi",
        period: "Semaine",
        days: 4,
        price: 1200,
        startDays: [1],
        rule: "Départ le lundi, retour le vendredi.",
      },
      {
        id: "48h-weekend",
        label: "48 h",
        period: "Week-end",
        days: 2,
        price: 1000,
        startDays: [5],
        rule: "Départ le vendredi, retour le dimanche.",
      },
      {
        id: "72h-weekend",
        label: "72 h",
        period: "Week-end",
        days: 3,
        price: 1200,
        startDays: [5],
        rule: "Départ le vendredi, retour le lundi.",
      },
    ],
  },
];

export const flagship = fleet[0];

export function vehicleBySlug(slug: string | undefined) {
  return fleet.find((v) => v.slug === slug);
}

export function packageById(vehicle: Vehicle, id: string | undefined) {
  return vehicle.packages.find((p) => p.id === id);
}

/** Prix le plus bas, pour les accroches « dès … ». */
export const fromPrice = (vehicle: Vehicle) => Math.min(...vehicle.packages.map((p) => p.price));

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

export function quote({
  vehicle,
  pack,
  extraIds,
  locationFee,
}: {
  vehicle: Vehicle;
  pack: Package;
  extraIds: ExtraId[];
  locationFee: number;
}) {
  const extrasLines = extras
    .filter((e) => extraIds.includes(e.id))
    .map((e) => ({ id: e.id, label: e.label, amount: e.perDay * pack.days }));
  const extrasTotal = extrasLines.reduce((sum, l) => sum + l.amount, 0);
  return {
    base: pack.price,
    extrasLines,
    locationFee,
    total: pack.price + extrasTotal + locationFee,
    deposit: vehicle.deposit,
  };
}
