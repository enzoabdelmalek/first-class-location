"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { CarSilhouette } from "@/components/car-silhouette";
import { ArrowIcon, CheckIcon, LockIcon } from "@/components/icons";
import { isoDay, timeSlots } from "@/lib/dates";
import {
  extras,
  flagship,
  GRACE_MINUTES,
  MAX_ONLINE_DAYS,
  quote,
  tariff,
  tariffLabel,
  vehicleBySlug,
  type ExtraId,
  type Tariff,
  type Vehicle,
} from "@/lib/fleet";
import { site } from "@/lib/site";
import { useMounted } from "@/lib/use-mounted";
import { cn, euros } from "@/lib/utils";

/**
 * Tunnel de réservation en 5 étapes, entièrement côté client.
 *
 * ⚠️ MAQUETTE : rien n'est envoyé ni débité. À la mise en production, le
 * paiement passera par Stripe (Payment Element + PaymentIntent) et la
 * caution par une autorisation sans capture (`capture_method: "manual"`) ou
 * par le prestataire externe défini dans `site.booking.depositMode`.
 * Les disponibilités du véhicule devront aussi être vérifiées côté serveur.
 */

export type BookingInitial = {
  vehicule?: string;
  lieu?: string;
};

const STEPS = ["Dates", "Options", "Conducteur", "Paiement"] as const;

type Driver = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  licenseNumber: string;
  licenseDate: string;
  comment: string;
};

type Card = { name: string; number: string; expiry: string; cvc: string };

const emptyDriver: Driver = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: "",
  licenseNumber: "",
  licenseDate: "",
  comment: "",
};

function yearsBetween(from: string, to: Date) {
  const d = new Date(from);
  if (Number.isNaN(d.getTime())) return -1;
  let years = to.getFullYear() - d.getFullYear();
  const m = to.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && to.getDate() < d.getDate())) years--;
  return years;
}

const shortDate = (d: Date) =>
  d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }).replace(".", "");

