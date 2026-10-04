"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { CarSilhouette } from "@/components/car-silhouette";
import { ArrowIcon, CheckIcon, LockIcon } from "@/components/icons";
import { isoDay, timeSlots } from "@/components/quick-search";
import { VehicleSpecs } from "@/components/vehicle-card";
import { extras, fleet, quote, rentalDays, vehicleBySlug, type ExtraId, type Vehicle } from "@/lib/fleet";
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
 */

export type BookingInitial = {
  lieu?: string;
  depart?: string;
  hd?: string;
  retour?: string;
  hr?: string;
  vehicule?: string;
};

const STEPS = ["Trajet", "Véhicule", "Options", "Conducteur", "Paiement"] as const;

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

const formatDate = (d: Date) =>
  d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }).replace(".", "");

export function Booking({ initial }: { initial: BookingInitial }) {
  const initialVehicle = vehicleBySlug(initial.vehicule);
  const hasDates = Boolean(initial.depart && initial.retour);

  const [step, setStep] = useState(hasDates ? (initialVehicle ? 2 : 1) : 0);
  const [trip, setTrip] = useState({
    location: site.locations.some((l) => l.id === initial.lieu) ? initial.lieu! : "agence",
    from: initial.depart ?? "",
    fromTime: initial.hd && timeSlots.includes(initial.hd) ? initial.hd : "10:00",
    to: initial.retour ?? "",
    toTime: initial.hr && timeSlots.includes(initial.hr) ? initial.hr : "10:00",
  });
  const [vehicleSlug, setVehicleSlug] = useState(initialVehicle?.slug ?? "");
  const [extraIds, setExtraIds] = useState<ExtraId[]>([]);
  const [driver, setDriver] = useState<Driver>(emptyDriver);
  const [card, setCard] = useState<Card>({ name: "", number: "", expiry: "", cvc: "" });
  const [accepted, setAccepted] = useState({ cgl: false, deposit: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "paying" | "done">("idle");
  const [code, setCode] = useState("");
  // Dates par défaut calculées côté navigateur seulement : le serveur ne
  // connaît pas le fuseau du visiteur.
  const mounted = useMounted();
  const today = mounted ? isoDay(0) : "";
  const tripFrom = trip.from || (mounted ? isoDay(1) : "");
  const tripTo = trip.to || (mounted ? isoDay(4) : "");

  const start = useMemo(() => new Date(`${tripFrom}T${trip.fromTime}`), [tripFrom, trip.fromTime]);
  const end = useMemo(() => new Date(`${tripTo}T${trip.toTime}`), [tripTo, trip.toTime]);
  const days = rentalDays(start, end);
  const location = site.locations.find((l) => l.id === trip.location) ?? site.locations[0];
  const vehicle = vehicleBySlug(vehicleSlug);
  const price = vehicle ? quote({ vehicle, days: Math.max(days, 1), extraIds, locationFee: location.fee }) : null;

  const go = (next: number) => {
    setErrors({});
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ------------------------------ Validation ------------------------------ */

  function validate(current: number) {
    const e: Record<string, string> = {};
    if (current === 0) {
      if (!tripFrom) e.from = "Choisissez une date de départ.";
      if (!tripTo) e.to = "Choisissez une date de retour.";
      if (tripFrom && tripFrom < today) e.from = "La date de départ est passée.";
      if (tripFrom && tripTo && days <= 0) e.to = "Le retour doit suivre le départ.";
      if (days > 30) e.to = "Au-delà de 30 jours, contactez-nous pour un devis longue durée.";
    }
    if (current === 1 && !vehicle) e.vehicle = "Sélectionnez un véhicule.";
    if (current === 3 && vehicle) {
      const required: (keyof Driver)[] = ["firstName", "lastName", "email", "phone", "birthDate", "licenseNumber", "licenseDate"];
      for (const k of required) if (!driver[k].trim()) e[k] = "Champ requis.";
      if (driver.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driver.email)) e.email = "Adresse e-mail invalide.";
      if (driver.birthDate && yearsBetween(driver.birthDate, start) < vehicle.minAge)
        e.birthDate = `Ce véhicule est accessible dès ${vehicle.minAge} ans.`;
      if (driver.licenseDate && yearsBetween(driver.licenseDate, start) < vehicle.minLicenseYears)
        e.licenseDate = `${vehicle.minLicenseYears} ans de permis minimum pour ce véhicule.`;
    }
    if (current === 4) {
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

  if (status === "done" && vehicle && price) {
    return (
      <Confirmation
        code={code}
        driver={driver}
        vehicle={vehicle}
        start={start}
        end={end}
        location={location.label}
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
            <Panel title="Où et quand ?" text="Indiquez vos dates et le lieu où vous souhaitez récupérer le véhicule.">
              <fieldset>
                <legend className="mb-3 text-sm font-semibold">Lieu de prise en charge</legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  {site.locations.map((l) => (
                    <Choice
                      key={l.id}
                      name="location"
                      checked={trip.location === l.id}
                      onChange={() => setTrip((t) => ({ ...t, location: l.id }))}
                    >
                      <span className="block text-sm font-semibold">{l.label}</span>
                      <span className="mt-1 block text-sm text-muted">{l.fee ? `+ ${euros(l.fee)}` : "Inclus"}</span>
                    </Choice>
                  ))}
                </div>
              </fieldset>

              <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_140px]">
                <Field label="Date de départ" error={errors.from}>
                  <input
                    type="date"
                    className="field"
                    min={today}
                    value={tripFrom}
                    onChange={(e) => setTrip((t) => ({ ...t, from: e.target.value, to: tripTo < e.target.value ? e.target.value : tripTo }))}
                  />
                </Field>
                <Field label="Heure">
                  <select className="field" value={trip.fromTime} onChange={(e) => setTrip((t) => ({ ...t, fromTime: e.target.value }))}>
                    {timeSlots.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Date de retour" error={errors.to}>
                  <input
                    type="date"
                    className="field"
                    min={tripFrom || today}
                    value={tripTo}
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
              {days > 0 ? (
                <p className="mt-5 text-sm text-muted">
                  Durée facturée : <strong className="text-ink">{days} jour{days > 1 ? "s" : ""}</strong> - toute période de 24 h
                  entamée est due.
                </p>
              ) : null}
            </Panel>
          )}

          {step === 1 && (
            <Panel title="Choisissez votre véhicule" text={`Prix total pour ${days} jour${days > 1 ? "s" : ""}, remise de durée comprise.`}>
              {errors.vehicle ? <p className="mb-4 text-sm font-medium text-red-700">{errors.vehicle}</p> : null}
              <div className="grid gap-3">
                {fleet.map((v) => {
                  const q = quote({ vehicle: v, days: Math.max(days, 1), extraIds: [], locationFee: 0 });
                  return (
                    <Choice key={v.slug} name="vehicle" checked={vehicleSlug === v.slug} onChange={() => setVehicleSlug(v.slug)}>
                      <span className="grid items-center gap-4 sm:grid-cols-[150px_1fr_auto]">
                        <span className="blueprint block rounded-lg bg-paper-alt px-3 pt-4 pb-2">
                          <CarSilhouette body={v.body} className="w-full text-ink" />
                        </span>
                        <span className="block">
                          <span className="eyebrow block text-champagne-ink">{v.category}</span>
                          <span className="mt-1 block font-display text-2xl leading-tight">
                            {v.brand} <span className="italic">{v.model}</span>
                          </span>
                          <span className="mt-3 block">
                            <VehicleSpecs vehicle={v} />
                          </span>
                        </span>
                        <span className="block border-t border-line pt-3 sm:border-0 sm:pt-0 sm:text-right">
                          <span className="block font-display text-3xl">{euros(q.base - q.discount)}</span>
                          <span className="block text-xs text-muted">soit {euros((q.base - q.discount) / Math.max(days, 1))} / jour</span>
                          <span className="block text-xs text-muted">caution {euros(v.deposit)}</span>
                        </span>
                      </span>
                    </Choice>
                  );
                })}
              </div>
            </Panel>
          )}

          {step === 2 && vehicle && (
            <Panel title="Options" text="Ajoutez ce qui rendra le trajet plus simple. Tarifs par jour de location.">
              <div className="grid gap-3 sm:grid-cols-2">
                {extras.map((x) => {
                  const on = extraIds.includes(x.id);
                  return (
                    <label
                      key={x.id}
                      className={cn(
                        "flex cursor-pointer gap-4 rounded-xl border bg-surface p-5 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-champagne",
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
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                          on ? "border-ink bg-ink text-paper" : "border-line-strong",
                        )}
                      >
                        {on ? <CheckIcon className="h-3.5 w-3.5" /> : null}
                      </span>
                      <span className="flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="font-semibold">{x.label}</span>
                          <span className="text-sm whitespace-nowrap text-muted">+ {euros(x.perDay)} / j</span>
                        </span>
                        <span className="mt-1 block text-sm/relaxed text-muted">{x.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-6 rounded-xl bg-paper-alt p-4 text-sm/relaxed text-muted">
                Inclus dans tous les tarifs : assurance responsabilité civile, assistance, {site.booking.kmPerDay} km par jour
                (puis {euros(site.booking.extraKm)} / km).
              </p>
            </Panel>
          )}

          {step === 3 && vehicle && (
            <Panel
              title="Conducteur principal"
              text={`Pour ce véhicule : ${vehicle.minAge} ans minimum et ${vehicle.minLicenseYears} ans de permis. Les documents seront vérifiés à la remise des clés.`}
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

          {step === 4 && vehicle && price && (
            <Panel title="Paiement" text="Réglez votre location en toute sécurité. Votre carte n’est débitée que du montant de la location.">
              <div className="rounded-2xl border border-line-strong bg-surface p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <LockIcon className="h-4 w-4 text-champagne-ink" /> Carte bancaire
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

              <div className="mt-5 rounded-2xl border border-champagne/50 bg-champagne/10 p-5 sm:p-6">
                <p className="eyebrow text-champagne-ink">Caution - {euros(price.deposit)}</p>
                {site.booking.depositMode === "onsite" ? (
                  <>
                    <p className="mt-2 text-sm/relaxed text-muted">
                      Une <strong className="text-ink">empreinte bancaire</strong> de {euros(price.deposit)} est enregistrée sur la même
                      carte. Le montant est bloqué, <strong className="text-ink">jamais débité</strong> si le véhicule est restitué en bon
                      état, et libéré sous {site.booking.releaseDays} jours après la restitution.
                    </p>
                    <Check
                      checked={accepted.deposit}
                      onChange={(v) => setAccepted({ ...accepted, deposit: v })}
                      error={errors.deposit}
                    >
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

              <p className="mt-6 rounded-lg border border-dashed border-line-strong px-4 py-3 text-xs text-muted">
                Maquette de démonstration : aucun paiement n’est effectué et aucune donnée n’est enregistrée.
              </p>
            </Panel>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {step > 0 ? (
              <button type="button" onClick={() => go(step - 1)} className="rounded-full border border-line-strong px-6 py-3.5 font-semibold hover:border-ink">
                Retour
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={status === "paying"}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 font-semibold text-paper transition hover:bg-champagne hover:text-ink disabled:opacity-60"
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
          <BoardingPass
            start={tripFrom ? start : null}
            end={tripTo ? end : null}
            days={days}
            location={location.label}
            vehicle={vehicle}
            price={price}
          />
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
              "flex items-center gap-2 rounded-full py-1.5 pr-3 pl-1.5 transition",
              i === step && "bg-ink text-paper",
              i < step && "hover:bg-paper-alt",
              i > step && "text-muted",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full font-mono text-[0.7rem]",
                i === step ? "bg-champagne text-ink" : i < step ? "bg-ink text-paper" : "border border-line-strong",
              )}
            >
              {i < step ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className="font-medium">{label}</span>
          </button>
          {i < STEPS.length - 1 ? <span aria-hidden className="h-px w-6 bg-line-strong" /> : null}
        </li>
      ))}
    </ol>
  );
}

function Panel({ title, text, children }: { title: string; text?: string; children: ReactNode }) {
  return (
    <section className="rise">
      <h2 className="font-display text-4xl/[1.05] tracking-tight sm:text-5xl/[1.05]">{title}</h2>
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
      {error ? <span className="mt-1.5 block text-sm text-red-700">{error}</span> : null}
    </label>
  );
}

function Choice({ name, checked, onChange, children }: { name: string; checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label
      className={cn(
        "relative block cursor-pointer rounded-xl border bg-surface p-4 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-champagne sm:p-5",
        checked ? "border-ink shadow-card ring-1 ring-ink" : "border-line-strong hover:border-ink",
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}

function Check({ checked, onChange, error, children }: { checked: boolean; onChange: (v: boolean) => void; error?: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <label className="flex cursor-pointer items-start gap-3 text-sm/relaxed">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#0e0f11]" />
        <span>{children}</span>
      </label>
      {error ? <p className="mt-1.5 pl-7 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

/** Récapitulatif façon carte d'embarquement : la signature visuelle du tunnel. */
function BoardingPass({
  start,
  end,
  days,
  location,
  vehicle,
  price,
}: {
  start: Date | null;
  end: Date | null;
  days: number;
  location: string;
  vehicle?: Vehicle;
  price: ReturnType<typeof quote> | null;
}) {
  const valid = start && end && days > 0 && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime());
  const time = (d: Date) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-line">
      <div className="flex items-center justify-between bg-ink px-6 py-4 text-paper">
        <span className="font-display text-xl italic">First</span>
        <span className="font-mono text-[0.65rem] tracking-[0.22em] text-champagne">VOTRE RÉSERVATION</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3 px-6 pt-6">
        <div>
          <p className="font-mono text-[0.65rem] tracking-[0.2em] text-muted">DÉPART</p>
          <p className="mt-1 font-display text-3xl leading-none">{valid ? time(start) : "--:--"}</p>
          <p className="mt-1 text-sm text-muted capitalize">{valid ? formatDate(start) : "-"}</p>
        </div>
        <div className="pb-6 text-center">
          <p className="font-mono text-[0.65rem] text-champagne-ink">
            {valid ? `${days} J` : ""}
          </p>
          <ArrowIcon className="mx-auto h-5 w-5 text-champagne-ink" />
        </div>
        <div className="text-right">
          <p className="font-mono text-[0.65rem] tracking-[0.2em] text-muted">RETOUR</p>
          <p className="mt-1 font-display text-3xl leading-none">{valid ? time(end) : "--:--"}</p>
          <p className="mt-1 text-sm text-muted capitalize">{valid ? formatDate(end) : "-"}</p>
        </div>
      </div>

      <div className="mx-6 mt-5 border-t border-line pt-4">
        <p className="font-mono text-[0.65rem] tracking-[0.2em] text-muted">LIEU</p>
        <p className="mt-1 text-sm font-medium">{location}</p>
      </div>

      <div className="mx-6 mt-4 border-t border-line pt-4">
        <p className="font-mono text-[0.65rem] tracking-[0.2em] text-muted">VÉHICULE</p>
        {vehicle ? (
          <div className="mt-2 flex items-center gap-4">
            <CarSilhouette body={vehicle.body} className="w-24 shrink-0 text-ink" strokeWidth={2.4} />
            <p className="font-display text-xl leading-tight">
              {vehicle.brand} <span className="italic">{vehicle.model}</span>
            </p>
          </div>
        ) : (
          <p className="mt-1 text-sm text-muted">À choisir</p>
        )}
      </div>

      <div className="relative my-6">
        <span className="absolute top-1/2 -left-3 h-6 w-6 -translate-y-1/2 rounded-full bg-paper ring-1 ring-line" aria-hidden />
        <span className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full bg-paper ring-1 ring-line" aria-hidden />
        <div className="perforation mx-6" aria-hidden />
      </div>

      <div className="px-6 pb-6">
        {price && valid ? (
          <>
            <dl className="space-y-2 text-sm">
              <Line label={`Location · ${days} j`} value={euros(price.base)} />
              {price.discount ? <Line label={price.tier?.label ?? "Remise"} value={`- ${euros(price.discount)}`} accent /> : null}
              {price.extrasLines.map((l) => (
                <Line key={l.id} label={l.label} value={euros(l.amount)} />
              ))}
              {price.locationFee ? <Line label="Livraison" value={euros(price.locationFee)} /> : null}
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
              <p className="text-sm font-semibold">Total TTC</p>
              <p className="font-display text-4xl leading-none">{euros(price.total)}</p>
            </div>
            <p className="mt-3 text-xs text-muted">
              + caution {euros(price.deposit)}, {site.booking.depositMode === "onsite" ? "par empreinte bancaire non débitée" : "déposée séparément"}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">Le prix s’affiche dès que les dates et le véhicule sont choisis.</p>
        )}
      </div>
    </div>
  );
}

function Line({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={cn("tabular-nums", accent && "text-champagne-ink")}>{value}</dd>
    </div>
  );
}

function Confirmation({
  code,
  driver,
  vehicle,
  start,
  end,
  location,
  total,
  deposit,
}: {
  code: string;
  driver: Driver;
  vehicle: Vehicle;
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
      <p className="eyebrow rise text-champagne-ink">Réservation confirmée</p>
      <h2 className="rise mt-3 font-display text-5xl/[1.02] tracking-tight sm:text-6xl/[1.02]">
        Bon voyage, <span className="italic">{driver.firstName}.</span>
      </h2>
      <p className="rise mt-5 max-w-xl text-base/relaxed text-muted">
        Un e-mail de confirmation vient de partir à <strong className="text-ink">{driver.email}</strong> avec votre contrat et
        la liste des documents à présenter.
      </p>

      <div className="rise mt-10 overflow-hidden rounded-2xl bg-ink text-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink-line px-6 py-4 sm:px-8">
          <span className="font-display text-2xl italic">First Class</span>
          <span className="font-mono text-sm tracking-[0.2em] text-champagne">{code}</span>
        </div>
        <div className="grid gap-6 px-6 py-7 sm:grid-cols-2 sm:px-8">
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-muted-on-ink">DÉPART</p>
            <p className="mt-1 capitalize">{full(start)}</p>
          </div>
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-muted-on-ink">RETOUR</p>
            <p className="mt-1 capitalize">{full(end)}</p>
          </div>
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-muted-on-ink">LIEU</p>
            <p className="mt-1">{location}</p>
          </div>
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-muted-on-ink">VÉHICULE</p>
            <p className="mt-1">
              {vehicle.brand} {vehicle.model}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-ink-line px-6 py-6 sm:px-8">
          <CarSilhouette body={vehicle.body} className="w-40 text-champagne" />
          <div className="text-right">
            <p className="text-sm text-muted-on-ink">Payé</p>
            <p className="font-display text-4xl">{euros(total)}</p>
            <p className="text-xs text-muted-on-ink">Caution {euros(deposit)} non débitée</p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="rounded-full bg-ink px-6 py-3.5 font-semibold text-paper hover:bg-champagne hover:text-ink">
          Retour à l’accueil
        </Link>
        <a href={`tel:${site.contact.phone}`} className="rounded-full border border-line-strong px-6 py-3.5 font-semibold hover:border-ink">
          Une question ? {site.contact.phoneDisplay}
        </a>
      </div>
    </div>
  );
}
