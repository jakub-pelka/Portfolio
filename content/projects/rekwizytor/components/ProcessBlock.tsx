import type { ReactNode } from "react";

export type ProcessBlockType = "problem" | "decision" | "insight" | "milestone";

interface ProcessBlockProps {
  type: ProcessBlockType;
  title: string;
  index: number;
  children: ReactNode;
}

export function ProcessBlock({ type, title, index, children }: ProcessBlockProps) {
  const indexLabel = String(index).padStart(2, "0");

  return (
    <section data-block="process" data-type={type}>
      <header>
        <span data-block="process-index">{indexLabel}</span>
        <span data-block="process-type">{type}</span>
        <h3 data-block="process-title">{title}</h3>
      </header>
      <div data-block="process-content">{children}</div>
    </section>
  );
}
