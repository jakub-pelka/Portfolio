'use client';

import { useEffect, useState, type ComponentType } from 'react';

/**
 * Committed loader for the local-only UI tweak panel.
 *
 * The panel itself (DevTweakPanel.tsx + its CSS module) is gitignored, so it
 * lives only on your machine and never reaches GitHub / production. This file
 * IS committed and is safe to build without the panel present: the import
 * uses a computed specifier, which the bundler compiles into a directory
 * "context" rather than a hard dependency on one file. When the panel file is
 * absent (CI / a fresh clone) the import simply rejects at runtime and we
 * render nothing — the build never fails. The production guard skips the
 * attempt entirely on the live site.
 */
export function DevTweak() {
  const [Panel, setPanel] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    let alive = true;
    const moduleName = 'DevTweakPanel'; // variable → tolerant context import
    import(`./${moduleName}`)
      .then((m: Record<string, unknown>) => {
        if (alive && typeof m.DevTweakPanel === 'function') {
          setPanel(() => m.DevTweakPanel as ComponentType);
        }
      })
      .catch(() => {
        /* panel not checked out locally — no-op */
      });
    return () => {
      alive = false;
    };
  }, []);

  return Panel ? <Panel /> : null;
}
