/**
 * Informations de l'agence - source de vérité unique pour le site.
 *
 * ⚠️ MAQUETTE. Les valeurs marquées `TODO` sont provisoires et doivent être
 * confirmées par le client avant la mise en ligne. Les données légales
 * proviennent de l'attestation d'immatriculation au RNE du 21/04/2026.
 */

export const site = {
  name: "First Class",
  tagline: "Location de véhicules",
  city: "Mantes-la-Jolie",
  area: "Yvelines",

  description:
    "First Class, location de voitures courte et longue durée à Mantes-la-Jolie. Citadines, SUV, berlines et utilitaires, réservation et paiement en ligne.",

  url: "https://www.firstclass-location.fr", // TODO domaine définitif

  contact: {
    phone: "+33600000000", // TODO
    phoneDisplay: "06 00 00 00 00", // TODO
    email: "contact@firstclass-location.fr", // TODO
  },

  address: {
    street: "2 rue Christophe Colomb",
    postalCode: "78200",
    city: "Mantes-la-Jolie",
    country: "FR",
  },

  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=2+rue+Christophe+Colomb%2C+78200+Mantes-la-Jolie",

  // TODO horaires réels
  hours: [
    { days: "Lundi - Vendredi", value: "9h - 19h" },
    { days: "Samedi", value: "9h - 17h" },
    { days: "Dimanche", value: "Sur rendez-vous" },
  ],

  /** Lieux de prise en charge proposés à la réservation. */
  locations: [
    { id: "agence", label: "Agence - Mantes-la-Jolie", fee: 0 },
    { id: "gare", label: "Gare de Mantes-la-Jolie", fee: 15 },
    { id: "domicile", label: "Livraison à domicile (Yvelines)", fee: 35 },
  ],

  booking: {
    /**
     * Mode de caution :
     * - "onsite"   : empreinte bancaire prise au moment du paiement, sur le site ;
     * - "external" : caution déposée chez un prestataire (lien envoyé par e-mail).
     * À trancher avec le client - la maquette affiche le mode choisi ici.
     */
    depositMode: "onsite" as "onsite" | "external",
    depositPartner: "Swikly", // utilisé seulement en mode "external"
    kmPerDay: 200,
    extraKm: 0.35, // €/km au-delà du forfait
    releaseDays: 7, // délai de libération de l'empreinte après restitution
  },

  legal: {
    tradeName: "First Class",
    ownerName: "Guy-Séraphin Jonathan Mouanda",
    legalForm: "Entrepreneur individuel (EI)",
    siren: "882 688 427",
    siret: "882 688 427 00021",
    ape: "7711A - Location de courte durée de voitures et de véhicules automobiles légers",
    registry: "Immatriculé au Registre national des entreprises (RNE) depuis le 02/04/2026",
    vatNumber: "TODO - à confirmer (ou mention « TVA non applicable, art. 293 B du CGI »)",
    publicationDirector: "Guy-Séraphin Jonathan Mouanda",
    insurer: "TODO - assureur de la flotte",
    mediator: {
      name: "TODO - médiateur de la consommation",
      url: "",
    },
    host: {
      name: "Vercel Inc.",
      address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
      url: "https://vercel.com",
    },
    updatedOn: "2026-10-04",
  },
} as const;
