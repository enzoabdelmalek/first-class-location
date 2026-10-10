"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { CarSilhouette } from "@/components/car-silhouette";
import { DocumentUpload, type Upload } from "@/components/document-upload";
import { ArrowIcon, CheckIcon, LockIcon, ShieldIcon } from "@/components/icons";
import { RentalContract } from "@/components/rental-contract";
import { SignaturePad } from "@/components/signature-pad";
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
 * Tunnel de réservation en 5 étapes, entièrement côté client. Il doit rester
 * court : dates et options sur le même écran, une barre de total fixe sur
 * mobile, et un retour direct sur la première erreur.
 *
 * ⚠️ MAQUETTE : rien n'est envoyé, stocké ni débité. En production :
 * - pièces justificatives : route serveur → stockage privé, jamais via la
 *   clé publique (voir `document-upload.tsx`) ;
 * - signature : PDF du contrat + empreinte SHA-256 + journal de preuve
 *   (horodatage, IP, code reçu par e-mail) ;
 * - paiement : Stripe Payment Element, carte enregistrée pour la caution ;
 * - caution : autorisation sans capture créée juste avant la remise des
 *   clés, levée ou encaissée par l'agence depuis le dashboard ;
 * - disponibilités du véhicule vérifiées côté serveur.
 */

/** Pré-remplissage depuis l'URL (formulaire du hero, liens des forfaits). */
export type BookingInitial = {
  vehicule?: string;
  lieu?: string;
  du?: string;
  au?: string;
};

const isDate = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");

const STEPS = ["Location", "Conducteur", "Documents", "Contrat", "Paiement"] as const;
type StepName = (typeof STEPS)[number];

type Driver = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  birthPlace: string;
  street: string;
  postalCode: string;
  city: string;
  comment: string;
};

type IdType = "cni" | "passeport";

type Papers = {
  idType: IdType;
  idNumber: string;
  idExpiry: string;
  idFront?: Upload;
  idBack?: Upload;
  licenseNumber: string;
  licenseDate: string;
  licenseFront?: Upload;
  licenseBack?: Upload;
  certified: boolean;
};

type Signing = { read: boolean; signature: string; codeSent: boolean; code: string };

type Card = { name: string; number: string; expiry: string; cvc: string };

const emptyDriver: Driver = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: "",
  birthPlace: "",
  street: "",
  postalCode: "",
  city: "",
  comment: "",
};

const emptyPapers: Papers = { idType: "cni", idNumber: "", idExpiry: "", licenseNumber: "", licenseDate: "", certified: false };

const idTypes: { id: IdType; label: string; note: string }[] = [
  { id: "cni", label: "Carte d’identité", note: "Recto et verso" },
  { id: "passeport", label: "Passeport", note: "Page avec la photo" },
];

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

/** « j•••@gmail.com » : de quoi reconnaître l'adresse sans tout réafficher. */
const maskEmail = (email: string) => email.replace(/^(.)[^@]*/, (_, first: string) => `${first}•••`);

