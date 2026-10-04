import Image from "next/image";
import Link from "next/link";
import { CarSilhouette } from "@/components/car-silhouette";
import { ArrowIcon } from "@/components/icons";
import type { Vehicle } from "@/lib/fleet";
import { cn, euros } from "@/lib/utils";

/**
 * Visuel du véhicule. Photo si `vehicle.image` est renseigné, sinon la
 * silhouette au trait, éclairée par un halo rouge - à remplacer par les
 * photos du client dès qu'il les envoie.
 */
export function VehicleVisual({
  vehicle,
  tone = "dark",
  animated = false,
  priority = false,
  className,
}: {
  vehicle: Vehicle;
  tone?: "dark" | "light";
  animated?: boolean;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-[3/1] overflow-hidden", className)}>
      {vehicle.image ? (
        <Image
          src={vehicle.image}
          alt={`${vehicle.brand} ${vehicle.model} ${vehicle.finish}`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      ) : (
        <>
          <div
            aria-hidden
            className={cn(
              "absolute inset-x-0 bottom-0 h-2/3",
              tone === "dark"
                ? "bg-[radial-gradient(ellipse_60%_55%_at_50%_100%,rgb(220_10_20/0.28),transparent_70%)]"
                : "bg-[radial-gradient(ellipse_60%_55%_at_50%_100%,rgb(10_10_10/0.08),transparent_70%)]",
            )}
          />
          <CarSilhouette
            body={vehicle.body}
            animated={animated}
            strokeWidth={1.1}
            className={cn(
              "absolute inset-x-[8%] bottom-[6%] w-[84%]",
              tone === "dark" ? "text-[#b8bcc2]" : "text-ink",
            )}
          />
        </>
      )}
    </div>
  );
}

/** Chiffres clés : puissance, accélération… */
export function VehicleHeadline({ vehicle, tone = "dark" }: { vehicle: Vehicle; tone?: "dark" | "light" }) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 border-t sm:grid-cols-4",
        tone === "dark" ? "border-ink-line" : "border-line",
      )}
    >
      {vehicle.headline.map((h, i) => (
        <div
          key={h.label}
          className={cn(
            "py-6 pr-4",
            i > 0 && "sm:border-l sm:pl-6",
            i % 2 === 1 && "border-l pl-6",
            i >= 2 && "border-t sm:border-t-0",
            tone === "dark" ? "border-ink-line" : "border-line",
          )}
        >
          <dt className="sr-only">{h.label}</dt>
          <dd>
            <span className="block font-display text-3xl sm:text-4xl">{h.value}</span>
            <span className={cn("mt-1 block text-sm", tone === "dark" ? "text-muted-on-ink" : "text-muted")}>{h.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Grille des forfaits, regroupés Semaine / Week-end. */
export function PackageGrid({ vehicle }: { vehicle: Vehicle }) {
  const periods = ["Semaine", "Week-end"] as const;
  return (
    <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:gap-6">
      {periods.map((period) => {
        const packs = vehicle.packages.filter((p) => p.period === period);
        return (
          <div key={period}>
            <p className="eyebrow flex items-center gap-3 text-accent-light">
              <span className="h-px w-8 bg-accent" aria-hidden />
              {period}
            </p>
            <ul className={cn("mt-5 grid gap-px overflow-hidden border border-ink-line bg-ink-line", packs.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
              {packs.map((p) => (
                <li key={p.id} className="group flex flex-col bg-ink p-6 transition hover:bg-ink-soft">
                  <h3 className="font-display text-xl">{p.label}</h3>
                  <p className="mt-2 text-sm/relaxed text-muted-on-ink">{p.rule}</p>
                  <p className="mt-8 font-display text-4xl">{euros(p.price)}</p>
                  <Link
                    href="/reserver"
                    className="mt-6 inline-flex items-center justify-between gap-2 border-t border-ink-line pt-4 text-sm font-semibold transition group-hover:text-accent-light"
                    aria-label={`Réserver le forfait ${p.label} ${p.period.toLowerCase()}`}
                  >
                    Réserver
                    <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
