import { notFound } from 'next/navigation';

// Catch-all: any unknown path under /[lang]/... renders [lang]/not-found.tsx
// (inside the site layout) with a real HTTP 404 status.
export default function CatchAllNotFound() {
  notFound();
}
