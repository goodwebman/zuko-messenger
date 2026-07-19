import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/**
 * Статический костяк карты. Публичные посты/профили можно добавить сюда динамически,
 * подтянув свежие id из API, — база под это уже готова (роуты публичны на чтение).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${siteUrl}/feed`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/register`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
