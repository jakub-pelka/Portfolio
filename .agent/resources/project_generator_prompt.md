# 📝 Project Generator Prompt

Użyj tego promptu do wygenerowania kompletnych plików projektu po rozmowie z klientem/użytkownikiem.

---

## Instrukcja dla AI:

Na podstawie rozmowy o projekcie wygeneruj **4 pliki** gotowe do wklejenia:

### 1. `meta.json`
Metadane niezależne od języka:
- `slug` — kebab-case ID projektu
- `status` — `"completed"` | `"in-progress"` | `"archived"`
- `featured` — `true` jeśli projekt ma być wyróżniony
- `date` — data ukończenia w formacie ISO (YYYY-MM-DD)
- `thumbnail` — ścieżka `"./assets/thumbnail.jpg"`
- `tags` — array technologii (np. `["React", "TypeScript", "GSAP"]`)
- `links` — opcjonalne linki (github, live, docs)

### 2. `config.ts`
Wizualna konfiguracja projektu:
```typescript
export const projectConfig = {
  theme: {
    background: "#1C1C1C",  // kolor tła projektu
    accent: "#55AAAA",      // kolor akcentu
  },
  hero: {
    animation: "float" | "slide" | "fade" | "none",
    parallax: true | false,
    image: "./assets/hero.jpg",
  },
  gallery: {
    layout: "masonry" | "grid" | "carousel",
  },
};
```

### 3. `pl.mdx`
Polski plik z frontmatter YAML + treścią Markdown:

**Frontmatter:**
```yaml
---
title: "Tytuł projektu po polsku"
description: "Krótki opis (1-2 zdania) — hook dla czytającego."

facts:
  - label: "Rola"
    value: "np. Full-stack Developer"
  - label: "Czas trwania"
    value: "np. 3 miesiące"
  - label: "Technologie"
    value: "React, TypeScript, Next.js"
  - label: "Zespół"
    value: "np. Solo / 3 osoby"

process:
  - title: "Dlaczego wybrałem [technologię/rozwiązanie]"
    type: "decision"
    content: "Uzasadnienie decyzji architektonicznej — dlaczego to, a nie tamto."
    date: "2024-01-10"
  - title: "Problem z [nazwa problemu]"
    type: "problem"
    content: "Opis wyzwania technicznego i jak zostało rozwiązane."
    date: "2024-01-20"
  - title: "Insight: [tytuł spostrzeżenia]"
    type: "insight"
    content: "Ciekawa lekcja lub odkrycie podczas projektu."
    date: "2024-01-25"
  - title: "Milestone: [tytuł kamienia milowego]"
    type: "milestone"
    content: "Ważny moment w projekcie (np. wdrożenie, refaktor, osiągnięcie metryki)."
    date: "2024-02-01"
---
```

**Treść Markdown:**
- Nagłówki (`#`, `##`) — struktura narracji
- Listy punktowe — funkcjonalności, wyzwania
- Cytaty (`>`) — opinie użytkowników, feedback
- Code blocks — fragmenty kodu jeśli istotne
- **Bez JSX** (chyba że specjalnie potrzebne custom komponenty)

### 4. `en.mdx`
Angielskie tłumaczenie — **identyczna struktura** jak `pl.mdx`, ale przetłumaczona treść.

---

## Zasady generowania:

1. **Facts** — tylko twarde dane (rola, czas, technologie). Brak opinii.
2. **Process** — narracja "za kulisami". Dlaczego tak, a nie inaczej? Co było trudne? Co odkryłeś?
3. **Types w process:**
   - `decision` — uzasadnienie wyboru (tech stack, architektura)
   - `problem` — wyzwanie techniczne i rozwiązanie
   - `insight` — lekcja wyciągnięta z projektu
   - `milestone` — kamień milowy (wdrożenie, refaktor, metryka)
4. **Daty** — chronologicznie, format ISO (YYYY-MM-DD)
5. **Treść Markdown** — zwięzła, konkretna, bez filler content
6. **Język** — PL naturalny, EN profesjonalny (nie Google Translate)

---

## Przykład użycia:

**User:**
> "Zrobiłem system rezerwacji dla sali fitness. Stack: React, Node.js, PostgreSQL. Główny problem to była synchronizacja kalendarzy w czasie rzeczywistym — rozwiązałem przez WebSockets. Projekt trwał 4 miesiące, solo. Jest live na fitnessroom.pl i na GitHubie."

**AI generuje:**
- `meta.json` z `slug: "fitness-reservation-system"`, `tags: ["React", "Node.js", "PostgreSQL", "WebSockets"]`
- `config.ts` z theme dopasowanym do branży fitness
- `pl.mdx` z process entry typu `problem` o synchronizacji kalendarzy
- `en.mdx` z tłumaczeniem

---

## Output format:

Zwróć **4 bloki kodu** gotowe do skopiowania:

\`\`\`json
// meta.json
{...}
\`\`\`

\`\`\`typescript
// config.ts
export const projectConfig = {...}
\`\`\`

\`\`\`mdx
// pl.mdx
---
...
---
Treść...
\`\`\`

\`\`\`mdx
// en.mdx
---
...
---
Content...
\`\`\`

---

## Dodatkowe wskazówki:

- Jeśli brakuje danych (np. nie wiadomo ile trwał projekt) — **pomiń** ten fact zamiast zgadywać
- Process entries — **minimum 2, maksimum 6** (quality > quantity)
- Treść Markdown — **300-800 słów** (nie za krótko, nie za długo)
- Tłumaczenie EN — zachowaj **tę samą strukturę nagłówków** co w PL (dla spójności)

---

**Gotowe!** Teraz wystarczy podać AI rozmowę/notatkę o projekcie, a otrzymasz komplet plików do wklejenia.
