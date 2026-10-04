import Link from "next/link";
import { CarSilhouette } from "@/components/car-silhouette";
import { ArrowIcon, CheckIcon, LockIcon, PinIcon } from "@/components/icons";
import { QuickSearch } from "@/components/quick-search";
import { VehicleCard } from "@/components/vehicle-card";
import { fleet } from "@/lib/fleet";
import { site } from "@/lib/site";

const featured = ["renault-clio-v", "peugeot-3008", "mercedes-classe-c", "renault-trafic"]
  .map((slug) => fleet.find((v) => v.slug === slug)!)
  .filter(Boolean);

const steps = [
  {
    code: "01",
    title: "Choisissez",
    text: "Vos dates, votre lieu de prise en charge et le véhicule qui vous ressemble. Le prix s’affiche immédiatement, sans frais cachés.",
  },
  {
    code: "02",
    title: "Réservez en ligne",
    text: "Paiement sécurisé par carte, caution par simple empreinte bancaire : rien n’est débité tant que le véhicule revient en bon état.",
  },
  {
    code: "03",
    title: "Prenez la route",
    text: "Remise des clés à l’agence, à la gare ou chez vous. Un état des lieux rapide, et c’est parti.",
  },
];

const conditions = [
  { label: "Âge minimum", value: "21 ans", note: "23 à 25 ans pour les gammes premium" },
  { label: "Permis", value: "2 ans", note: "3 ans pour les gammes premium" },
  { label: "Kilométrage", value: `${site.booking.kmPerDay} km / jour`, note: "Illimité en option" },
  { label: "Caution", value: "Empreinte bancaire", note: "Non débitée, libérée après restitution" },
];

