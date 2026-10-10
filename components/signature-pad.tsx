"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * Zone de signature manuscrite, au doigt, au stylet ou à la souris.
 *
 * La signature est remontée en PNG (data URL) à chaque trait levé. Un tracé
 * trop court (un point, un clic) ne compte pas comme une signature.
 */

const MIN_INK = 80; // longueur de tracé minimale, en pixels CSS

export function SignaturePad({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const ink = useRef(0);
  // Signature déjà tracée lors d'un premier passage sur l'étape : on la redessine au montage.
  const initial = useRef(value);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = el.getBoundingClientRect();
    el.width = width * ratio;
    el.height = height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0a0a0a";
    if (initial.current) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, width, height);
      img.src = initial.current;
      ink.current = MIN_INK;
    }
  }, []);

  const point = (e: PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  function down(e: PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    last.current = point(e);
  }

  function move(e: PointerEvent<HTMLCanvasElement>) {
    const ctx = canvas.current?.getContext("2d");
    if (!last.current || !ctx) return;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ink.current += Math.hypot(p.x - last.current.x, p.y - last.current.y);
    last.current = p;
  }

  function up() {
    if (!last.current) return;
    last.current = null;
    onChange(ink.current >= MIN_INK && canvas.current ? canvas.current.toDataURL("image/png") : "");
  }

  function clear() {
    const el = canvas.current;
    el?.getContext("2d")?.clearRect(0, 0, el.width, el.height);
    ink.current = 0;
    onChange("");
  }

  return (
    <div>
      <div className={cn("relative rounded-sm border bg-surface", error ? "border-accent" : "border-line-strong")}>
        <canvas
          ref={canvas}
          aria-label="Zone de signature"
          className="block h-44 w-full cursor-crosshair touch-none"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
        {!value ? (
          <p aria-hidden className="pointer-events-none absolute inset-x-0 bottom-10 text-center text-sm text-muted">
            Signez ici
          </p>
        ) : null}
        <span aria-hidden className="pointer-events-none absolute inset-x-6 bottom-8 h-px bg-line-strong" />
      </div>
      <div className="mt-2 flex items-center justify-between gap-4 text-sm">
        {error ? <p data-error className="text-accent">{error}</p> : <p className="text-xs text-muted">Au doigt, au stylet ou à la souris.</p>}
        <button type="button" onClick={clear} className="shrink-0 font-semibold underline-offset-4 hover:underline">
          Effacer
        </button>
      </div>
    </div>
  );
}
