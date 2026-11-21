'use client';

import { useEffect, useRef, useState } from 'react';

interface CopyForAIProps {
  /** Gotowy markdown zbudowany na serwerze (src/lib/copy-for-ai.ts). */
  markdown: string;
  labels: { copy: string; done: string; title: string };
}

const RESET_MS = 2000;

export function CopyForAI({ markdown, labels }: CopyForAIProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
    } catch {
      // Brak uprawnień / niebezpieczny kontekst: nic nie zmieniamy, bez nieobsłużonego wyjątku.
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setCopied(true);
    timer.current = setTimeout(() => {
      setCopied(false);
      timer.current = null;
    }, RESET_MS);
  };

  return (
    <button
      type="button"
      className="jp-web-btn jp-web-btn--quiet"
      onClick={handleCopy}
      title={labels.title}
      data-copied={copied}
      aria-live="polite"
    >
      {copied ? labels.done : labels.copy}
    </button>
  );
}
