/** Bandeau de titre des pages intérieures : fond encre, prolongement de l'en-tête. */
export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="blueprint-dark relative overflow-hidden bg-ink text-paper">
      <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/80 to-ink" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-14 sm:px-8 lg:pt-24 lg:pb-20">
        <p className="eyebrow rise text-champagne">{eyebrow}</p>
        <h1 className="rise mt-4 max-w-3xl font-display text-5xl/[1.02] tracking-tight text-balance sm:text-6xl/[1.02]">
          {title}
        </h1>
        {intro ? <p className="rise mt-5 max-w-xl text-base/relaxed text-pretty text-muted-on-ink">{intro}</p> : null}
        {children}
      </div>
    </section>
  );
}
