import Link from "next/link";
import { CookieSettingsButton } from "@/components/cookie-consent";
import { Logo } from "@/components/logo";
import { site } from "@/lib/site";

const legalLinks = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgv", label: "Conditions générales de vente" },
  { href: "/conditions-de-location", label: "Conditions de location" },
  { href: "/confidentialite", label: "Politique de confidentialité" },
  { href: "/rgpd", label: "Vos droits (RGPD)" },
  { href: "/cookies", label: "Politique cookies" },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-5">
          <Logo className="h-20" />
          <p className="max-w-xs text-sm/relaxed text-muted-on-ink">
            Location de voitures de luxe et sportives à {site.city}, livrées partout en {site.area}.
          </p>
        </div>

        <div>
          <p className="eyebrow text-accent-light">Contact</p>
          <address className="mt-4 space-y-1 text-sm/relaxed not-italic text-muted-on-ink">
            <p>
              {site.city} · {site.area}
            </p>
            <p className="pt-3">
              <a href={`tel:${site.contact.phone}`} className="inline-block py-1 text-paper hover:text-accent-light">
                {site.contact.phoneDisplay}
              </a>
            </p>
            <p>
              <a href={`mailto:${site.contact.email}`} className="inline-block py-1 text-paper hover:text-accent-light">
                {site.contact.email}
              </a>
            </p>
            <p className="flex flex-wrap gap-x-4 gap-y-1 pt-3">
              {site.socials.map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noreferrer noopener" className="inline-block py-1 text-paper hover:text-accent-light">
                  {s.label}
                </a>
              ))}
            </p>
          </address>
        </div>

        <div>
          <p className="eyebrow text-accent-light">Horaires</p>
          <dl className="mt-4 space-y-2 text-sm text-muted-on-ink">
            {site.hours.map((h) => (
              <div key={h.days} className="flex justify-between gap-4 border-b border-ink-line pb-2">
                <dt>{h.days}</dt>
                <dd className="text-paper">{h.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <p className="eyebrow text-accent-light">Informations</p>
          <ul className="mt-3 space-y-0.5 text-sm">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-block py-1 text-muted-on-ink hover:text-paper">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <CookieSettingsButton className="inline-block py-1 text-muted-on-ink hover:text-paper">
                Gérer mes cookies
              </CookieSettingsButton>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-on-ink sm:flex-row sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} {site.legal.tradeName} - {site.legal.ownerName}, EI · SIRET {site.legal.siret}
          </p>
          {/* Signature de l'agence. Lien suivi volontairement : c'est ce qui en
              fait un vrai signal pour les moteurs, et donc la contrepartie SEO
              d'un site livré. */}
          <p>
            Powered &amp; Designed by{" "}
            <a
              href="https://www.vibewebagency.fr"
              target="_blank"
              rel="noopener"
              className="inline-block py-1 underline decoration-1 underline-offset-4 transition-colors hover:text-paper"
            >
              Vibe Web Agency
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
