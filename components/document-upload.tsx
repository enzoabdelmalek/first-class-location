"use client";

import Image from "next/image";
import { useId, useRef, useState, type DragEvent } from "react";
import { DocIcon, UploadIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Dépôt d'une photo ou d'un scan de pièce justificative.
 *
 * ⚠️ MAQUETTE : le fichier reste dans le navigateur. En production, il part
 * vers une route serveur qui le range dans un espace de stockage PRIVÉ
 * (jamais via la clé publique), lisible par l'agence seule, par lien signé
 * à durée courte.
 */

export type Upload = { file: File; url: string };

const MAX_BYTES = 10 * 1024 * 1024;
const EXTENSIONS = /\.(jpe?g|png|webp|heic|heif|pdf)$/i;
/** Formats que le navigateur sait afficher en aperçu. */
const PREVIEWABLE = ["image/jpeg", "image/png", "image/webp"];

const fileSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} Ko` : `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`;

export function DocumentUpload({
  label,
  hint,
  value,
  onChange,
  error,
}: {
  label: string;
  hint?: string;
  value?: Upload;
  onChange: (value?: Upload) => void;
  error?: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [rejected, setRejected] = useState("");

  function pick(file?: File) {
    if (!file) return;
    if (!EXTENSIONS.test(file.name)) return setRejected("Formats acceptés : JPG, PNG, HEIC ou PDF.");
    if (file.size > MAX_BYTES) return setRejected("Fichier trop lourd : 10 Mo maximum.");
    setRejected("");
    if (value) URL.revokeObjectURL(value.url);
    onChange({ file, url: URL.createObjectURL(file) });
  }

  function remove() {
    if (value) URL.revokeObjectURL(value.url);
    if (input.current) input.current.value = "";
    onChange(undefined);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDrag(false);
    pick(e.dataTransfer.files[0]);
  }

  const message = rejected || error;

  return (
    <div>
      <p id={`${id}-label`} className="mb-1.5 text-sm font-medium">
        {label}
      </p>
      {value ? (
        <div className="flex items-center gap-4 rounded-sm border border-ink bg-surface p-3">
          <div className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-paper-alt">
            {PREVIEWABLE.includes(value.file.type) ? (
              <Image src={value.url} alt={`Aperçu : ${label}`} fill unoptimized className="object-cover" />
            ) : (
              <DocIcon className="h-7 w-7 text-muted" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{value.file.name}</p>
            <p className="text-xs text-muted">{fileSize(value.file.size)}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1 text-sm sm:flex-row sm:gap-4">
            <button type="button" onClick={() => input.current?.click()} className="font-semibold underline-offset-4 hover:underline">
              Remplacer
            </button>
            <button type="button" onClick={remove} className="text-muted underline-offset-4 hover:text-accent hover:underline">
              Retirer
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          aria-labelledby={`${id}-label`}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-sm border border-dashed px-4 py-7 text-center transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
            drag ? "border-accent bg-accent/5" : message ? "border-accent" : "border-line-strong hover:border-ink",
          )}
        >
          <UploadIcon className="h-6 w-6 text-accent" />
          <span className="text-sm font-semibold">Prendre une photo ou choisir un fichier</span>
          <span className="text-xs text-muted">JPG, PNG, HEIC ou PDF · 10 Mo max.</span>
        </button>
      )}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf,.heic,.heif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {message ? <p data-error className="mt-1.5 text-sm text-accent">{message}</p> : null}
    </div>
  );
}
