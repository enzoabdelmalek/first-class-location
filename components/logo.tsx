import { cn } from "@/lib/utils";

/**
 * Logotype provisoire : « FIRST CLASS » en chasse étendue, séparé par un
 * trait rouge incliné - un clin d'œil aux bandes des sportives. À remplacer
 * par le logo du client s'il en a un.
 */
export function Logo({ className, subtitle = true }: { className?: string; subtitle?: boolean }) {
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className="flex items-center gap-2 text-[1.05rem] tracking-[0.18em] [font-stretch:125%]">
        <span className="font-semibold">FIRST</span>
        <span aria-hidden className="h-3.5 w-[3px] skew-x-[-20deg] bg-accent" />
        <span className="font-light">CLASS</span>
      </span>
      {subtitle ? (
        <span className="mt-1.5 text-[0.55rem] font-medium tracking-[0.34em] uppercase opacity-55 [font-stretch:110%]">
          Luxe · Paris
        </span>
      ) : null}
    </span>
  );
}
