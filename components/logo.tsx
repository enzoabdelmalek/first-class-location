import { cn } from "@/lib/utils";

/**
 * Logotype provisoire : « First » en serif italique, « CLASS » en capitales
 * espacées. À remplacer par le logo du client s'il en a un.
 */
export function Logo({ className, subtitle = true }: { className?: string; subtitle?: boolean }) {
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className="flex items-baseline gap-1.5">
        <span className="font-display text-[1.7rem] italic">First</span>
        <span className="text-[0.8rem] font-semibold tracking-[0.32em]">CLASS</span>
      </span>
      {subtitle ? (
        <span className="mt-1 text-[0.58rem] font-medium tracking-[0.28em] uppercase opacity-60">
          Location de véhicules
        </span>
      ) : null}
    </span>
  );
}
