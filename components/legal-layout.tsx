import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";

/**
 * Mise en page commune aux textes légaux : sobre, en largeur de lecture,
 * sans animation - un texte légal doit rester lisible sans JavaScript.
 */
export function LegalLayout({
  eyebrow = "Informations légales",
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  const updated = new Date(site.legal.updatedOn).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} intro={intro} />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8 lg:py-24">
        <div className="space-y-12">{children}</div>
        <p className="mt-16 border-t border-line pt-6 text-sm text-muted">Dernière mise à jour : {updated}.</p>
      </div>
    </>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-ink sm:text-2xl">{title}</h2>
      <div className="mt-5 space-y-4 text-base/relaxed text-muted [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

export function LegalRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p>
      <span className="font-semibold text-ink">{label} :</span> {children}
    </p>
  );
}
