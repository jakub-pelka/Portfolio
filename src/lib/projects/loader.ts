import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import type { Locale } from '@/i18n/config';
import type {
  ProjectMeta,
  ProjectConfig,
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
async function getProjectMeta(slug: string): Promise<ProjectMeta> {
  const metaPath = path.join(PROJECTS_DIR, slug, 'meta.json');
  const metaContent = await fs.readFile(metaPath, 'utf-8');
  return JSON.parse(metaContent);
}

/**
 * Import and return config.ts for a project
 */
async function getProjectConfig(slug: string): Promise<ProjectConfig> {
  const configPath = path.join(PROJECTS_DIR, slug, 'config.ts');

  // Dynamic import for TypeScript config file
  const configModule = await import(`@/../content/projects/${slug}/config.ts`);
  return configModule.projectConfig;
}

/**
 * Read and parse MDX file for a specific locale
 */
async function getProjectContent(
  slug: string,
  locale: Locale
): Promise<ProjectContent> {
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
export async function getProject(
  slug: string,
  locale: Locale
): Promise<ProjectWithLocale> {
  const [meta, config, content] = await Promise.all([
    getProjectMeta(slug),
    getProjectConfig(slug),
    getProjectContent(slug, locale),
  ]);

  return {
    meta,
    config,
    content,
  };
}

/**
 * Get all projects for a specific locale
 * Optionally filter by featured status
 */
export async function getAllProjects(
  locale: Locale,
  featuredOnly = false
): Promise<ProjectWithLocale[]> {
  const slugs = await getAllProjectSlugs();

  const projects = await Promise.all(
    slugs.map((slug) => getProject(slug, locale))
  );

  // Filter by featured if requested
  const filteredProjects = featuredOnly
    ? projects.filter((project) => project.meta.featured)
    : projects;

  // Sort by date (newest first)
  return filteredProjects.sort((a, b) => {
    return new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime();
  });
}

/**
 * Get projects by status
 */
export async function getProjectsByStatus(
  locale: Locale,
  status: ProjectMeta['status']
): Promise<ProjectWithLocale[]> {
  const allProjects = await getAllProjects(locale);
  return allProjects.filter((project) => project.meta.status === status);
}

/**
 * Get projects by tag
 */
export async function getProjectsByTag(
  locale: Locale,
  tag: string
): Promise<ProjectWithLocale[]> {
  const allProjects = await getAllProjects(locale);
  return allProjects.filter((project) =>
    project.meta.tags.includes(tag)
  );
}

/**
 * Get all unique tags from all projects
 */
export async function getAllTags(): Promise<string[]> {
  const slugs = await getAllProjectSlugs();
  const allTags = new Set<string>();

  for (const slug of slugs) {
    const meta = await getProjectMeta(slug);
    meta.tags.forEach((tag) => allTags.add(tag));
  }

  return Array.from(allTags).sort();
}
