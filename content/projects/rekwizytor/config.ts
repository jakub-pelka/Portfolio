import { ProjectConfig } from "@/lib/types/project";

export const projectConfig: ProjectConfig = {
  theme: {
    background: "var(--color-bg-light)", // Czysty, papierowy kolor bazy
    accent: "#55AAAA",                   // Mocny techniczny cyan (MUI/Tailwind primary)
    primaryText: "#1C1C1C",              // Wiodący atrament
    highlight: "#FFB694",                // Specyficzny kolor highlightu (użyty m.in. w OutcomeBanner)
    halftoneStyle: "dark",
  },
  hero: {
    animation: "editorial",
    parallax: false,
  },
  gallery: {
    layout: "editorial",
  },
};
