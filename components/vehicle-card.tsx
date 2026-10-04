import Image from "next/image";
import Link from "next/link";
import { CarSilhouette } from "@/components/car-silhouette";
import { ArrowIcon, BagIcon, FuelIcon, GearIcon, SeatIcon } from "@/components/icons";
import type { Vehicle } from "@/lib/fleet";
import { euros } from "@/lib/utils";

export function VehicleVisual({ vehicle, priority = false }: { vehicle: Vehicle; priority?: boolean }) {
  return (
    <div className="blueprint relative aspect-[16/10] overflow-hidden rounded-xl bg-paper-alt">
      {vehicle.image ? (
        <Image
          src={vehicle.image}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      ) : (
        <CarSilhouette body={vehicle.body} className="absolute inset-x-[8%] bottom-[12%] w-[84%] text-ink" />
      )}
    </div>
  );
}

export function VehicleSpecs({ vehicle }: { vehicle: Vehicle }) {
  const specs = [
    { icon: SeatIcon, label: `${vehicle.seats} places` },
    { icon: GearIcon, label: vehicle.gearbox === "Automatique" ? "Auto" : "Manuelle" },
    { icon: FuelIcon, label: vehicle.fuel },
    { icon: BagIcon, label: `${vehicle.bags} bagages` },
  ];
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted">
      {specs.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-champagne-ink" />
          {label}
        </li>
      ))}
    </ul>
  );
}

export function VehicleCard({ vehicle, priority = false }: { vehicle: Vehicle; priority?: boolean }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-line bg-surface p-3 shadow-card transition hover:-translate-y-0.5">
      <div className="relative">
        <VehicleVisual vehicle={vehicle} priority={priority} />
        {vehicle.highlight ? (
          <span className="absolute top-3 left-3 rounded-full bg-ink px-3 py-1 text-[0.68rem] font-semibold tracking-wide text-champagne">
            {vehicle.highlight}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-2 pt-5 pb-2">
        <p className="eyebrow text-champagne-ink">{vehicle.category}</p>
        <h3 className="mt-2 font-display text-2xl leading-tight">
          {vehicle.brand} <span className="italic">{vehicle.model}</span>
        </h3>

        <div className="mt-5">
          <VehicleSpecs vehicle={vehicle} />
        </div>

        <div className="mt-6 flex items-end justify-between gap-3 border-t border-line pt-5">
          <p className="text-sm whitespace-nowrap text-muted">
            dès <span className="font-display text-3xl text-ink">{euros(vehicle.pricePerDay)}</span> / jour
          </p>
          <Link
            href={`/reserver?vehicule=${vehicle.slug}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition group-hover:bg-champagne group-hover:text-ink"
            aria-label={`Réserver la ${vehicle.brand} ${vehicle.model}`}
          >
            Réserver
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
