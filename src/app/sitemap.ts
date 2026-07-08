import type { MetadataRoute } from 'next';
import { locales, defaultLocale } from '@/i18n/config';
import { getAllProjects } from '@/lib/projects/loader';
import { SITE_URL } from '@/lib/seo/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getAllProjects(defaultLocale);

  const homeEntries: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    changeFrequency: 'monthly',
    priority: 1.0,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}`])
      ),
    },
  }));

  const projectEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    projects.map((project) => ({
      url: `${SITE_URL}/${locale}/projects/${project.meta.slug}`,
      lastModified: new Date(project.meta.date),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [
            l,
            `${SITE_URL}/${l}/projects/${project.meta.slug}`,
          ])
        ),
      },
    }))
  );

  return [...homeEntries, ...projectEntries];
}
