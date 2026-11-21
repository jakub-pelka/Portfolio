# Jakub Pełka — Portfolio

Personal bilingual (PL / EN) portfolio website featuring a single-page overview and detailed project case studies.

Live: [https://www.jakubpelka.me](https://www.jakubpelka.me)

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Vanilla CSS Modules with custom design tokens
- **Animations:** GSAP (hero text split & motion), Framer Motion, Three.js / React Three Fiber / Rapier (interactive 3D lanyard)
- **Content:** MDX powered by `next-mdx-remote`

## Content Model

Project case studies live under `content/projects/<slug>/`:

```text
content/projects/<slug>/
├── meta.json         # Metadata, tags, dates, and links
├── config.ts         # Visual theme and layout configuration
├── pl.mdx            # Polish case study
├── en.mdx            # English case study
└── assets/           # Project screenshots and images
```

Project assets are synced to `public/projects/` via `scripts/sync-assets.sh` before each build (`prebuild` script).

## Development

```bash
# Run local dev server
npm run dev

# Build for production (runs prebuild sync + next build)
npm run build

# Run linter
npm run lint
```
