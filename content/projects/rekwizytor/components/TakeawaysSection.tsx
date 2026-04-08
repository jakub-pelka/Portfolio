import type { ReactNode } from "react";

interface TakeawaysSectionProps {
  children: ReactNode;
}

export function TakeawaysSection({ children }: TakeawaysSectionProps) {
  return (
    <section data-block="takeaways">
      <div data-block="takeaways-content">{children}</div>
    </section>
  );
}
