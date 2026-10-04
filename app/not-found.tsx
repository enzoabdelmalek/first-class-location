import Link from "next/link";
import { CarSilhouette } from "@/components/car-silhouette";

export default function NotFound() {
  return (
    <section className="bg-ink text-paper">
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-8 lg:py-32">
        <CarSilhouette body="citadine" className="mx-auto w-56 text-champagne" />
        <p className="eyebrow mt-10 text-champagne">Erreur 404</p>
        <h1 className="mt-4 font-display text-5xl/[1.02] sm:text-6xl/[1.02]">
          Cette route ne mène <span className="italic">nulle part.</span>
        </h1>
        <Link href="/" className="mt-10 inline-flex rounded-full bg-champagne px-6 py-3.5 font-semibold text-ink hover:bg-paper">
          Retour à l’accueil
        </Link>
      </div>
    </section>
  );
}
