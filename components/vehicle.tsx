import Image from "next/image";
import Link from "next/link";
import { CarSilhouette } from "@/components/car-silhouette";
import { ArrowIcon } from "@/components/icons";
import type { Offer } from "@/lib/availability";
import { fromPrice, tariffLabel, type Vehicle } from "@/lib/fleet";
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
  ratio = "aspect-[3/1]",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  className,
}: {
  vehicle: Vehicle;
  tone?: "dark" | "light";
  animated?: boolean;
  priority?: boolean;
  /** Proportions du cadre : bandeau large par défaut, plus haut dans les cartes. */
  ratio?: string;
  /** Largeur affichée, pour que la photo servie ne soit pas plus lourde que nécessaire. */
  sizes?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", ratio, className)}>
      {vehicle.image ? (
        <>
          <Image
            src={vehicle.image}
            alt={`${vehicle.brand} ${vehicle.model} ${vehicle.finish}`}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover"
          />
          {/* Assombrit le haut et le bas de la photo : les libellés posés dessus restent lisibles. */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink/85 via-transparent via-40% to-ink/40" />
        </>
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
        if (!packs.length) return null;
        return (
          <div key={period}>
            <p className="eyebrow flex items-center gap-3 text-accent-light">
              <span className="h-px w-8 bg-accent" aria-hidden />
              {period}
            </p>
            <ul className={cn("mt-5 grid gap-px overflow-hidden border border-ink-line bg-ink-line", packs.length >= 3 ? "sm:grid-cols-3" : packs.length === 2 && "sm:grid-cols-2")}>
              {packs.map((p) => (
                <li key={p.id} className="group flex flex-col bg-ink p-6 transition hover:bg-ink-soft">
                  <h3 className="font-display text-xl">{p.label}</h3>
                  <p className="mt-2 text-sm/relaxed text-muted-on-ink">{p.rule}</p>
                  <p className="mt-8 font-display text-4xl">{euros(p.price)}</p>
                  <Link
                    href={`/reserver?vehicule=${vehicle.slug}`}
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

/**
 * Carte d'un véhicule, pour la grille de la flotte. Toute la carte mène à
 * la fiche. Au survol (écrans avec souris), les chiffres clés et la caution
 * remontent sur le visuel ; sur écran tactile, ils restent affichés sous le
 * nom, puisque le survol n'y existe pas.
 *
 * Avec `stay` (recherche par dates) : prix exact pour la période et lien
 * direct vers la réservation, dates remplies ; grisée si le véhicule est
 * déjà pris.
 */
export function VehicleCard({
  vehicle,
  stay,
  className,
}: {
  vehicle: Vehicle;
  stay?: { du: string; au: string; offer: Offer };
  className?: string;
}) {
  const offer = stay?.offer;
  const bookable = offer?.available && offer.rate?.kind === "price";
  const href = bookable ? `/reserver?vehicule=${vehicle.slug}&du=${stay!.du}&au=${stay!.au}` : `/vehicules/${vehicle.slug}`;

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col overflow-hidden border border-ink-line bg-ink text-paper transition hover:border-accent/70 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
        offer && !offer.available && "opacity-55 grayscale hover:opacity-80",
        className,
      )}
    >
      <div className="relative">
        <VehicleVisual vehicle={vehicle} ratio="aspect-[16/9]" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className={cn("eyebrow", vehicle.image ? "text-paper" : "text-muted-on-ink")}>{vehicle.category}</span>
          {vehicle.placeholder ? (
            <span className="rounded-sm border border-white/25 px-2 py-0.5 font-mono text-[0.6rem] tracking-[0.15em] text-muted-on-ink uppercase">
              Exemple
            </span>
          ) : null}
        </div>

        {/* Fiche express, révélée au survol. */}
        <div
          aria-hidden
          className="absolute inset-0 hidden flex-col justify-end bg-ink/90 p-5 opacity-0 backdrop-blur-sm transition duration-300 group-hover:opacity-100 [@media(hover:hover)]:flex"
        >
          <dl className="grid translate-y-3 grid-cols-2 gap-x-6 gap-y-3 transition duration-300 group-hover:translate-y-0">
            {vehicle.headline.map((h) => (
              <div key={h.label}>
                <dt className="sr-only">{h.label}</dt>
                <dd>
                  <span className="block font-display text-2xl leading-none">{h.value}</span>
                  <span className="mt-1 block text-xs text-muted-on-ink">{h.label}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 border-t border-ink-line pt-3 text-xs text-muted-on-ink">
            Caution {euros(vehicle.deposit)} · dès {vehicle.minAge} ans · {vehicle.minLicenseYears} ans de permis
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col border-t border-ink-line p-5">
        <p className="eyebrow text-accent-light">{vehicle.brand}</p>
        <h3 className="mt-2 font-display text-xl leading-tight">{vehicle.model}</h3>
        <p className="mt-1 text-sm text-muted-on-ink">{vehicle.finish}</p>
        <p className="mt-3 text-xs text-muted-on-ink [@media(hover:hover)]:hidden">
          {vehicle.headline
            .slice(0, 2)
            .map((h) => `${h.value} ${h.label}`)
            .join(" · ")}{" "}
          · caution {euros(vehicle.deposit)}
        </p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          {offer && !offer.available ? (
            <p className="text-sm text-muted-on-ink">Indisponible à ces dates</p>
          ) : offer?.rate?.kind === "price" ? (
            <p>
              <span className="block font-display text-2xl leading-none">{euros(offer.rate.price)}</span>
              <span className="mt-1 block text-xs text-muted-on-ink">
                {offer.rate.days} jour{offer.rate.days > 1 ? "s" : ""} · {tariffLabel(offer.rate)}
              </span>
            </p>
          ) : offer ? (
            <p className="text-sm text-muted-on-ink">Sur devis</p>
          ) : (
            <p>
              <span className="text-xs text-muted-on-ink">dès </span>
              <span className="font-display text-2xl">{euros(fromPrice(vehicle))}</span>
            </p>
          )}
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-2 text-sm font-semibold transition",
              bookable ? "rounded-sm bg-accent px-4 py-2.5 text-white group-hover:bg-accent-hover" : "group-hover:text-accent-light",
            )}
          >
            {bookable ? "Réserver" : "Voir la fiche"}
            <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Grille de la flotte, ou d'une partie (« autres véhicules »). */
export function FleetGrid({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((v) => (
        <li key={v.slug} className="flex">
          <VehicleCard vehicle={v} className="w-full" />
        </li>
      ))}
    </ul>
  );
}

/** Grille pour une recherche par dates : prix de la période, disponibilité. */
export function OfferGrid({ offers, du, au }: { offers: Offer[]; du: string; au: string }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {offers.map((o) => (
        <li key={o.vehicle.slug} className="flex">
          <VehicleCard vehicle={o.vehicle} stay={{ du, au, offer: o }} className="w-full" />
        </li>
      ))}
    </ul>
  );
}
