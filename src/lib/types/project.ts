/**
 * Project metadata from meta.json
 * Language-independent data shared across all locales
 */
export interface ProjectMeta {
  slug: string;
  status: "in-progress" | "completed" | "archived";
  featured: boolean;
  date: string; // ISO date format
  thumbnail: string; // relative path to thumbnail
  tags: string[];
  links?: {
    github?: string;
    live?: string;
    docs?: string;
  };
}

/**
 * Project visual configuration from config.ts
 * Per-project theme, animations, and visual settings
 */
export interface ProjectConfig {
  theme: {
    background: string;     // Base surface color
    accent: string;         // Hover accent 
    primaryText: string;    // Main brand/project text color
    highlight: string;      // Key accent border color (e.g., Outcome banner)
    halftoneStyle: "dark" | "light"; // Style of the halftone grid for this project
  };
  hero: {
    animation: "float" | "slide" | "fade" | "none" | "editorial";
    parallax: boolean;
    image?: string; // Optional since editorial might not use a massive hero image
  };
  gallery: {
    layout: "masonry" | "grid" | "carousel" | "editorial";
  };
}

/**
 * Fact item from MDX frontmatter
 * Key-value pair displayed in "Facts" view
 */
export interface FactItem {
  label: string; // e.g. "Role", "Duration"
  value: string; // e.g. "Full-stack Developer", "3 months"
}

/**
 * Process entry from MDX frontmatter
 * Narrative entry displayed in "Process" view
 */
export interface ProcessEntry {
  title: string;
  type: "decision" | "problem" | "insight" | "milestone";
  content: string;
  date?: string; // ISO date format
}

/**
 * Parsed content from MDX file (pl.mdx or en.mdx)
 * Includes frontmatter data and compiled body
 */
export interface ProjectContent {
  title: string;
  description: string;
  facts: FactItem[];
  process: ProcessEntry[];
  body: string; // raw MDX content
}

/**
 * Complete project data
 * Combines metadata, config, and localized content
 */
export interface Project {
  meta: ProjectMeta;
  config: ProjectConfig;
  content: {
    pl: ProjectContent;
    en: ProjectContent;
  };
}

/**
 * Project with single locale content (for rendering)
 */
export interface ProjectWithLocale {
  meta: ProjectMeta;
  config: ProjectConfig;
  content: ProjectContent;
}