export function Booking({ initial }: { initial: BookingInitial }) {
  const vehicle: Vehicle = vehicleBySlug(initial.vehicule) ?? flagship;

  const [step, setStep] = useState(0);
  const [trip, setTrip] = useState({ from: "", fromTime: "10:00", to: "", toTime: "10:00" });
  const [location, setLocation] = useState(
    site.locations.some((l) => l.id === initial.lieu) ? initial.lieu! : site.locations[0].id,
  );
  const [extraIds, setExtraIds] = useState<ExtraId[]>([]);
  const [driver, setDriver] = useState<Driver>(emptyDriver);
  const [card, setCard] = useState<Card>({ name: "", number: "", expiry: "", cvc: "" });
  const [accepted, setAccepted] = useState({ cgl: false, deposit: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "paying" | "done">("idle");
  const [code, setCode] = useState("");

  // Tout ce qui dépend de la date du jour n'est calculé que dans le navigateur.
  const mounted = useMounted();
  const today = mounted ? isoDay(0) : "";

  const start = trip.from ? new Date(`${trip.from}T${trip.fromTime}`) : null;
  const end = trip.to ? new Date(`${trip.to}T${trip.toTime}`) : null;
  const rate: Tariff | null = start && end ? tariff(vehicle, start, end) : null;
  const priced = rate?.kind === "price" ? rate : null;

  const place = site.locations.find((l) => l.id === location) ?? site.locations[0];
  const price = priced
    ? quote({ vehicle, base: priced.price, days: priced.days, extraIds, locationFee: place.fee })
    : null;

  const go = (next: number) => {
    setErrors({});
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ------------------------------ Validation ------------------------------ */

  function validate(current: number) {
    const e: Record<string, string> = {};
    if (current === 0) {
      if (!trip.from) e.from = "Choisissez une date de début.";
      else if (trip.from <= today) e.from = "Le départ doit être au plus tôt demain.";
      if (!trip.to) e.to = "Choisissez une date de fin.";
      else if (rate === null) e.to = "La fin doit suivre le début.";
      else if (rate.kind === "quote") e.to = `Au-delà de ${MAX_ONLINE_DAYS} jours, contactez-nous pour un devis.`;
    }
    if (current === 2 && start) {
      const required: (keyof Driver)[] = ["firstName", "lastName", "email", "phone", "birthDate", "licenseNumber", "licenseDate"];
      for (const k of required) if (!driver[k].trim()) e[k] = "Champ requis.";
      if (driver.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driver.email)) e.email = "Adresse e-mail invalide.";
      if (driver.birthDate && yearsBetween(driver.birthDate, start) < vehicle.minAge)
        e.birthDate = `Ce véhicule est accessible dès ${vehicle.minAge} ans.`;
      if (driver.licenseDate && yearsBetween(driver.licenseDate, start) < vehicle.minLicenseYears)
        e.licenseDate = `${vehicle.minLicenseYears} ans de permis minimum pour ce véhicule.`;
    }
    if (current === 3) {
      if (!card.name.trim()) e.cardName = "Champ requis.";
      if (card.number.replace(/\s/g, "").length < 15) e.cardNumber = "Numéro de carte incomplet.";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) e.expiry = "Format MM/AA.";
      if (!/^\d{3,4}$/.test(card.cvc)) e.cvc = "3 ou 4 chiffres.";
      if (!accepted.cgl) e.cgl = "Vous devez accepter les conditions générales.";
      if (site.booking.depositMode === "onsite" && !accepted.deposit) e.deposit = "Vous devez autoriser l’empreinte de caution.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate(step)) return;
    if (step < STEPS.length - 1) return go(step + 1);

    setStatus("paying");
    setTimeout(() => {
      setCode(`FC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1400);
  }

  if (status === "done" && priced && price && start && end) {
    return (
      <Confirmation
        code={code}
        driver={driver}
        vehicle={vehicle}
        label={tariffLabel(priced)}
        start={start}
        end={end}
        location={place.label}
        total={price.total}
        deposit={price.deposit}
      />
    );
  }

  /* ------------------------------ Rendu ------------------------------ */

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 lg:py-14">
      <Stepper step={step} onJump={(i) => i < step && go(i)} />

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
        <form onSubmit={onSubmit} noValidate className="min-w-0">
          {step === 0 && (
            <Panel
              title="Vos dates"
              text={`${vehicle.brand} ${vehicle.model} ${vehicle.finish.toLowerCase()}. Choisissez librement le début et la fin : le forfait correspondant s’applique automatiquement.`}
            >
              <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
                <Field label="Début de la location" error={errors.from}>
                  <input
                    type="date"
                    className="field"
                    min={mounted ? isoDay(1) : undefined}
                    value={trip.from}
                    onChange={(e) =>
                      setTrip((t) => ({ ...t, from: e.target.value, to: t.to && t.to < e.target.value ? e.target.value : t.to }))
                    }
                  />
                </Field>
                <Field label="Heure">
                  <select className="field" value={trip.fromTime} onChange={(e) => setTrip((t) => ({ ...t, fromTime: e.target.value }))}>
                    {timeSlots.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Fin de la location" error={errors.to}>
                  <input
                    type="date"
                    className="field"
                    min={trip.from || (mounted ? isoDay(1) : undefined)}
                    value={trip.to}
                    onChange={(e) => setTrip((t) => ({ ...t, to: e.target.value }))}
                  />
                </Field>
                <Field label="Heure">
                  <select className="field" value={trip.toTime} onChange={(e) => setTrip((t) => ({ ...t, toTime: e.target.value }))}>
                    {timeSlots.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {rate ? (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-l-2 border-accent bg-paper-alt px-5 py-4">
                  {rate.kind === "price" ? (
                    <>
                      <p className="text-sm">
                        <span className="text-muted">
                          {rate.days} jour{rate.days > 1 ? "s" : ""} · forfait{" "}
                        </span>
                        <strong className="font-semibold">{tariffLabel(rate)}</strong>
                      </p>
                      <p className="font-display text-2xl">{euros(rate.price)}</p>
                    </>
                  ) : (
                    <p className="text-sm">
                      Au-delà de {MAX_ONLINE_DAYS} jours, nous établissons un tarif sur mesure :{" "}
                      <a href={`tel:${site.contact.phone}`} className="font-semibold underline underline-offset-4">
                        {site.contact.phoneDisplay}
                      </a>
                      .
                    </p>
                  )}
                </div>
              ) : null}
              <p className="mt-3 text-xs text-muted">
                Une tolérance de {GRACE_MINUTES} minutes s’applique au retour : au-delà, une journée supplémentaire est due.
              </p>

              <fieldset className="mt-10">
                <legend className="mb-3 text-sm font-semibold">Remise des clés</legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  {site.locations.map((l) => (
                    <Choice key={l.id} name="location" checked={location === l.id} onChange={() => setLocation(l.id)}>
                      <span className="block text-sm font-semibold">{l.label}</span>
                      <span className="mt-1 block text-sm text-muted">{l.fee ? `+ ${euros(l.fee)}` : "Inclus"}</span>
                    </Choice>
                  ))}
                </div>
              </fieldset>
            </Panel>
          )}

          {step === 1 && priced && (
            <Panel title="Options" text={`Tarifs par jour, soit ${priced.days} jour${priced.days > 1 ? "s" : ""} de location.`}>
              <div className="grid gap-3">
                {extras.map((x) => {
                  const on = extraIds.includes(x.id);
                  return (
                    <label
                      key={x.id}
                      className={cn(
                        "flex cursor-pointer gap-4 rounded-sm border bg-surface p-5 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent",
                        on ? "border-ink shadow-card" : "border-line-strong hover:border-ink",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={on}
                        onChange={() => setExtraIds((ids) => (on ? ids.filter((i) => i !== x.id) : [...ids, x.id]))}
                      />
                      <span
                        aria-hidden
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border",
                          on ? "border-accent bg-accent text-white" : "border-line-strong",
                        )}
                      >
                        {on ? <CheckIcon className="h-3.5 w-3.5" /> : null}
                      </span>
                      <span className="flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="font-semibold">{x.label}</span>
                          <span className="text-sm whitespace-nowrap text-muted">
                            + {euros(x.perDay * priced.days)}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm/relaxed text-muted">{x.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </Panel>
          )}

          {step === 2 && (
            <Panel
              title="Conducteur principal"
              text={`${vehicle.minAge} ans minimum et ${vehicle.minLicenseYears} ans de permis. Les documents originaux seront vérifiés à la remise des clés.`}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Prénom" error={errors.firstName}>
                  <input className="field" autoComplete="given-name" value={driver.firstName} onChange={(e) => setDriver({ ...driver, firstName: e.target.value })} />
                </Field>
                <Field label="Nom" error={errors.lastName}>
                  <input className="field" autoComplete="family-name" value={driver.lastName} onChange={(e) => setDriver({ ...driver, lastName: e.target.value })} />
                </Field>
                <Field label="E-mail" error={errors.email}>
                  <input type="email" className="field" autoComplete="email" value={driver.email} onChange={(e) => setDriver({ ...driver, email: e.target.value })} />
                </Field>
                <Field label="Téléphone" error={errors.phone}>
                  <input type="tel" className="field" autoComplete="tel" value={driver.phone} onChange={(e) => setDriver({ ...driver, phone: e.target.value })} />
                </Field>
                <Field label="Date de naissance" error={errors.birthDate}>
                  <input type="date" className="field" autoComplete="bday" value={driver.birthDate} onChange={(e) => setDriver({ ...driver, birthDate: e.target.value })} />
                </Field>
                <Field label="Date d’obtention du permis" error={errors.licenseDate}>
                  <input type="date" className="field" value={driver.licenseDate} onChange={(e) => setDriver({ ...driver, licenseDate: e.target.value })} />
                </Field>
                <Field label="Numéro de permis" error={errors.licenseNumber} className="sm:col-span-2">
                  <input className="field" value={driver.licenseNumber} onChange={(e) => setDriver({ ...driver, licenseNumber: e.target.value })} />
                </Field>
                <Field label="Une précision ? (facultatif)" className="sm:col-span-2">
                  <textarea rows={3} className="field resize-y" value={driver.comment} onChange={(e) => setDriver({ ...driver, comment: e.target.value })} />
                </Field>
              </div>
              <p className="mt-5 text-xs/relaxed text-muted">
                Ces informations servent uniquement à établir votre contrat de location. Voir notre{" "}
                <Link href="/confidentialite" className="underline underline-offset-4">
                  politique de confidentialité
                </Link>
                .
              </p>
            </Panel>
          )}

          {step === 3 && price && (
            <Panel title="Paiement" text="Réglez votre forfait en toute sécurité. Votre carte n’est débitée que du montant de la location.">
              <div className="rounded-sm border border-line-strong bg-surface p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <LockIcon className="h-4 w-4 text-accent" /> Carte bancaire
                  </p>
                  <p className="font-mono text-[0.68rem] tracking-[0.18em] text-muted">VISA · MASTERCARD · CB</p>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_110px_90px]">
                  <Field label="Titulaire de la carte" error={errors.cardName} className="sm:col-span-3">
                    <input className="field" autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
                  </Field>
                  <Field label="Numéro de carte" error={errors.cardNumber}>
                    <input
                      className="field font-mono"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="1234 5678 9012 3456"
                      value={card.number}
                      onChange={(e) =>
                        setCard({
                          ...card,
                          number: e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})(?=.)/g, "$1 "),
                        })
                      }
                    />
                  </Field>
                  <Field label="Expiration" error={errors.expiry}>
                    <input
                      className="field font-mono"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/AA"
                      value={card.expiry}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setCard({ ...card, expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d });
                      }}
                    />
                  </Field>
                  <Field label="CVC" error={errors.cvc}>
                    <input
                      className="field font-mono"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      value={card.cvc}
                      onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    />
                  </Field>
                </div>
              </div>

              <div className="mt-5 border-l-2 border-accent bg-paper-alt p-5 sm:p-6">
                <p className="eyebrow text-accent">Caution · {euros(price.deposit)}</p>
                {site.booking.depositMode === "onsite" ? (
                  <>
                    <p className="mt-2 text-sm/relaxed text-muted">
                      Une <strong className="text-ink">empreinte bancaire</strong> de {euros(price.deposit)} est enregistrée sur la même
                      carte. Le montant est bloqué, <strong className="text-ink">jamais débité</strong> si le véhicule est restitué en bon
                      état, et libéré sous {site.booking.releaseDays} jours après la restitution.
                    </p>
                    <Check checked={accepted.deposit} onChange={(v) => setAccepted({ ...accepted, deposit: v })} error={errors.deposit}>
                      J’autorise First Class à enregistrer une empreinte de {euros(price.deposit)} sur ma carte.
                    </Check>
                  </>
                ) : (
                  <p className="mt-2 text-sm/relaxed text-muted">
                    Après votre paiement, vous recevrez par e-mail un lien sécurisé {site.booking.depositPartner} pour déposer
                    votre caution de {euros(price.deposit)}. Elle n’est pas débitée et doit être déposée avant la remise des clés.
                  </p>
                )}
              </div>

              <Check checked={accepted.cgl} onChange={(v) => setAccepted({ ...accepted, cgl: v })} error={errors.cgl}>
                J’ai lu et j’accepte les{" "}
                <Link href="/conditions-generales" target="_blank" className="underline underline-offset-4">
                  conditions générales de location
                </Link>{" "}
                et la{" "}
                <Link href="/confidentialite" target="_blank" className="underline underline-offset-4">
                  politique de confidentialité
                </Link>
                .
              </Check>

              <p className="mt-6 border border-dashed border-line-strong px-4 py-3 text-xs text-muted">
                Maquette de démonstration : aucun paiement n’est effectué et aucune donnée n’est enregistrée.
              </p>
            </Panel>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {step > 0 ? (
              <button type="button" onClick={() => go(step - 1)} className="rounded-sm border border-line-strong px-6 py-3.5 font-semibold hover:border-ink">
                Retour
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={status === "paying"}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-sm px-7 py-3.5 font-semibold text-white transition disabled:opacity-60",
                step === STEPS.length - 1 ? "bg-accent hover:bg-accent-hover" : "bg-ink hover:bg-accent",
              )}
            >
              {step < STEPS.length - 1 ? (
                <>
                  Continuer <ArrowIcon className="h-4 w-4" />
                </>
              ) : status === "paying" ? (
                "Paiement en cours…"
              ) : (
                <>
                  <LockIcon className="h-4 w-4" /> Payer {price ? euros(price.total) : ""}
                </>
              )}
            </button>
          </div>
        </form>

        <aside className="lg:sticky lg:top-[96px]">
          <Summary vehicle={vehicle} label={priced ? tariffLabel(priced) : undefined} start={start} end={end} location={place.label} price={price} />
        </aside>
      </div>
    </div>
  );
}

/* ================================ Briques ================================ */

function Stepper({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <ol className="flex items-center gap-2 overflow-x-auto pb-1 text-sm" aria-label="Étapes de la réservation">
      {STEPS.map((label, i) => (
        <li key={label} className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onJump(i)}
            disabled={i >= step}
            aria-current={i === step ? "step" : undefined}
            className={cn(
              "flex items-center gap-2 py-1.5 transition",
              i === step && "text-ink",
              i < step && "hover:text-accent",
              i > step && "text-muted",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full font-mono text-[0.7rem]",
                i === step ? "bg-accent text-white" : i < step ? "bg-ink text-white" : "border border-line-strong",
              )}
            >
              {i < step ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={cn("font-medium", i === step ? "font-semibold" : "sr-only sm:not-sr-only")}>{label}</span>
          </button>
          {i < STEPS.length - 1 ? <span aria-hidden className="h-px w-4 bg-line-strong sm:w-6" /> : null}
        </li>
      ))}
    </ol>
  );
}

function Panel({ title, text, children }: { title: string; text?: string; children: ReactNode }) {
  return (
    <section className="rise">
      <h2 className="font-display text-3xl/[1.08] sm:text-4xl/[1.08]">{title}</h2>
      {text ? <p className="mt-3 max-w-2xl text-base/relaxed text-muted">{text}</p> : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error ? <span className="mt-1.5 block text-sm text-accent">{error}</span> : null}
    </label>
  );
}

function Choice({ name, checked, onChange, children }: { name: string; checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label
      className={cn(
        "relative block cursor-pointer rounded-sm border bg-surface p-4 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent sm:p-5",
        checked ? "border-ink shadow-card ring-1 ring-ink" : "border-line-strong hover:border-ink",
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {checked ? <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-accent" /> : null}
      {children}
    </label>
  );
}

function Check({ checked, onChange, error, children }: { checked: boolean; onChange: (v: boolean) => void; error?: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <label className="flex cursor-pointer items-start gap-3 text-sm/relaxed">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#dc0a14]" />
        <span>{children}</span>
      </label>
      {error ? <p className="mt-1.5 pl-7 text-sm text-accent">{error}</p> : null}
    </div>
  );
}

/** Récapitulatif, sur fond noir : il reste visible pendant tout le tunnel. */
function Summary({
  vehicle,
  label,
  start,
  end,
  location,
  price,
}: {
  vehicle: Vehicle;
  label?: string;
  start: Date | null;
  end: Date | null;
  location: string;
  price: ReturnType<typeof quote> | null;
}) {
  const time = (d: Date) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="overflow-hidden bg-ink text-paper shadow-card">
      <div className="flex items-center justify-between border-b border-ink-line px-6 py-4">
        <span className="text-xs font-semibold tracking-[0.18em] whitespace-nowrap [font-stretch:125%]">
          FIRST <span className="text-accent-light">/</span> CLASS
        </span>
        <span className="eyebrow text-muted-on-ink">Récapitulatif</span>
      </div>

      <div className="px-6 pt-6">
        <CarSilhouette body={vehicle.body} className="w-full text-[#b8bcc2]" strokeWidth={1.4} />
        <p className="mt-4 font-display text-lg leading-snug">
          {vehicle.brand} <span className="text-accent-light italic">{vehicle.model}</span>
        </p>
        <p className="text-sm text-muted-on-ink">{vehicle.finish}</p>
      </div>

      <div className="mx-6 mt-6 grid grid-cols-[1fr_auto_1fr] items-end gap-3 border-t border-ink-line pt-5">
        <div>
          <p className="eyebrow text-muted-on-ink">Départ</p>
          <p className="mt-2 font-display text-2xl leading-none">{start ? time(start) : "--:--"}</p>
          <p className="mt-1 text-sm text-muted-on-ink capitalize">{start ? shortDate(start) : "-"}</p>
        </div>
        <ArrowIcon className="mb-6 h-5 w-5 text-accent-light" />
        <div className="text-right">
          <p className="eyebrow text-muted-on-ink">Retour</p>
          <p className="mt-2 font-display text-2xl leading-none">{end ? time(end) : "--:--"}</p>
          <p className="mt-1 text-sm text-muted-on-ink capitalize">{end ? shortDate(end) : "-"}</p>
        </div>
      </div>

      <dl className="mx-6 mt-5 space-y-2 border-t border-ink-line pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-on-ink">Remise des clés</dt>
          <dd className="text-right">{location}</dd>
        </div>
      </dl>

      <div className="mx-6 mt-5 border-t border-ink-line pt-5 pb-6">
        {label && price ? (
          <>
            <dl className="space-y-2 text-sm">
              <Line label={`Forfait ${label}`} value={euros(price.base)} />
              {price.extrasLines.map((l) => (
                <Line key={l.id} label={l.label} value={euros(l.amount)} />
              ))}
              {price.locationFee ? <Line label="Livraison" value={euros(price.locationFee)} /> : null}
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-ink-line pt-4">
              <p className="text-sm font-semibold">Total TTC</p>
              <p className="font-display text-3xl leading-none">{euros(price.total)}</p>
            </div>
            <p className="mt-3 text-xs text-muted-on-ink">
              + caution {euros(price.deposit)},{" "}
              {site.booking.depositMode === "onsite" ? "par empreinte bancaire non débitée" : "déposée séparément"}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-on-ink">Le prix s’affiche dès que vos dates sont choisies.</p>
        )}
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-on-ink">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

function Confirmation({
  code,
  driver,
  vehicle,
  label,
  start,
  end,
  location,
  total,
  deposit,
}: {
  code: string;
  driver: Driver;
  vehicle: Vehicle;
  label: string;
  start: Date;
  end: Date;
  location: string;
  total: number;
  deposit: number;
}) {
  const full = (d: Date) =>
    d.toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8 lg:py-24">
      <p className="eyebrow rise text-accent">Réservation confirmée</p>
      <h2 className="rise mt-3 font-display text-4xl/[1.05] sm:text-5xl/[1.05]">
        Bonne route, <span className="text-accent italic">{driver.firstName}.</span>
      </h2>
      <p className="rise mt-5 max-w-xl text-base/relaxed text-muted">
        Un e-mail de confirmation vient de partir à <strong className="text-ink">{driver.email}</strong> avec votre contrat et
        la liste des documents à présenter.
      </p>

      <div className="rise mt-10 overflow-hidden bg-ink text-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink-line px-6 py-4 sm:px-8">
          <span className="text-sm font-semibold tracking-[0.18em] [font-stretch:125%]">
            FIRST <span className="text-accent-light">/</span> CLASS
          </span>
          <span className="font-mono text-sm tracking-[0.2em] text-accent-light">{code}</span>
        </div>
        <div className="grid gap-6 px-6 py-7 sm:grid-cols-2 sm:px-8">
          {[
            ["Départ", full(start)],
            ["Retour", full(end)],
            ["Remise des clés", location],
            ["Forfait", label],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="eyebrow text-muted-on-ink">{label}</p>
              <p className="mt-1 first-letter:uppercase">{value}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-ink-line px-6 py-6 sm:px-8">
          <div className="w-44">
            <CarSilhouette body={vehicle.body} className="w-full text-[#b8bcc2]" />
            <p className="mt-2 text-xs text-muted-on-ink">
              {vehicle.brand} {vehicle.model} · {vehicle.finish}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-on-ink">Payé</p>
            <p className="font-display text-4xl">{euros(total)}</p>
            <p className="text-xs text-muted-on-ink">Caution {euros(deposit)} non débitée</p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="rounded-sm bg-ink px-6 py-3.5 font-semibold text-white hover:bg-accent">
          Retour à l’accueil
        </Link>
        <a href={`tel:${site.contact.phone}`} className="rounded-sm border border-line-strong px-6 py-3.5 font-semibold hover:border-ink">
          Une question ? {site.contact.phoneDisplay}
        </a>
      </div>
    </div>
  );
}
