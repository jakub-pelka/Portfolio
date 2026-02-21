# 📐 Architektura Portfolio — Plan do dyskusji

> Ten dokument to propozycja struktury. Omawiamy, szlifujemy, dopiero potem kodujemy.

---

## 1. Routing & Struktura Stron

Next.js 16 App Router z dynamicznym segmentem `[lang]` dla i18n.

```
src/app/
├── [lang]/                    ← PL / EN
│   ├── layout.tsx             ← Root layout (theme, navigation, footer)
│   ├── page.tsx               ← Strona główna / Hero
│   ├── projects/
│   │   ├── page.tsx           ← Lista projektów (widok "Fakty")
│   │   └── [slug]/
│   │       └── page.tsx       ← Pojedynczy projekt (Fakty + Proces)
│   ├── about/
│   │   └── page.tsx           ← O mnie
│   └── admin/                 ← (dev-only) Panel zarządzania projektami
│       └── page.tsx
├── layout.tsx                 ← Top-level layout (redirect do [lang])
└── not-found.tsx
```

### ✅ Decyzja: Ścieżki Fakty / Proces

**Wybrana opcja: B — Query param**

- `/projects/praco?view=facts` vs `?view=process`
- Linkowalne widoki, bookmarkable, dobre do analityki
- Domyślny widok: `facts` (bez query param = fakty)

---

## 2. Schemat danych projektu

Pojedynczy plik MDX na projekt z frontmatter:

```typescript
// Typy (src/lib/types.ts)
interface Project {
  // === Identyfikacja ===
  slug: string; // URL-friendly ID
  title: string; // Nazwa projektu
  description: {
    // Krótki opis
    pl: string;
    en: string;
  };

  // === Metadata ===
  tags: string[]; // Technologie
  status: "in-progress" | "completed" | "archived";
  featured: boolean; // Wyróżniony na stronie głównej
  date: string; // Data rozpoczęcia (YYYY-MM-DD)
  thumbnail: string; // Ścieżka do obrazka

  // === Linki ===
  links?: {
    github?: string;
    live?: string;
    docs?: string;
  };

  // === Widok "Fakty" ===
  facts: {
    pl: FactItem[];
    en: FactItem[];
  };

  // === Widok "Proces" (narracja) ===
  process: {
    pl: ProcessEntry[];
    en: ProcessEntry[];
  };
}

interface FactItem {
  label: string; // np. "Rola", "Czas trwania"
  value: string; // np. "Full-stack developer", "6 miesięcy"
}

interface ProcessEntry {
  title: string; // np. "Dlaczego Tauri?"
  type: "decision" | "problem" | "insight" | "milestone";
  content: string; // Treść (markdown)
  date?: string; // Opcjonalna data
}
```

### Pytania:

- Czy `ProcessEntry.type` ma sens? Pomaga filtrować: "pokaż tylko decyzje projektowe" vs "pokaż rozwiązane problemy".
- Czy chcesz galerie zdjęć/screenshotów per projekt?

---

## 3. i18n — Strategia tłumaczeń

### UI Strings (nawigacja, buttony, labels)

```
data/dictionaries/
├── pl.json        ← { "nav.home": "Strona główna", "nav.projects": "Projekty", ... }
└── en.json        ← { "nav.home": "Home", "nav.projects": "Projects", ... }
```

### Treść projektów

Tłumaczenia wbudowane w schemat danych (`description.pl`, `description.en`, `facts.pl`, `facts.en`).

**Workflow dodawania projektu:**

1. Piszesz treść po polsku w admin UI
2. AI tłumaczy na angielski (w ramach admin UI lub ręcznie w IDE)
3. Obie wersje zapisane w jednym pliku/obiekcie

### Routing

- `/pl/` — polska wersja
- `/en/` — angielska wersja
- `/` — redirect na podstawie `Accept-Language` header przeglądarki

---

## 4. Design System — CSS Custom Properties

Zamiast Tailwind, budujemy własny system na CSS Custom Properties:

