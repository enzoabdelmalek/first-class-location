import type { Body } from "@/lib/fleet";
import { cn } from "@/lib/utils";

/**
 * Silhouettes de profil, tracées au trait.
 *
 * Elles remplacent les photos tant que le client n'a pas fourni les siennes,
 * et donnent à la maquette une écriture « plan technique » cohérente.
 * Toutes partagent le même viewBox et la même ligne de sol (y = 108).
 */
const shapes: Record<Body, { body: string; windows: string[]; wheels: [number, number]; r: number; extra?: string }> = {
  citadine: {
    body: "M40 108 L70 108 A32 32 0 0 1 134 108 L262 108 A32 32 0 0 1 326 108 L352 108 Q362 108 362 98 L360 72 Q356 50 338 44 L300 36 Q270 32 222 32 L190 32 Q160 34 126 62 L62 72 Q40 76 38 92 L38 102 Q38 108 40 108 Z",
    windows: [
      "M138 62 L168 40 Q174 37 184 37 L218 37 L218 62 Z",
      "M228 37 L292 40 Q326 44 338 62 L228 62 Z",
    ],
    wheels: [102, 294],
    r: 24,
  },
  compacte: {
    body: "M30 108 L64 108 A33 33 0 0 1 130 108 L270 108 A33 33 0 0 1 336 108 L364 108 Q374 108 374 98 L372 74 Q368 52 348 46 L306 36 Q272 30 220 30 L184 30 Q152 32 118 62 L52 72 Q30 76 28 92 L28 102 Q28 108 30 108 Z",
    windows: [
      "M130 62 L162 39 Q170 35 182 35 L216 35 L216 62 Z",
      "M226 35 L298 39 Q334 44 348 62 L226 62 Z",
    ],
    wheels: [97, 303],
    r: 25,
  },
  berline: {
    body: "M30 108 L62 108 A33 33 0 0 1 128 108 L272 108 A33 33 0 0 1 338 108 L376 108 Q386 106 386 96 L384 84 Q380 74 362 72 L312 66 Q282 40 248 36 L176 36 Q148 38 116 66 L50 74 Q26 78 24 92 L24 102 Q24 108 30 108 Z",
    windows: [
      "M130 66 L160 44 Q168 40 180 40 L212 40 L212 66 Z",
      "M222 40 L246 40 Q270 44 296 66 L222 66 Z",
    ],
    wheels: [95, 305],
    r: 25,
  },
  suv: {
    body: "M26 108 L58 108 A36 36 0 0 1 130 108 L270 108 A36 36 0 0 1 342 108 L374 108 Q384 108 384 96 L382 70 Q380 58 366 56 L330 52 L300 26 Q294 20 282 20 L150 20 Q136 20 126 30 L100 54 L46 62 Q28 66 26 82 Z",
    windows: [
      "M112 54 L136 32 Q140 28 150 28 L206 28 L206 54 Z",
      "M216 28 L280 28 Q288 28 294 34 L318 54 L216 54 Z",
    ],
    wheels: [94, 306],
    r: 26,
  },
  utilitaire: {
    body: "M26 108 L56 108 A34 34 0 0 1 124 108 L276 108 A34 34 0 0 1 344 108 L372 108 Q382 108 382 98 L382 26 Q382 14 370 14 L122 14 Q104 14 94 26 L64 60 L40 66 Q26 70 26 84 Z",
    windows: ["M76 60 L100 32 Q106 26 116 26 L140 26 L140 60 Z", "M156 26 L226 26 L226 54 L156 54 Z"],
    wheels: [90, 310],
    r: 25,
    extra: "M150 20 L150 100 M236 20 L236 100",
  },
};

export function CarSilhouette({
  body,
  className,
  animated = false,
  strokeWidth = 1.6,
}: {
  body: Body;
  className?: string;
  animated?: boolean;
  strokeWidth?: number;
}) {
  const s = shapes[body];
  return (
    <svg
      viewBox="0 0 410 140"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(animated && "draw", className)}
      aria-hidden
    >
      <path d={s.body} />
      {s.windows.map((d) => (
        <path key={d} d={d} opacity={0.7} />
      ))}
      {s.extra ? <path d={s.extra} opacity={0.5} /> : null}
      {s.wheels.map((x) => (
        <g key={x}>
          <circle cx={x} cy={108} r={s.r} />
          <circle cx={x} cy={108} r={s.r * 0.38} opacity={0.6} />
        </g>
      ))}
      <path d="M8 135 L402 135" opacity={0.35} />
    </svg>
  );
}
