"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CheckIcon, LockIcon } from "@/components/icons";
import type { Vehicle } from "@/lib/fleet";
import { site } from "@/lib/site";
import { cn, euros } from "@/lib/utils";

/**
 * Activation de l'empreinte de caution par le locataire, sur son téléphone,
 * devant le chauffeur.
 *
 * ⚠️ MAQUETTE : en production, Stripe PaymentIntent `capture_method: "manual"`
 * (avec 3-D Secure) ; le dashboard voit l'empreinte passer « active » et
 * l'agence la lève à la récupération, ou n'en prélève que le montant justifié.
 */
export function DepositActivation({ code, vehicle }: { code: string; vehicle: Vehicle }) {
  const deposit = vehicle.deposit;
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvc: "" });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "done">("idle");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!card.name.trim() || card.number.replace(/\s/g, "").length < 15 || !/^\d{2}\/\d{2}$/.test(card.expiry) || !/^\d{3,4}$/.test(card.cvc))
      return setError("Vérifiez les informations de la carte.");
    if (!agreed) return setError("Cochez la case pour activer la caution.");
    setError("");
    setStatus("pending");
    setTimeout(() => setStatus("done"), 1400);
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-xl px-4 py-14 sm:px-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-6 font-display text-3xl">Caution active.</h2>
        <p className="mt-4 text-base/relaxed text-muted">
          {euros(deposit)} sont bloqués sur votre carte, sans débit. Montrez cet écran au chauffeur : il vous remet les
          clés. Nous levons l’empreinte à la récupération du véhicule, après l’état des lieux de retour.
        </p>
        <p className="mt-8 font-mono text-sm tracking-[0.2em] text-accent">{code}</p>
      </div>
    );
  }

  const set = (k: keyof typeof card, v: string) => setCard((c) => ({ ...c, [k]: v }));

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto max-w-xl px-4 py-10 sm:px-8">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="eyebrow text-muted">Réservation</p>
          <p className="mt-1 font-mono tracking-[0.15em]">{code}</p>
          <p className="mt-1 text-sm text-muted">
            {vehicle.brand} {vehicle.model}
          </p>
        </div>
        <div className="text-right">
          <p className="eyebrow text-muted">Caution</p>
          <p className="mt-1 font-display text-3xl leading-none">{euros(deposit)}</p>
        </div>
      </div>

      <p className="mt-6 text-sm/relaxed text-muted">
        Le montant est <strong className="text-ink">bloqué, jamais débité</strong> si le véhicule revient en bon état.
        Utilisez une carte à votre nom dont le plafond couvre {euros(deposit)}.
      </p>

      <div className="mt-6 grid gap-4 rounded-sm border border-line-strong bg-surface p-5 sm:grid-cols-[1fr_110px_90px]">
        <label className="block sm:col-span-3">
          <span className="mb-1.5 block text-sm font-medium">Titulaire de la carte</span>
          <input className="field" autoComplete="cc-name" value={card.name} onChange={(e) => set("name", e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Numéro de carte</span>
          <input
            className="field font-mono"
            inputMode="numeric"
            autoComplete="cc-number"
            value={card.number}
            onChange={(e) => set("number", e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})(?=.)/g, "$1 "))}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Expiration</span>
          <input
            className="field font-mono"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/AA"
            value={card.expiry}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(0, 4);
              set("expiry", d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
            }}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">CVC</span>
          <input className="field font-mono" inputMode="numeric" autoComplete="cc-csc" value={card.cvc} onChange={(e) => set("cvc", e.target.value.replace(/\D/g, "").slice(0, 4))} />
        </label>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm/relaxed">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#dc0a14]" />
        <span>
          J’autorise {site.name} à bloquer {euros(deposit)} sur cette carte pendant la location, et à n’en prélever, sur
          justificatif, que les sommes dues au titre des{" "}
          <Link href="/conditions-de-location" target="_blank" className="underline underline-offset-4">
            conditions de location
          </Link>
          .
        </span>
      </label>

      {error ? <p className="mt-4 text-sm text-accent">{error}</p> : null}

      <button
        type="submit"
        disabled={status === "pending"}
        className={cn(
          "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-accent px-7 py-4 font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60",
        )}
      >
        <LockIcon className="h-4 w-4" />
        {status === "pending" ? "Activation…" : `Activer ma caution · ${euros(deposit)}`}
      </button>

      <p className="mt-6 border border-dashed border-line-strong px-4 py-3 text-xs text-muted">
        Maquette : aucune empreinte n’est réalisée.
      </p>
    </form>
  );
}
