import { cn } from "@/lib/utils";

/**
 * Champ date avec un indicatif « JJ/MM/AAAA » quand il est vide.
 *
 * Safari iOS affiche un <input type="date"> vide sans aucun texte et ignore
 * `placeholder` ; les navigateurs de bureau affichent leur propre gabarit,
 * parfois en anglais. Tant que le champ est vide et sans focus, on masque
 * le texte natif et on pose le nôtre par-dessus ; au focus, le sélecteur
 * natif reprend la main.
 */
export function DateInput({
  value,
  onChange,
  placeholder = "JJ/MM/AAAA",
  className,
  placeholderClassName,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  placeholderClassName?: string;
}) {
  const empty = !value;
  return (
    <span className="relative block">
      <input
        {...props}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("peer", className, empty && "[&:not(:focus)]:!text-transparent")}
      />
      {empty ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 flex items-center text-[#9a9a9a] peer-focus:hidden",
            placeholderClassName,
          )}
        >
          {placeholder}
        </span>
      ) : null}
    </span>
  );
}
