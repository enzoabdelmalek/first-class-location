/**
 * Informations de l'agence - source de vérité unique pour le site.
 *
 * ⚠️ MAQUETTE. Les valeurs marquées `TODO` sont provisoires et doivent être
 * confirmées par le client avant la mise en ligne. Les données légales
 * proviennent de l'attestation d'immatriculation au RNE du 21/04/2026.
 */

export const site = {
  name: "First Class",
  tagline: "Location de voitures de luxe",
  /**
   * Positionnement : agence PARISIENNE. Le client ne veut pas être associé
   * aux Yvelines (10/10/2026) : la ville du siège n'apparaît que là où la
   * loi l'impose (mentions légales, CGV, contrat, politique de confidentialité).
   */
  city: "Paris",
  area: "Île-de-France",

  description:
    "First Class, location de voitures de luxe à Paris : Audi RS3 Sportback gris mat livrée à l’adresse de votre choix, forfaits semaine et week-end. Réservation, signature et paiement en ligne.",

  url: "https://www.firstclass-location.fr", // TODO domaine définitif

  contact: {
    phone: "+33600000000", // TODO
    phoneDisplay: "06 00 00 00 00", // TODO
    email: "contact@firstclass-location.fr", // TODO
  },

  /** Siège déclaré au RNE : pages légales et contrat UNIQUEMENT, jamais en vitrine. */
  address: {
    street: "2 rue Christophe Colomb",
    postalCode: "78200",
    city: "Mantes-la-Jolie",
    country: "FR",
  },

  // TODO horaires réels
  hours: [
    { days: "Lundi - Samedi", value: "8h - 20h" },
    { days: "Dimanche", value: "Sur rendez-vous" },
  ],

  /**
   * Lieux de remise des clés proposés à la réservation : pas d'agence
   * ouverte au public, le véhicule est livré. TODO tarifs à confirmer.
   */
  locations: [
    { id: "paris", label: "Paris, à l’adresse de votre choix", fee: 0 },
    { id: "gare", label: "Gare ou aéroport parisien", fee: 50 },
    { id: "idf", label: "Île-de-France, à domicile", fee: 50 },
  ],

  booking: {
    /**
     * Caution, au choix du locataire, versée À LA REMISE DES CLÉS et rendue
     * à la récupération du véhicule :
     * - "card" : le locataire active lui-même l'empreinte sur son téléphone
     *   (QR code vers /caution), l'agence la lève depuis le dashboard ;
     * - "cash" : espèces remises contre reçu.
     *
     * Rien n'est bloqué à la réservation : une autorisation bancaire expire
     * au bout de 7 jours, ce qui couvre une location (7 jours max en ligne)
     * mais pas l'attente entre la réservation et le départ.
     */
    depositModes: [
      { id: "card", label: "Empreinte bancaire", note: "Bloquée sur votre carte, jamais débitée" },
      { id: "cash", label: "Espèces", note: "Remises contre reçu, rendues au retour" }, // TODO accord du client à confirmer
    ],
    kmPerDay: 150, // TODO kilométrage inclus à confirmer
    extraKm: 1.5, // TODO à confirmer // €/km au-delà du forfait
    /** Copies des pièces : supprimées N mois après la restitution, hors litige. */
    documentsRetentionMonths: 3, // TODO à valider avec le client
    /** Le véhicule est-il équipé d'un traceur GPS ? Si oui, il faut le dire au locataire. */
    gpsTracker: false, // TODO à confirmer
  },

  legal: {
    tradeName: "First Class",
    ownerName: "Guy-Séraphin Jonathan Mouanda",
    legalForm: "Entrepreneur individuel (EI)",
    siren: "882 688 427",
    siret: "882 688 427 00021",
    ape: "7711A - Location de courte durée de voitures et de véhicules automobiles légers",
    registry: "Immatriculé au Registre national des entreprises (RNE) depuis le 02/04/2026",
    vatNumber: "À compléter", // TODO numéro de TVA, ou « TVA non applicable, art. 293 B du CGI »
    publicationDirector: "Guy-Séraphin Jonathan Mouanda",
    insurer: "À compléter", // TODO assureur de la flotte
    mediator: {
      name: "À compléter", // TODO médiateur de la consommation
      url: "",
    },
    host: {
      name: "Vercel Inc.",
      address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
      url: "https://vercel.com",
    },
    updatedOn: "2026-10-10",
  },
} as const;
