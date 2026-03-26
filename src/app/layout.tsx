import type { Metadata } from "next";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { ClientConfig } from "../../config/client.config";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSettings();
  return {
    metadataBase: new URL(config.seo.siteUrl),
    title: {
      default: config.seo.defaultTitle,
      template: config.seo.titleTemplate,
    },
    description: config.seo.description,
    keywords: config.seo.keywords,
    openGraph: {
      type: "website",
      locale: config.seo.locale,
      url: config.seo.siteUrl,
      siteName: config.officeName,
      title: config.seo.defaultTitle,
      description: config.seo.description,
      images: [{ url: config.ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: config.seo.defaultTitle,
      description: config.seo.description,
      images: [config.ogImage],
    },
    robots: { index: true, follow: true },
  };
}

// Inject theme CSS variables from config ──────────────────────────────
function buildThemeVars(theme: ClientConfig["theme"]): string {
  return [
    `--primary:${theme.primaryColor}`,
    `--primary-light:${theme.primaryLight}`,
    `--secondary:${theme.secondaryColor}`,
    `--secondary-light:${theme.secondaryLight}`,
    `--bg:${theme.bgColor}`,
    `--surface:${theme.surfaceColor}`,
    `--text-primary:${theme.textPrimary}`,
    `--text-secondary:${theme.textSecondary}`,
    `--border:${theme.borderColor}`,
    `--radius:${theme.borderRadius}`,
    `--font-heading:'${theme.fontHeading}',serif`,
    `--font-body:'${theme.fontBody}',sans-serif`,
  ].join(";");
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getSettings();
  const themeVars = buildThemeVars(config.theme);

  return (
    <html lang="ar" dir="rtl" style={{ cssText: themeVars } as React.CSSProperties}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href={`https://fonts.googleapis.com/css2?family=${config.theme.fontHeading}:wght@400;700&family=${config.theme.fontBody}:wght@300;400;500;700;800&display=swap`}
          rel="stylesheet"
        />
        <link rel="icon" href={config.favicon} />
        {/* JSON-LD: LegalService */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LegalService",
              name: config.officeName,
              description: config.seo.description,
              url: config.seo.siteUrl,
              telephone: config.contact.phone,
              email: config.contact.email,
              address: {
                "@type": "PostalAddress",
                streetAddress: config.contact.address,
                addressLocality: config.contact.wilaya,
                postalCode: config.contact.postalCode,
                addressCountry: "DZ",
              },
              areaServed: "DZ",
              priceRange: "DA 3000–10000",
            }),
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
