import { cache } from 'react';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import type { Locale } from '@/i18n/config';
import type {
  ProjectMeta,
  ProjectContent,
  ProjectWithLocale,
} from '@/lib/types/project';

const PROJECTS_DIR = path.join(process.cwd(), 'content/projects');

/**
 * Get all project slugs from the content/projects directory
 */
export async function getAllProjectSlugs(): Promise<string[]> {
  try {
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch (error) {
    console.error('Error reading projects directory:', error);
    return [];
  }
}

/**
 * Read and parse meta.json for a project
 */
const SLUG_RE = /^[a-z0-9-]+$/;

function assertSlug(slug: string): void {
  if (!SLUG_RE.test(slug)) {
    throw new Error(`Invalid project slug: ${slug}`);
  }
}

async function getProjectMeta(slug: string): Promise<ProjectMeta> {
  assertSlug(slug);
  const metaPath = path.join(PROJECTS_DIR, slug, 'meta.json');
  const metaContent = await fs.readFile(metaPath, 'utf-8');
  return JSON.parse(metaContent);
}

/**
 * Read and parse MDX file for a specific locale
 */
async function getProjectContent(
  slug: string,
  locale: Locale
): Promise<ProjectContent> {
  assertSlug(slug);
  const mdxPath = path.join(PROJECTS_DIR, slug, `${locale}.mdx`);
  const mdxContent = await fs.readFile(mdxPath, 'utf-8');

  // Parse frontmatter and content
  const { data, content } = matter(mdxContent);

  return {
    title: data.title || '',
    description: data.description || '',
    facts: data.facts || [],
    process: data.process || [],
    body: content,
  };
}

/**
 * Get complete project data for a specific locale
 */
export const getProject = cache(async (
  slug: string,
  locale: Locale
): Promise<ProjectWithLocale> => {
  const [meta, content] = await Promise.all([
    getProjectMeta(slug),
    getProjectContent(slug, locale),
  ]);

  return {
    meta,
    content,
  };
});

/**
 * Get all projects for a specific locale
 * Optionally filter by featured status
 */
export const getAllProjects = cache(async (
  locale: Locale,
  featuredOnly = false
): Promise<ProjectWithLocale[]> => {
  const slugs = await getAllProjectSlugs();

  const projects = await Promise.all(
    slugs.map((slug) => getProject(slug, locale))
  );

  // Filter by featured if requested
  const filteredProjects = featuredOnly
    ? projects.filter((project) => project.meta.featured)
    : projects;

  // Sort by curated `order` when present, otherwise fall back to date (newest first)
  return filteredProjects.sort((a, b) => {
    const orderA = a.meta.order ?? Infinity;
    const orderB = b.meta.order ?? Infinity;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime();
  });
});