const faq = [
  {
    q: "Quels documents dois-je présenter ?",
    a: "Une pièce d’identité en cours de validité, votre permis de conduire et une carte bancaire au nom du conducteur principal. Un justificatif de domicile de moins de trois mois peut vous être demandé.",
  },
  {
    q: "Comment fonctionne la caution ?",
    a: "Au moment du paiement, nous enregistrons une empreinte bancaire du montant de la caution. Elle n’est pas débitée : elle est simplement bloquée puis libérée sous 7 jours après la restitution du véhicule.",
  },
  {
    q: "Puis-je annuler ma réservation ?",
    a: "Oui. L’annulation est gratuite jusqu’à 48 heures avant la prise en charge. Au-delà, les conditions générales de location s’appliquent.",
  },
  {
    q: "Le carburant est-il inclus ?",
    a: "Le véhicule vous est remis avec le plein et doit être restitué avec le plein. À défaut, le carburant manquant est facturé au prix du marché, majoré de frais de service.",
  },
  {
    q: "Livrez-vous le véhicule ?",
    a: "Oui, nous livrons à la gare de Mantes-la-Jolie et à domicile dans les Yvelines. Le supplément s’affiche lors de la réservation.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ---------------------------- Hero ---------------------------- */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="blueprint-dark absolute inset-0 opacity-60" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgb(196_162_113/0.16),transparent_60%)]" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-8 lg:pt-24">
          <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="eyebrow rise flex items-center gap-2 text-champagne">
                <PinIcon className="h-4 w-4" /> {site.city} · {site.area}
              </p>
              <h1 className="rise mt-6 font-display text-[3.4rem]/[0.95] tracking-tight text-balance sm:text-7xl/[0.95] lg:text-[6.2rem]/[0.92]">
                La route, en <span className="text-champagne italic">première classe.</span>
              </h1>
              <p className="rise mt-7 max-w-lg text-lg/relaxed text-pretty text-muted-on-ink [animation-delay:120ms]">
                Location de voitures courte et longue durée. Des véhicules récents, un prix clair, une réservation
                réglée en trois minutes.
              </p>
            </div>

            <div className="relative hidden lg:block">
              <CarSilhouette body="berline" animated strokeWidth={1.2} className="w-full text-champagne" />
              <p className="mt-3 text-right font-mono text-[0.68rem] tracking-[0.2em] text-muted-on-ink uppercase">
                Mercedes-Benz Classe C · dès 99 € / jour
              </p>
            </div>
          </div>

          <div className="rise mt-12 [animation-delay:240ms] lg:mt-16">
            <QuickSearch />
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-on-ink">
            {["Annulation gratuite jusqu’à 48 h", "Caution par empreinte, non débitée", "Livraison gare & domicile"].map(
              (t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-champagne" />
                  {t}
                </li>
              ),
            )}
          </ul>
        </div>
      </section>

      {/* ---------------------------- Flotte ---------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-champagne-ink">La flotte</p>
            <h2 className="mt-3 max-w-xl font-display text-5xl/[1.02] tracking-tight text-balance">
              Un véhicule pour chaque trajet.
            </h2>
          </div>
          <Link href="/vehicules" className="inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline">
            Voir les {fleet.length} véhicules
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((v) => (
            <VehicleCard key={v.slug} vehicle={v} />
          ))}
        </div>
      </section>

      {/* ---------------------------- Étapes ---------------------------- */}
      <section id="fonctionnement" className="border-y border-line bg-paper-alt">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
          <p className="eyebrow text-champagne-ink">Comment ça marche</p>
          <h2 className="mt-3 max-w-2xl font-display text-5xl/[1.02] tracking-tight text-balance">
            De la réservation aux clés, en trois étapes.
          </h2>

          <ol className="mt-14 grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.code} className="relative overflow-hidden rounded-2xl border border-line bg-surface">
                <div className="flex items-center justify-between px-6 pt-6">
                  <span className="font-mono text-xs tracking-[0.2em] text-muted">ÉTAPE</span>
                  <span className="font-display text-5xl text-champagne-ink">{s.code}</span>
                </div>
                <div className="perforation mx-6 my-5" aria-hidden />
                <div className="px-6 pb-7">
                  <h3 className="font-display text-3xl">{s.title}</h3>
                  <p className="mt-3 text-sm/relaxed text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------- Longue durée ---------------------------- */}
      <section id="longue-duree" className="relative overflow-hidden bg-ink text-paper">
        <div className="blueprint-dark absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="eyebrow text-champagne">Longue durée</p>
            <h2 className="mt-3 font-display text-5xl/[1.02] tracking-tight text-balance">
              Un mois, six mois, un an. <span className="text-champagne italic">Sans engagement d’achat.</span>
            </h2>
            <p className="mt-6 max-w-lg text-base/relaxed text-muted-on-ink">
              Pour les particuliers comme pour les professionnels : un véhicule à disposition, un loyer mensuel fixe,
              et un tarif établi sur mesure selon la durée et le kilométrage dont vous avez besoin.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:${site.contact.email}?subject=Demande%20de%20devis%20longue%20dur%C3%A9e`}
                className="inline-flex items-center gap-2 rounded-full bg-champagne px-6 py-3.5 font-semibold text-ink hover:bg-paper"
              >
                Demander un devis
                <ArrowIcon className="h-4 w-4" />
              </a>
              <a href={`tel:${site.contact.phone}`} className="inline-flex items-center rounded-full border border-paper/30 px-6 py-3.5 font-semibold hover:border-paper">
                {site.contact.phoneDisplay}
              </a>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-line bg-ink-line">
            {[
              ["1 à 24", "mois de location"],
              ["Fixe", "loyer mensuel"],
              ["Inclus", "assurance & assistance"],
              ["Sur mesure", "kilométrage annuel"],
            ].map(([value, label]) => (
              <div key={label} className="bg-ink-soft p-6 sm:p-8">
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className="block font-display text-4xl text-champagne">{value}</span>
                  <span className="mt-2 block text-sm text-muted-on-ink">{label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------------------- Conditions ---------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow text-champagne-ink">Conditions</p>
            <h2 className="mt-3 font-display text-5xl/[1.02] tracking-tight text-balance">L’essentiel, avant de réserver.</h2>
            <p className="mt-5 max-w-sm text-base/relaxed text-muted">
              Le détail figure dans nos{" "}
              <Link href="/conditions-generales" className="text-champagne-ink underline underline-offset-4">
                conditions générales de location
              </Link>
              .
            </p>
          </div>
          <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {conditions.map((c) => (
              <div key={c.label} className="bg-surface p-6 sm:p-8">
                <dt className="eyebrow text-muted">{c.label}</dt>
                <dd className="mt-3 font-display text-3xl">{c.value}</dd>
                <dd className="mt-1 text-sm text-muted">{c.note}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------------------- FAQ + agence ---------------------------- */}
      <section className="border-t border-line bg-paper-alt">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:py-28">
          <div>
            <p className="eyebrow text-champagne-ink">Questions fréquentes</p>
            <h2 className="mt-3 font-display text-5xl/[1.02] tracking-tight">Bon à savoir.</h2>
            <div className="mt-10 divide-y divide-line border-y border-line">
              {faq.map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-2xl [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span aria-hidden className="text-champagne-ink transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-base/relaxed text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>

          <aside id="agence" className="self-start rounded-2xl bg-ink p-7 text-paper sm:p-9">
            <p className="eyebrow text-champagne">L’agence</p>
            <p className="mt-4 font-display text-3xl">
              {site.address.street}
              <br />
              {site.address.postalCode} {site.address.city}
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
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-champagne px-5 py-3 font-semibold text-ink hover:bg-paper"
              >
                Itinéraire
                <ArrowIcon className="h-4 w-4" />
              </a>
              <a href={`tel:${site.contact.phone}`} className="inline-flex items-center justify-center rounded-full border border-paper/30 px-5 py-3 font-semibold hover:border-paper">
                {site.contact.phoneDisplay}
              </a>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs text-muted-on-ink">
              <LockIcon className="h-4 w-4 text-champagne" /> Paiement en ligne sécurisé
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
