"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import { ArrowIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type Photo = { src: string; alt: string };

/**
 * Galerie de la fiche véhicule : bande défilante au doigt sur mobile,
 * grille sur grand écran. Un clic ouvre la photo en grand (dialog natif :
 * Échap ferme, flèches et balayage pour naviguer).
 */
export function VehicleGallery({ photos }: { photos: Photo[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const step = (delta: number) => setIndex((i) => (i === null ? i : (i + delta + photos.length) % photos.length));

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (index !== null && !el.open) el.showModal();
    if (index === null && el.open) el.close();
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function onTouchEnd(e: TouchEvent) {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    touchX.current = null;
  }

  const current = index === null ? null : photos[index];

  return (
    <>
      <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0">
        {photos.map((p, i) => (
          <li
            key={p.src}
            className={cn("w-[70%] shrink-0 snap-start sm:w-[40%] lg:w-auto", i === 0 && "lg:col-span-2 lg:row-span-2")}
          >
            <button
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "group relative block aspect-[3/4] h-full w-full overflow-hidden bg-ink-soft focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                // La grande vignette prend la hauteur des deux rangées voisines.
                i === 0 && "lg:aspect-auto",
              )}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes={i === 0 ? "(min-width: 1024px) 50vw, 70vw" : "(min-width: 1024px) 25vw, 70vw"}
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-4 pt-10 pb-3 text-left text-xs text-paper opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                {p.alt}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        onClose={() => setIndex(null)}
        onClick={(e) => e.target === e.currentTarget && setIndex(null)}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
        className="m-auto h-dvh max-h-none w-screen max-w-none bg-ink/95 p-0 text-paper backdrop:bg-ink/80"
        aria-label="Photo en grand"
      >
        {current ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 py-3 sm:px-8">
              <p className="font-mono text-xs tracking-[0.2em] text-muted-on-ink">
                {index! + 1} / {photos.length}
              </p>
              <button type="button" onClick={() => setIndex(null)} className="px-2 py-1 text-sm font-semibold hover:text-accent-light">
                Fermer
              </button>
            </div>
            <div className="relative min-h-0 flex-1" onClick={() => setIndex(null)}>
              <Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" />
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
              <button type="button" onClick={() => step(-1)} aria-label="Photo précédente" className="rounded-full border border-ink-line p-3 hover:border-paper">
                <ArrowIcon className="h-5 w-5 rotate-180" />
              </button>
              <p className="text-center text-sm text-muted-on-ink">{current.alt}</p>
              <button type="button" onClick={() => step(1)} aria-label="Photo suivante" className="rounded-full border border-ink-line p-3 hover:border-paper">
                <ArrowIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