```css
/* src/styles/tokens.css */

:root {
  /* === Kolory (Light) === */
  --color-bg-primary: #fafafa;
  --color-bg-secondary: #f0f0f0;
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #666;
  --color-accent: #...; /* Do ustalenia */
  --color-accent-hover: #...;
  --color-border: #e5e5e5;

  /* === Typografia === */
  --font-heading: "Inter", sans-serif;
  --font-body: "Inter", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 2rem;
  --text-4xl: 2.5rem;
  --text-hero: 4rem;

  /* === Spacing === */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;
  --space-section: 6rem;

  /* === Layout === */
  --max-width: 1200px;
  --border-radius: 8px;
  --border-radius-lg: 16px;

  /* === Animacje === */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms cubic-bezier(0.16, 1, 0.3, 1);

  /* === Shadows === */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* Dark mode */
[data-theme="dark"] {
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #1a1a1a;
  --color-text-primary: #ededed;
  --color-text-secondary: #999;
  --color-border: #2a2a2a;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.5);
}
```

---

## 5. Animacje — Plan

```
Baza:        Framer Motion (scroll reveals, hover, transitions)
Zaawansowane: GSAP (SVG path drawing, timeline, precyzyjne sekwencje)
Opcjonalnie: WebGL / Three.js (interaktywne tło, particles) — TBD
Filozofia:   Minimalistyczne domyślnie, z opcją eksperymentów
```

### Priorytet 1 — Framer Motion (MVP)

| Miejsce                  | Animacja                                     |
| ------------------------ | -------------------------------------------- |
| Elementy przy scroll     | Fade-in + subtle slide up (scroll-triggered) |
| Przełącznik Fakty/Proces | AnimatePresence — crossfade między widokami  |
| Hover na kartach         | Scale + shadow transition                    |
| Page transitions         | Fade                                         |

### Priorytet 2 — GSAP + Eksperymenty

| Miejsce          | Animacja                     | Narzędzie   |
| ---------------- | ---------------------------- | ----------- |
| Hero             | Staggered text reveal        | GSAP        |
| SVG path drawing | Linie rysujące się na scroll | GSAP        |
| Magnetic buttons | Kursor przyciąga element     | GSAP        |
| Text scramble    | Na hover                     | GSAP        |
| Interaktywne tło | Particles / fluid            | WebGL (TBD) |

---

## 6. Component Tree (planowane)

```
src/components/
├── layout/
│   ├── Header.tsx              ← Nawigacja + ThemeToggle + LangSwitcher
│   ├── Footer.tsx
│   └── Container.tsx           ← Max-width wrapper
├── ui/
│   ├── Button.tsx
│   ├── ThemeToggle.tsx
│   ├── LangSwitcher.tsx
│   └── Badge.tsx               ← Tagi technologii
├── projects/
│   ├── ProjectCard.tsx         ← Karta na liście
│   ├── ProjectFacts.tsx        ← Widok "Fakty"
│   ├── ProjectProcess.tsx      ← Widok "Proces" (narracja)
│   ├── ViewToggle.tsx          ← Przełącznik Fakty/Proces
│   └── ProcessTimeline.tsx     ← Timeline dla narracji
├── home/
│   ├── Hero.tsx
│   └── FeaturedProjects.tsx
└── animations/
    ├── FadeIn.tsx              ← Wrapper animacji scroll-in
    ├── StaggerChildren.tsx     ← Kaskadowe pojawianie
    └── PageTransition.tsx
```

---

## 7. Fazy realizacji (propozycja)

| Faza        | Zakres                                                                   | Zależności |
| ----------- | ------------------------------------------------------------------------ | ---------- |
| **Phase 0** | Design system (tokeny CSS, fonty, dark/light)                            | Żadne      |
| **Phase 1** | Layout (Header, Footer, Container) + i18n routing + strona główna (Hero) | Phase 0    |
| **Phase 2** | Dane projektów (schemat, ładowanie) + ProjectCard + lista projektów      | Phase 1    |
| **Phase 3** | Strona projektu (Fakty/Proces toggle) + animacje P1                      | Phase 2    |
| **Phase 4** | Admin UI (dodawanie/edycja projektów, tłumaczenia)                       | Phase 2    |
| **Phase 5** | Polish: animacje P2, SEO, performance, deploy                            | Phase 3    |
