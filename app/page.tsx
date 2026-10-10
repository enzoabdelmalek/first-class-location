import Image from "next/image";
import Link from "next/link";
import { ArrowIcon, CheckIcon, LockIcon, PinIcon } from "@/components/icons";
import { DateSearch } from "@/components/date-search";
import { FleetGrid } from "@/components/vehicle";
import { fleet, fleetFromPrice, fleetMinAge } from "@/lib/fleet";
import { site } from "@/lib/site";
import { euros } from "@/lib/utils";

const steps = [
  {
    code: "01",
    title: "Choisissez",
    text: "Vos dates, votre véhicule et l’adresse où vous remettre les clés, dans Paris ou en Île-de-France. Le forfait s’applique automatiquement, sans frais cachés.",
  },
  {
    code: "02",
    title: "Réservez en ligne",
    text: "Photos de vos pièces, contrat signé à l’écran, paiement sécurisé. Dix minutes, sans papier, sans passer en agence.",
  },
  {
    code: "03",
    title: "Prenez la route",
    text: "Nous livrons le véhicule à l’adresse choisie : état des lieux, prise en main, et la route est à vous.",
  },
];

/** Bandeau d'ambiance : photos de détail, sans désigner un modèle. */
const experience = [
  {
    src: "/vehicules/audi-rs3-sportback/volant.jpg",
    title: "Prête à partir",
    text: "Contrôlée, nettoyée et le plein fait avant chaque location.",
  },
  {
    src: "/vehicules/audi-rs3-sportback/jante.jpg",
    title: "Livrée chez vous",
    text: "À l’adresse de votre choix dans Paris, à l’heure convenue.",
  },
  {
    src: "/vehicules/audi-rs3-sportback/sieges-baquets.jpg",
    title: "Prise en main",
    text: "État des lieux ensemble et présentation du véhicule avant de prendre la route.",
  },
];

const minDeposit = Math.min(...fleet.map((v) => v.deposit));
const minLicense = Math.min(...fleet.map((v) => v.minLicenseYears));

const conditions = [
  { label: "Âge minimum", value: `Dès ${fleetMinAge} ans`, note: "Selon le véhicule, révolus au départ" },
  { label: "Permis B", value: `Dès ${minLicense} ans`, note: "Selon le véhicule, en cours de validité" },
  { label: "Caution", value: `Dès ${euros(minDeposit)}`, note: "Empreinte ou espèces, rendue au retour" },
  { label: "Paiement", value: "En ligne", note: "Carte bancaire, contrat signé à l’écran" },
];

