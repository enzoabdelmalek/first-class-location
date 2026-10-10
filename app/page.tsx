import Link from "next/link";
import { ArrowIcon, CheckIcon, LockIcon, PinIcon } from "@/components/icons";
import { QuickBooking } from "@/components/quick-booking";
import { PackageGrid, VehicleHeadline, VehicleVisual } from "@/components/vehicle";
import { flagship as car, fromPrice } from "@/lib/fleet";
import { site } from "@/lib/site";
import { euros } from "@/lib/utils";

const steps = [
  {
    code: "01",
    title: "Choisissez",
    text: "Vos dates et l’adresse où vous remettre les clés, dans Paris ou en Île-de-France. Le forfait s’applique automatiquement, sans frais cachés.",
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

const conditions = [
  { label: "Âge minimum", value: `${car.minAge} ans`, note: "Révolus au jour du départ" },
  { label: "Permis B", value: `${car.minLicenseYears} ans`, note: "Permis original, en cours de validité" },
  { label: "Caution", value: euros(car.deposit), note: "Empreinte bancaire, levée au retour" },
  { label: "Paiement", value: "En ligne", note: "Carte bancaire au nom du conducteur" },
];

const faq = [
  {
    q: "Quels documents dois-je fournir ?",
    a: "À la réservation, une photo recto verso de votre carte d’identité (ou de la page photo de votre passeport) et de votre permis de conduire, avec leurs numéros. Le jour J, présentez les originaux et la carte bancaire utilisée pour réserver, à votre nom.",
  },
  {
    q: "Comment se passe la signature du contrat ?",
    a: "En ligne, juste avant le paiement : vous relisez votre contrat, signez au doigt ou à la souris, puis confirmez avec un code reçu par e-mail. Le contrat signé vous est envoyé aussitôt.",
  },
  {
    q: "Comment fonctionne la caution ?",
    a: `Une empreinte bancaire de ${euros(car.deposit)} est réalisée sur votre carte juste avant la remise des clés. Rien n’est débité : le montant est bloqué, puis nous le libérons après l’état des lieux de retour. Prévoyez une carte dont le plafond couvre ce montant.`,
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
        <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-8 lg:pt-20">
          <div className="text-center">
            <p className="eyebrow rise inline-flex items-center gap-2 text-accent-light">
              <PinIcon className="h-4 w-4" /> {site.tagline} · {site.city}
            </p>
            <h1 className="rise mt-6 font-display text-[2.5rem]/[1] text-balance sm:text-6xl/[1] lg:text-[5rem]/[1]">
              Conduisez <span className="text-accent-light italic">l’exception.</span>
            </h1>
            <p className="rise mx-auto mt-6 max-w-xl text-base/relaxed text-pretty text-muted-on-ink [animation-delay:120ms] sm:text-lg/relaxed">
              {car.brand} {car.model} en {car.finish.toLowerCase()}, livrée à l’adresse de votre choix dans Paris. 400
              chevaux, cinq cylindres, à vous le temps d’une journée ou d’un week-end.
            </p>
            <div className="rise [animation-delay:200ms]">
              <QuickBooking vehicle={car} />
              <Link href="#forfaits" className="mt-4 inline-block text-sm text-muted-on-ink underline-offset-4 hover:text-paper hover:underline">
                Voir les forfaits
              </Link>
            </div>
          </div>

          <VehicleVisual vehicle={car} animated priority className="mx-auto mt-4 max-w-4xl" />

          <div className="pb-4">
            <VehicleHeadline vehicle={car} />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" aria-hidden />
      </section>

      {/* ---------------------------- Le modèle ---------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20">
          <div>
            <p className="eyebrow text-accent">Le modèle</p>
            <h2 className="mt-3 font-display text-3xl/[1.08] text-balance sm:text-4xl/[1.08]">
              {car.brand} {car.model} <span className="text-accent italic">{car.finish}.</span>
            </h2>
            <p className="mt-6 max-w-lg text-base/relaxed text-muted">
              La compacte la plus radicale d’Audi Sport, dans une finition mate rare. Un cinq cylindres au son
              inimitable, la transmission quattro et un châssis réglé pour la route comme pour le plaisir.
            </p>
            <Link
              href="/vehicules"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
            >
              Fiche technique complète
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>

          <dl className="divide-y divide-line border-y border-line">
            {car.specs.map((s) => (
              <div key={s.label} className="flex items-baseline justify-between gap-6 py-4">
                <dt className="eyebrow text-muted">{s.label}</dt>
                <dd className="text-right font-medium">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------------------- Forfaits ---------------------------- */}
      <section id="forfaits" className="bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="eyebrow text-accent-light">Forfaits</p>
              <h2 className="mt-3 font-display text-3xl/[1.08] text-balance sm:text-4xl/[1.08]">
                Un prix fixe, <span className="text-accent-light italic">tout compris.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm/relaxed text-muted-on-ink">
              Caution de {euros(car.deposit)} par empreinte bancaire, levée après l’état des lieux de retour. Livraison incluse dans Paris.
            </p>
          </div>
          <div className="mt-12">
            <PackageGrid vehicle={car} />
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
      <section>
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

          <aside id="agence" className="self-start bg-ink p-7 text-paper sm:p-9">
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
                Réserver · dès {euros(fromPrice(car))}
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
          </aside>
        </div>
      </section>
    </>
  );
}
