import type { Metadata, Viewport } from "next";
import { Archivo, Geist_Mono } from "next/font/google";
import { CookieConsent } from "@/components/cookie-consent";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";
import "./globals.css";

/**
 * Une seule famille pour tout le site : Archivo, variable en graisse ET en
 * chasse. Les titres l'emploient étendue (125 %), le texte courant en
 * largeur normale - un seul fichier pour les deux.
 */
const archivo = Archivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} - Location de voitures de luxe à ${site.city}`,
    template: `%s - ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: site.name,
    title: `${site.name} - Location de voitures de luxe à ${site.city}`,
    description: site.description,
    url: site.url,
  },
  // Maquette : ne pas indexer tant que le client n'a pas validé.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0e0f11",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${archivo.variable} ${mono.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-sm focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:text-white"
        >
          Aller au contenu
        </a>
        <SiteHeader />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <CookieConsent />
      </body>
    </html>
  );
}
