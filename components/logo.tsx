import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo du client (« FIRST CLASS · Luxury car rental »), détouré à partir de
 * sa carte de visite : `public/brand/logo-clair.png` pour les fonds sombres,
 * `logo-sombre.png` pour les fonds clairs. À remplacer par le fichier
 * vectoriel d'origine dès que le client le fournit.
 */
const variants = {
  clair: { src: "/brand/logo-clair.png", width: 593, height: 276 },
  sombre: { src: "/brand/logo-sombre.png", width: 519, height: 222 },
} as const;

export function Logo({
  tone = "clair",
  priority = false,
  className,
}: {
  /** « clair » : logo blanc, pour fond sombre ; « sombre » : logo noir, pour fond clair. */
  tone?: keyof typeof variants;
  priority?: boolean;
  className?: string;
}) {
  const v = variants[tone];
  return (
    <Image
      src={v.src}
      alt="First Class, location de voitures de luxe"
      width={v.width}
      height={v.height}
      priority={priority}
      className={cn("h-11 w-auto", className)}
    />
  );
}
