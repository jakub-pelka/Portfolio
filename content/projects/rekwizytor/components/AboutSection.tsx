import type { ReactNode } from "react";

interface AboutSectionProps {
  children: ReactNode;
}

export function AboutSection({ children }: AboutSectionProps) {
  return (
    <section data-block="about">
      <div data-block="about-content">{children}</div>
    </section>
  );
}
