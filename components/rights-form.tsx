"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/lib/site";

const rights = ["Accès", "Rectification", "Effacement", "Limitation", "Opposition", "Portabilité", "Retrait du consentement"];

/**
 * Formulaire d'exercice des droits.
 * ⚠️ MAQUETTE : pas encore relié à l'envoi d'e-mail. En production, la
 * demande partira vers l'adresse de contact (Resend), comme sur les autres sites.
 */
export function RightsForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-md bg-ink p-7 text-paper">
        <p className="eyebrow text-accent-light">Demande envoyée</p>
        <p className="mt-3 font-display text-2xl">Nous vous répondons sous un mois.</p>
        <p className="mt-3 text-sm/relaxed text-muted-on-ink">
          Un accusé de réception vous a été adressé par e-mail. Pour toute question : {site.contact.email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-md border border-line bg-surface p-6 sm:grid-cols-2 sm:p-8">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Nom et prénom</span>
        <input required className="field" autoComplete="name" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">E-mail</span>
        <input required type="email" className="field" autoComplete="email" />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-ink">Droit que vous souhaitez exercer</span>
        <select required className="field" defaultValue="">
          <option value="" disabled>
            Choisir…
          </option>
          {rights.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-ink">Votre demande</span>
        <textarea required rows={4} className="field resize-y" placeholder="Précisez, si possible, le numéro de réservation concerné." />
      </label>
      <button
        type="submit"
        className="rounded-sm bg-ink px-6 py-3.5 font-semibold text-paper transition hover:bg-accent hover:text-white sm:col-span-2 sm:justify-self-start"
      >
        Envoyer ma demande
      </button>
    </form>
  );
}