export function Booking({ initial }: { initial: BookingInitial }) {
  const vehicle: Vehicle = vehicleBySlug(initial.vehicule) ?? flagship;

  const [step, setStep] = useState(0);
  const [trip, setTrip] = useState({ from: isDate(initial.du), fromTime: "10:00", to: isDate(initial.au), toTime: "10:00" });
  const [location, setLocation] = useState(
    site.locations.some((l) => l.id === initial.lieu) ? initial.lieu! : site.locations[0].id,
  );
  const [handover, setHandover] = useState("");
  const [extraIds, setExtraIds] = useState<ExtraId[]>([]);
  const [driver, setDriver] = useState<Driver>(emptyDriver);
  const [papers, setPapers] = useState<Papers>(emptyPapers);
  const [signing, setSigning] = useState<Signing>({ read: false, signature: "", codeSent: false, code: "" });
  const [card, setCard] = useState<Card>({ name: "", number: "", expiry: "", cvc: "" });
  const [accepted, setAccepted] = useState({ cgv: false, deposit: false });
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
  const handoverLabel = location === "gare" ? "Gare ou aéroport, n° de train ou de vol" : "Adresse de livraison";
  const handoverPlace = handover.trim() ? `${place.label} · ${handover.trim()}` : place.label;
  const price = priced
    ? quote({ vehicle, base: priced.price, days: priced.days, extraIds, locationFee: place.fee })
    : null;

  const current: StepName = STEPS[step];
  const idType = idTypes.find((t) => t.id === papers.idType)!;
  const setPaper = <K extends keyof Papers>(key: K, value: Papers[K]) => setPapers((p) => ({ ...p, [key]: value }));

  /** Amène la première erreur à l'écran, au lieu de laisser chercher ce qui bloque. */
  const showFirstError = () =>
    requestAnimationFrame(() =>
      document.querySelector("[data-error]")?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );

  const go = (next: number) => {
    setErrors({});
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ------------------------------ Validation ------------------------------ */

  function validate(name: StepName) {
    const e: Record<string, string> = {};
    if (name === "Location") {
      if (!trip.from) e.from = "Choisissez une date de début.";
      else if (trip.from <= today) e.from = "Le départ doit être au plus tôt demain.";
      if (!trip.to) e.to = "Choisissez une date de fin.";
      else if (rate === null) e.to = "La fin doit suivre le début.";
      else if (rate.kind === "quote") e.to = `Au-delà de ${MAX_ONLINE_DAYS} jours, contactez-nous pour un devis.`;
      if (!handover.trim()) e.handover = "Indiquez où vous remettre les clés.";
    }
    if (name === "Conducteur" && start) {
      const required: (keyof Driver)[] = ["firstName", "lastName", "email", "phone", "birthDate", "birthPlace", "street", "postalCode", "city"];
      for (const k of required) if (!driver[k].trim()) e[k] = "Champ requis.";
      if (driver.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driver.email)) e.email = "Adresse e-mail invalide.";
      if (driver.birthDate && yearsBetween(driver.birthDate, start) < vehicle.minAge)
        e.birthDate = `Vous devez avoir ${vehicle.minAge} ans révolus au départ de la location.`;
    }
    if (name === "Documents" && start && end) {
      if (!/^[A-Z0-9]{6,12}$/i.test(papers.idNumber.replace(/\s/g, ""))) e.idNumber = "Numéro incomplet : recopiez-le tel qu’il figure sur la pièce.";
      if (!papers.idExpiry) e.idExpiry = "Champ requis.";
      else if (new Date(papers.idExpiry) < end) e.idExpiry = "La pièce doit être valide jusqu’à la fin de la location.";
      if (!papers.idFront) e.idFront = "Ajoutez une photo de la pièce.";
      if (papers.idType === "cni" && !papers.idBack) e.idBack = "Ajoutez le verso de la carte.";
      if (!/^[A-Z0-9]{6,15}$/i.test(papers.licenseNumber.replace(/\s/g, ""))) e.licenseNumber = "Numéro incomplet : recopiez-le tel qu’il figure sur le permis.";
      if (!papers.licenseDate) e.licenseDate = "Champ requis.";
      else if (yearsBetween(papers.licenseDate, start) < vehicle.minLicenseYears)
        e.licenseDate = `${vehicle.minLicenseYears} ans de permis minimum pour ce véhicule.`;
      if (!papers.licenseFront) e.licenseFront = "Ajoutez le recto du permis.";
      if (!papers.licenseBack) e.licenseBack = "Ajoutez le verso du permis.";
      if (!papers.certified) e.certified = "Cochez cette case pour continuer.";
    }
    if (name === "Contrat") {
      if (!signing.read) e.read = "Confirmez avoir lu le contrat.";
      if (!signing.signature) e.signature = "Signez dans le cadre.";
      if (!signing.codeSent) e.code = "Recevez puis saisissez le code de confirmation.";
      else if (!/^\d{6}$/.test(signing.code)) e.code = "Le code compte 6 chiffres.";
    }
    if (name === "Paiement") {
      if (!card.name.trim()) e.cardName = "Champ requis.";
      if (card.number.replace(/\s/g, "").length < 15) e.cardNumber = "Numéro de carte incomplet.";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) e.expiry = "Format MM/AA.";
      if (!/^\d{3,4}$/.test(card.cvc)) e.cvc = "3 ou 4 chiffres.";
      if (!accepted.deposit) e.deposit = "Vous devez autoriser l’empreinte de caution.";
      if (!accepted.cgv) e.cgv = "Vous devez accepter les conditions.";
    }
    setErrors(e);
    const ok = Object.keys(e).length === 0;
    if (!ok) showFirstError();
    return ok;
  }

  function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate(current)) return;
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
        location={handoverPlace}
        total={price.total}
        deposit={price.deposit}
      />
    );
  }

  /* ------------------------------ Rendu ------------------------------ */

  const driverField = (key: keyof Driver, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, className?: string) => (
    <Field label={label} error={errors[key]} className={className}>
      <input className="field" value={driver[key]} onChange={(e) => setDriver({ ...driver, [key]: e.target.value })} {...props} />
    </Field>
  );

  const cta =
    step < STEPS.length - 1 ? (
      <>
        {current === "Contrat" ? "Signer et continuer" : "Continuer"} <ArrowIcon className="h-4 w-4" />
      </>
    ) : status === "paying" ? (
      "Paiement en cours…"
    ) : (
      <>
        <LockIcon className="h-4 w-4" /> Payer {price ? euros(price.total) : ""}
      </>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-8 lg:py-14">
      <Stepper step={step} onJump={(i) => i < step && go(i)} />

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
        <form id="reservation" onSubmit={onSubmit} noValidate className="min-w-0">
          {current === "Location" && (
            <Panel
              title="Votre location"
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
                <Field label={handoverLabel} error={errors.handover} className="mt-4">
                  <input
                    className="field"
                    autoComplete={location === "gare" ? "off" : "street-address"}
                    placeholder={location === "gare" ? "Gare de Lyon, TGV 6612 de 9h42" : "12 avenue Montaigne, 75008 Paris"}
                    value={handover}
                    onChange={(e) => setHandover(e.target.value)}
                  />
                </Field>
              </fieldset>

              {priced ? (
                <fieldset className="mt-10">
                  <legend className="mb-3 text-sm font-semibold">
                    Options <span className="font-normal text-muted">· facultatives, prix pour {priced.days} jour{priced.days > 1 ? "s" : ""}</span>
                  </legend>
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
                </fieldset>
              ) : null}
            </Panel>
          )}

          {current === "Conducteur" && (
            <Panel
              title="Conducteur principal"
              text={`Accessible dès ${vehicle.minAge} ans révolus au jour du départ. Ces informations figurent sur votre contrat de location.`}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {driverField("firstName", "Prénom", { autoComplete: "given-name" })}
                {driverField("lastName", "Nom", { autoComplete: "family-name" })}
                {driverField("email", "E-mail", { type: "email", autoComplete: "email" })}
                {driverField("phone", "Téléphone", { type: "tel", autoComplete: "tel" })}
                {driverField("birthDate", "Date de naissance", { type: "date", autoComplete: "bday" })}
                {driverField("birthPlace", "Lieu de naissance", { placeholder: "Ville, pays" })}
                {driverField("street", "Adresse", { autoComplete: "street-address" }, "sm:col-span-2")}
                {driverField("postalCode", "Code postal", { autoComplete: "postal-code", inputMode: "numeric" })}
                {driverField("city", "Ville", { autoComplete: "address-level2" })}
                <Field label="Une précision ? (facultatif)" className="sm:col-span-2">
                  <textarea rows={3} className="field resize-y" value={driver.comment} onChange={(e) => setDriver({ ...driver, comment: e.target.value })} />
                </Field>
              </div>
              <p className="mt-5 text-xs/relaxed text-muted">
                Votre adresse et votre lieu de naissance servent à établir le contrat et, en cas d’infraction, à vous désigner
                comme conducteur (art. L.121-2 du Code de la route). Voir notre{" "}
                <Link href="/confidentialite" className="underline underline-offset-4">
                  politique de confidentialité
                </Link>
                .
              </p>
            </Panel>
          )}

          {current === "Documents" && (
            <Panel
              title="Vos pièces"
              text="Photographiez vos documents à plat, en entier, sans reflet. Nous les vérifions avant votre départ ; les originaux vous seront demandés à la remise des clés."
            >
              <fieldset>
                <legend className="mb-3 text-sm font-semibold">Pièce d’identité</legend>
                <div className="grid grid-cols-2 gap-3">
                  {idTypes.map((t) => (
                    <Choice
                      key={t.id}
                      name="idType"
                      checked={papers.idType === t.id}
                      onChange={() => setPapers((p) => ({ ...p, idType: t.id, idBack: t.id === "passeport" ? undefined : p.idBack }))}
                    >
                      <span className="block text-sm font-semibold">{t.label}</span>
                      <span className="mt-1 block text-sm text-muted">{t.note}</span>
                    </Choice>
                  ))}
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label={`Numéro ${papers.idType === "cni" ? "de la carte" : "du passeport"}`} error={errors.idNumber}>
                    <input
                      className="field font-mono uppercase"
                      autoComplete="off"
                      spellCheck={false}
                      value={papers.idNumber}
                      onChange={(e) => setPaper("idNumber", e.target.value.toUpperCase())}
                    />
                  </Field>
                  <Field label="Valable jusqu’au" error={errors.idExpiry}>
                    <input type="date" className="field" value={papers.idExpiry} onChange={(e) => setPaper("idExpiry", e.target.value)} />
                  </Field>
                  <DocumentUpload
                    label={papers.idType === "cni" ? "Recto" : "Page avec la photo"}
                    value={papers.idFront}
                    onChange={(v) => setPaper("idFront", v)}
                    error={errors.idFront}
                  />
                  {papers.idType === "cni" ? (
                    <DocumentUpload label="Verso" value={papers.idBack} onChange={(v) => setPaper("idBack", v)} error={errors.idBack} />
                  ) : null}
                </div>
              </fieldset>

              <div className="mt-10 border-t border-line pt-8" />
              <fieldset>
                <legend className="mb-3 text-sm font-semibold">Permis de conduire</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Numéro de permis" error={errors.licenseNumber}>
                    <input
                      className="field font-mono uppercase"
                      autoComplete="off"
                      spellCheck={false}
                      value={papers.licenseNumber}
                      onChange={(e) => setPaper("licenseNumber", e.target.value.toUpperCase())}
                    />
                  </Field>
                  <Field label="Date d’obtention du permis B" error={errors.licenseDate}>
                    <input type="date" className="field" value={papers.licenseDate} onChange={(e) => setPaper("licenseDate", e.target.value)} />
                  </Field>
                  <DocumentUpload
                    label="Recto"
                    hint="Côté photo."
                    value={papers.licenseFront}
                    onChange={(v) => setPaper("licenseFront", v)}
                    error={errors.licenseFront}
                  />
                  <DocumentUpload
                    label="Verso"
                    hint="Côté catégories et dates."
                    value={papers.licenseBack}
                    onChange={(v) => setPaper("licenseBack", v)}
                    error={errors.licenseBack}
                  />
                </div>
              </fieldset>

              <Check checked={papers.certified} onChange={(v) => setPaper("certified", v)} error={errors.certified}>
                Je certifie que ces documents sont authentiques, en cours de validité et à mon nom.
              </Check>

              <p className="mt-6 flex gap-3 border-l-2 border-accent bg-paper-alt p-4 text-xs/relaxed text-muted">
                <ShieldIcon className="h-5 w-5 shrink-0 text-accent" />
                <span>
                  Vos copies sont chiffrées, consultées par l’agence seule, et supprimées {site.booking.documentsRetentionMonths}{" "}
                  mois après la restitution du véhicule, sauf litige en cours. Si un document n’est pas conforme, nous vous
                  contactons ; à défaut de régularisation, la réservation est annulée et remboursée.
                </span>
              </p>
            </Panel>
          )}

          {current === "Contrat" && priced && price && start && end && (
            <Panel
              title="Votre contrat"
              text="Relisez votre contrat de location, signez-le, puis confirmez avec le code reçu par e-mail. Il ne prend effet qu’au paiement."
            >
              <RentalContract
                renter={{
                  fullName: `${driver.firstName} ${driver.lastName.toUpperCase()}`,
                  birthDate: driver.birthDate,
                  birthPlace: driver.birthPlace,
                  address: `${driver.street}, ${driver.postalCode} ${driver.city}`,
                  email: driver.email,
                  phone: driver.phone,
                  idLabel: idType.label,
                  idNumber: papers.idNumber,
                  licenseNumber: papers.licenseNumber,
                  licenseDate: papers.licenseDate,
                }}
                vehicle={vehicle}
                start={start}
                end={end}
                days={priced.days}
                label={tariffLabel(priced)}
                location={handoverPlace}
                price={price}
              />

              <Check checked={signing.read} onChange={(v) => setSigning({ ...signing, read: v })} error={errors.read}>
                J’ai lu le contrat et les conditions de location, et je les accepte.
              </Check>

              <div className="mt-8">
                <p className="mb-2 text-sm font-semibold">
                  Signature de {driver.firstName} {driver.lastName}
                </p>
                <SignaturePad value={signing.signature} onChange={(v) => setSigning((s) => ({ ...s, signature: v }))} error={errors.signature} />
              </div>

              <div className="mt-8 rounded-sm border border-line-strong bg-surface p-5 sm:p-6">
                <p className="text-sm font-semibold">Confirmation de signature</p>
                <p className="mt-1 text-sm/relaxed text-muted">
                  {signing.codeSent ? (
                    <>
                      Code envoyé à <strong className="text-ink">{maskEmail(driver.email)}</strong>. Il est valable 10 minutes.
                    </>
                  ) : (
                    <>Un code à 6 chiffres vous est envoyé par e-mail : il atteste que c’est bien vous qui signez.</>
                  )}
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
                  {signing.codeSent ? (
                    <Field label="Code reçu" error={errors.code} className="sm:w-48">
                      <input
                        className="field text-center font-mono tracking-[0.4em]"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={signing.code}
                        onChange={(e) => setSigning({ ...signing, code: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                      />
                    </Field>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setSigning({ ...signing, codeSent: true, code: "" })}
                    className={cn(
                      "rounded-sm border border-line-strong px-5 py-3 text-sm font-semibold hover:border-ink",
                      signing.codeSent && "sm:mt-7",
                    )}
                  >
                    {signing.codeSent ? "Renvoyer le code" : "Recevoir le code"}
                  </button>
                </div>
                {!signing.codeSent && errors.code ? <p data-error className="mt-2 text-sm text-accent">{errors.code}</p> : null}
              </div>

              <p className="mt-6 border border-dashed border-line-strong px-4 py-3 text-xs text-muted">
                Maquette : aucun e-mail n’est envoyé, tout code à 6 chiffres est accepté.
              </p>
            </Panel>
          )}

          {current === "Paiement" && price && (
            <Panel title="Paiement" text="Réglez votre location en toute sécurité. Votre carte n’est débitée que du montant de la location.">
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
                <p className="mt-2 text-sm/relaxed text-muted">
                  Cette carte est enregistrée pour la caution. Une <strong className="text-ink">empreinte bancaire</strong> de{" "}
                  {euros(price.deposit)} y est réalisée juste avant la remise des clés : le montant est bloqué,{" "}
                  <strong className="text-ink">jamais débité</strong> si le véhicule revient en bon état, puis levé par
                  l’agence après l’état des lieux de retour.
                </p>
                <p className="mt-3 text-xs/relaxed text-muted">
                  La carte doit être au nom du conducteur, et son plafond couvrir {euros(price.deposit)}. Les cartes
                  prépayées et à autorisation systématique ne sont pas acceptées pour la caution.
                </p>
                <Check checked={accepted.deposit} onChange={(v) => setAccepted({ ...accepted, deposit: v })} error={errors.deposit}>
                  J’autorise {site.name} à réaliser une empreinte de {euros(price.deposit)} sur cette carte avant la remise des
                  clés, et à prélever, sur justificatif, les sommes dues au titre du contrat.
                </Check>
              </div>

              <Check checked={accepted.cgv} onChange={(v) => setAccepted({ ...accepted, cgv: v })} error={errors.cgv}>
                J’ai lu et j’accepte les{" "}
                <Link href="/cgv" target="_blank" className="underline underline-offset-4">
                  conditions générales de vente
                </Link>
                , les{" "}
                <Link href="/conditions-de-location" target="_blank" className="underline underline-offset-4">
                  conditions de location
                </Link>{" "}
                et la{" "}
                <Link href="/confidentialite" target="_blank" className="underline underline-offset-4">
                  politique de confidentialité
                </Link>
                . Je reconnais que le droit de rétractation ne s’applique pas à une location à date déterminée.
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
                "hidden items-center justify-center gap-2 rounded-sm px-7 py-3.5 font-semibold text-white transition disabled:opacity-60 lg:inline-flex",
                step === STEPS.length - 1 ? "bg-accent hover:bg-accent-hover" : "bg-ink hover:bg-accent",
              )}
            >
              {cta}
            </button>
          </div>
        </form>

        <aside className="lg:sticky lg:top-[96px]">
          <Summary vehicle={vehicle} label={priced ? tariffLabel(priced) : undefined} start={start} end={end} location={handoverPlace} price={price} />
        </aside>
      </div>

      {/* Mobile : le total et l'action restent sous le pouce, le récapitulatif étant en bas de page. */}
      <div className="sticky bottom-0 z-40 -mx-4 mt-8 flex items-center justify-between gap-4 border-t border-ink-line bg-ink px-4 py-3 text-paper sm:-mx-8 sm:px-8 lg:hidden">
        <div className="min-w-0">
          <p className="eyebrow text-muted-on-ink">
            Étape {step + 1}/{STEPS.length}
          </p>
          <p className="truncate font-display text-xl leading-tight">{price ? euros(price.total) : "Vos dates"}</p>
        </div>
        <button
          type="submit"
          form="reservation"
          disabled={status === "paying"}
          className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
        >
          {cta}
        </button>
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
      {error ? <span data-error className="mt-1.5 block text-sm text-accent">{error}</span> : null}
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
      {error ? <p data-error className="mt-1.5 pl-7 text-sm text-accent">{error}</p> : null}
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
              + caution {euros(price.deposit)}, par empreinte bancaire non débitée
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

  const next = [
    ["Vérification de vos pièces", "Sous 24 h. Nous vous écrivons seulement s’il manque quelque chose."],
    ["Empreinte de caution", `${euros(deposit)} bloqués sur votre carte juste avant le départ, sans débit.`],
    ["Remise des clés", "Munissez-vous des originaux de vos pièces et de votre carte. État des lieux signé ensemble."],
    ["Restitution", "Après l’état des lieux de retour, l’agence lève votre empreinte."],
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8 lg:py-24">
      <p className="eyebrow rise text-accent">Réservation confirmée</p>
      <h2 className="rise mt-3 font-display text-4xl/[1.05] sm:text-5xl/[1.05]">
        Bonne route, <span className="text-accent italic">{driver.firstName}.</span>
      </h2>
      <p className="rise mt-5 max-w-xl text-base/relaxed text-muted">
        Votre contrat signé et votre facture viennent de partir à <strong className="text-ink">{driver.email}</strong>.
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

      <h3 className="mt-14 font-display text-xl">La suite</h3>
      <ol className="mt-6 space-y-5 border-l border-line-strong pl-6">
        {next.map(([title, text], i) => (
          <li key={title} className="relative">
            <span className="absolute top-0 -left-[37px] flex h-6 w-6 items-center justify-center rounded-full bg-ink font-mono text-[0.65rem] text-white">
              {i + 1}
            </span>
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm/relaxed text-muted">{text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12 flex flex-wrap gap-3">
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
