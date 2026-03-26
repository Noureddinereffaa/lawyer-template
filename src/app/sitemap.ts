import { MetadataRoute } from 'next';
import { clientConfig } from "../../config/client.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = clientConfig.seo.siteUrl;

  const routes = [
    '',
    '/about',
    '/services',
    '/blog',
    '/booking',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // In a real app, we would fetch blog slugs from DB and append mapping here.
  // For now, only the static routes are generated.

  return routes;
}
