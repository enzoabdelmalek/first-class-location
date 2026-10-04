import Link from "next/link";
import { CarSilhouette } from "@/components/car-silhouette";

export default function NotFound() {
  return (
    <section className="bg-ink text-paper">
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-8 lg:py-32">
        <CarSilhouette body="citadine" className="mx-auto w-56 text-accent-light" />
        <p className="eyebrow mt-10 text-accent-light">Erreur 404</p>
        <h1 className="mt-4 font-display text-4xl/[1.05] sm:text-5xl/[1.05]">
          Cette route ne mène <span className="italic">nulle part.</span>
        </h1>
        <Link href="/" className="mt-10 inline-flex rounded-sm bg-accent px-6 py-3.5 font-semibold text-white hover:bg-white hover:text-ink">
          Retour à l’accueil
        </Link>
      </div>
    </section>
  );
}
