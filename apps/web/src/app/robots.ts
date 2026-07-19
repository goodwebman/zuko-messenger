import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Приватные разделы из индекса (всё равно за auth, но не даём краулеру биться в 401/redirect).
      disallow: ['/settings', '/messages', '/notifications'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