const faq = [
  {
    q: "Quels documents dois-je fournir ?",
    a: "À la réservation, une photo recto verso de votre carte d’identité (ou de la page photo de votre passeport) et de votre permis de conduire, avec leurs numéros. Le jour J, présentez les originaux.",
  },
  {
    q: "Comment se passe la signature du contrat ?",
    a: "En ligne, juste avant le paiement : vous relisez votre contrat, signez au doigt ou à la souris, puis confirmez avec un code reçu par e-mail. Le contrat signé vous est envoyé aussitôt.",
  },
  {
    q: "Comment fonctionne la caution ?",
    a: "Rien à verser à la réservation. Le jour J, à la remise des clés, vous activez une empreinte bancaire depuis votre téléphone (le montant est bloqué, jamais débité), ou vous remettez la caution en espèces contre reçu. Elle vous est rendue à la récupération du véhicule, après l’état des lieux. Son montant figure sur la fiche de chaque véhicule.",
  },
  {
    q: "Quelle est la différence entre les forfaits semaine et week-end ?",
    a: "Vous choisissez librement vos dates. Une location qui comprend un samedi ou un dimanche relève des forfaits week-end ; sinon, des forfaits semaine. Le prix s’affiche dès que vos dates sont saisies.",
  },
  {
    q: "Le carburant est-il inclus ?",
    a: "Le véhicule vous est remis avec le plein et doit être restitué avec le plein, sauf si vous choisissez l’option « Plein à la restitution ».",
  },
  {
    q: "Où récupérer le véhicule ?",
    a: "Là où vous êtes : nous le livrons sans supplément dans Paris, et sur demande en gare, à l’aéroport ou à domicile en Île-de-France. Le supplément éventuel s’affiche à la réservation.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ---------------------------- Hero ---------------------------- */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <Image
          src="/vehicules/audi-rs3-sportback/arriere-detail.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_62%] opacity-45"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/55 to-ink" />
        <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-8 lg:pt-20">
          <div className="pb-16 text-center lg:pb-24">
            <p className="eyebrow rise inline-flex items-center gap-2 text-accent-light">
              <PinIcon className="h-4 w-4" /> {site.tagline} · {site.city}
            </p>
            <h1 className="rise mt-6 font-display text-[2.5rem]/[1] text-balance sm:text-6xl/[1] lg:text-[5rem]/[1]">
              Conduisez <span className="text-accent-light italic">l’exception.</span>
            </h1>
            <p className="rise mx-auto mt-6 max-w-xl text-base/relaxed text-pretty text-muted-on-ink [animation-delay:120ms] sm:text-lg/relaxed">
              Sportives et SUV de prestige, livrés à l’adresse de votre choix dans {site.city}. Réservation, contrat et
              paiement en ligne, en quelques minutes.
            </p>
            <div className="rise [animation-delay:200ms]">
              <DateSearch className="mx-auto mt-8 max-w-3xl" />
              <Link href="/vehicules" className="mt-4 inline-block text-sm text-muted-on-ink underline-offset-4 hover:text-paper hover:underline">
                Parcourir la flotte
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" aria-hidden />
      </section>

      {/* ---------------------------- La flotte ---------------------------- */}
      <section id="flotte" className="bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="eyebrow text-accent-light">La flotte</p>
              <h2 className="mt-3 font-display text-3xl/[1.08] text-balance sm:text-4xl/[1.08]">
                Choisissez <span className="text-accent-light italic">votre modèle.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm/relaxed text-muted-on-ink">
              Forfaits semaine et week-end à prix fixe, livraison incluse dans {site.city}. Dès {euros(fleetFromPrice)}.
            </p>
          </div>
          <div className="mt-12">
            <FleetGrid vehicles={fleet} />
          </div>
        </div>
      </section>

      {/* ---------------------------- L'expérience ---------------------------- */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-8 lg:pb-28">
          <div className="grid gap-4 border-t border-ink-line pt-20 sm:grid-cols-3 lg:pt-28">
            {experience.map((e) => (
              <figure key={e.title} className="group relative aspect-[4/5] overflow-hidden">
                <Image src={e.src} alt="" fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-6">
                  <p className="font-display text-xl">{e.title}</p>
                  <p className="mt-2 text-sm/relaxed text-muted-on-ink">{e.text}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- Étapes ---------------------------- */}
      <section id="fonctionnement" className="border-b border-line">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
          <p className="eyebrow text-accent">Comment ça marche</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl/[1.08] text-balance sm:text-4xl/[1.08]">
            De la réservation aux clés, en trois étapes.
          </h2>

          <ol className="mt-14 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.code} className="bg-paper p-7 sm:p-9">
                <span className="font-display text-4xl text-accent">{s.code}</span>
                <h3 className="mt-8 font-display text-xl">{s.title}</h3>
                <p className="mt-3 text-sm/relaxed text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------- Conditions ---------------------------- */}
      <section className="bg-paper-alt">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="eyebrow text-accent">Conditions</p>
              <h2 className="mt-3 font-display text-3xl/[1.08] text-balance sm:text-4xl/[1.08]">L’essentiel, avant de réserver.</h2>
              <p className="mt-5 max-w-sm text-base/relaxed text-muted">
                Le détail figure dans nos{" "}
                <Link href="/conditions-de-location" className="text-accent underline underline-offset-4">
                  conditions de location
                </Link>
                .
              </p>
            </div>
            <dl className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
              {conditions.map((c) => (
                <div key={c.label} className="bg-surface p-6 sm:p-8">
                  <dt className="eyebrow text-muted">{c.label}</dt>
                  <dd className="mt-3 font-display text-2xl">{c.value}</dd>
                  <dd className="mt-1 text-sm text-muted">{c.note}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ---------------------------- FAQ + agence ---------------------------- */}
      <section id="faq">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:py-28">
          <div>
            <p className="eyebrow text-accent">Questions fréquentes</p>
            <h2 className="mt-3 font-display text-3xl/[1.08] sm:text-4xl/[1.08]">Bon à savoir.</h2>
            <div className="mt-10 divide-y divide-line border-y border-line">
              {faq.map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span aria-hidden className="text-2xl font-light text-accent transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-base/relaxed text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>

          <aside id="agence" className="self-start overflow-hidden bg-ink text-paper">
            <div className="relative aspect-[16/10]">
              <Image src="/vehicules/audi-rs3-sportback/portiere.jpg" alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
            </div>
            <div className="p-7 pt-2 sm:p-9 sm:pt-2">
              <p className="eyebrow text-accent-light">Remise des clés</p>
              <p className="mt-4 font-display text-xl/snug">
                Partout dans {site.city},
                <br />
                <span className="text-accent-light italic">à l’adresse de votre choix.</span>
              </p>
              <dl className="mt-7 space-y-2 text-sm">
                {site.hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-4 border-b border-ink-line pb-2">
                    <dt className="text-muted-on-ink">{h.days}</dt>
                    <dd>{h.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 grid gap-2">
                <Link
                  href="/reserver"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-hover"
                >
                  Réserver · dès {euros(fleetFromPrice)}
                  <ArrowIcon className="h-4 w-4" />
                </Link>
                <a href={`tel:${site.contact.phone}`} className="inline-flex items-center justify-center rounded-sm border border-white/25 px-5 py-3 font-semibold hover:border-white">
                  {site.contact.phoneDisplay}
                </a>
              </div>
              <ul className="mt-7 space-y-2 text-xs text-muted-on-ink">
                <li className="flex items-center gap-2">
                  <LockIcon className="h-4 w-4 text-accent-light" /> Paiement et signature en ligne sécurisés
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-accent-light" /> Livraison incluse dans Paris
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
