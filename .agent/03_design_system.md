# 🎨 Visual Spec & Design System

**Wersja:** 2.0 (Luty 2026)

## 📌 Charakter Projektu

Współczesny, czysty layout z kontrolowanym technicznym akcentem.
**Proporcje:** 80% czyste, nowoczesne UI · 20% systemowy/retro detal (subtelny).

---

## 1. Struktura i Kontenery

- **Siatka & Układ:**
  - Dużo światła (powietrza), centralne pozycjonowanie elementu Hero.
  - Duże marginesy zewnętrzne.
  - Layout komorowy (nie klasycznie sekcyjny).
  - Architektura Single Page (z kotwicami, bez stałej nawigacji górnej).
- **Base Card:**
  - `border-radius`: 2–4px (ostry, techniczny charakter).
  - Tło: `#F6F5F0` (komorowe, papierowe/neutralne).
  - Cienie: Brak.
- **Linie podziału (Dividers):**
  - 1px w kolorze `#1C1C1C` z niskim `opacity`.
  - Opcjonalnie: wersja techniczna z krzyżykiem `+` na końcach.

---

## 2. Kolory Systemowe & Tematy

**Tryb Jasny / Ciemny:** Pełna inwersja kolorów systemowych (jeden spójny system, nie dwa różne designy). W trybie ciemnym dominuje `#1C1C1C`.

| Token      | Wartość (Hex) | Zastosowanie                                                                                                      |
| ---------- | ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `bg-light` | `#F6F5F0`     | Tło strony i kart w trybie jasnym (Light Mode).                                                                   |
| `bg-dark`  | `#1C1C1C`     | Typografia w Light, tło strony i kart w Dark Mode, linie podziału.                                                |
| `accent`   | `#55AAAA`     | Fiducial markers, stany hover, statusy, mikrodetale. Zmiana zasady: **nie pojawia się na dużych powierzchniach**. |

---

## 3. Typografia

Hierarchia jest budowana wyłącznie przez wagę i kontrast stylów – **nigdy przez kolor**.

### Font 1: VT323

Ograniczenia: Nigdy do długiego tekstu ani dużych bloków.

- Mikro nagłówki (np. "Hey")
- Systemowe etykiety
- Elementy pseudo-terminalowe i małe podpisy

### Font 2: IBM Plex Mono

Charakter: zwarte, konstrukcyjne, techniczne.

- **Letter spacing:** `-8%`
- Zastosowanie: duże nagłówki, nazwisko, parametry, metryki biznesowe/techniczne.

**Hierarchia w Hero:**

1. `VT323` → "Hey"
2. `IBM Plex Mono Italic` → "It's"
3. `IBM Plex Mono Bold` → "Jakub"
4. `IBM Plex Mono Regular` → "Pełka"

---

## 4. Akcja i Nawigacja

- **Nawigacja:** Brak stałego headera; oparta na kotwicach (`#section`).
- **Przyciski (Buttons):**
  - Styl: Obrys 1px (ghost button).
  - Zawartość: zamek w nawiasach kwadratowych, np. `[ VIEW PROJECT ]`, `[ CONTACT -> ]`.
  - Hover: Wyostrzenie (zmiana state/wagi). Wymaga użycia `font-variation-settings` lub `letter-spacing` trick, aby uniknąć braku wsparcia dla płynnego animowania `font-weight`. Brak standardowych `ease-in-out` – zmiany mają być ostre.
- **Linki tekstowe:** Ostre podkreślenie pojawiające się na hover, bez miękkich animacji.

---

## 5. UI Elements & Tagi

- **Znaczniki/Status Pills:**
  - Monospace, uppercase, obrys 1px.
- **Tagi Technologii:**
  - Wypełnienie (background) oryginalnym kolorem brandowym danej technologii (np. React → `#61DAFB`, Vue → `#42B883`).
- **Tagi Systemowe (Inne):**
  - Opcjonalne użycie akcentu `#55AAAA`.
- **Parametry (Metryki):**
  - Oparte o wzór: `[ ROLA: SYSTEM DESIGNER ]`, `[ STATUS: ACTIVE ]`.
  - Uppercase, IBM Plex Mono, opcjonalnie akcent `#55AAAA` tylko na samych wartościach.

---

## 6. Prezentacja Projektów

- **Proporcje:**
  - 2/3 (Grid): Opis, tytuł, listowanie punktowe istotnych wyborów.
  - 1/3 (Grid): Mockupy i zrzuty ekranu.
  - Elastyczność: "Featured" projekt może być większy asymetrycznie.
- **Zrzuty Ekranu / Mockupy:**
  - Prezencja wewnątrz ramek (browser/device mockups).
  - Obrys (rama) o grubości 1px.
  - Techniczne podpisy w monospace tuż pod urządzeniem/oknem (np. z wymiarami lub statusem).

---

## 7. Mikrodetale & System Feedback

- **Elementy w Tle / Hero:**
  - Dozwolone: Gwiazdki (`*`), Numery sekcji wg. schematu `[ 01 / 02 ]`, Subtelne linie siatki (grid w tle).
  - Zabronione (usunięto z designu): Techniczne narożniki w stylu CAD (`┌ ┐`).
- **Stany Systemowe / Feedback:**
  - Ostre, blokowe rozwiązania.
  - Teksty wzorowane na systemach OS/CLI: `[ SENDING... ]`, `[ SUCCESS ]`, `[ ERROR ]`.
  - Blokowe paski postępu.
  - Panele (Toasty) z ostrym, bocznym znacznikiem / border-left.
- **Język (i18n):**
  - Strona dostępna PL i EN, przełącznik widoczny jako techniczny element UI.

---

## 8. Spacing Scale

**Jednostka bazowa:** `1rem = 16px` (standard przeglądarki).
**Minimalny krok:** `0.5rem`.

### Modularna skala spacingu

| Wartość (rem) | Zastosowanie                                                       |
| ------------- | ------------------------------------------------------------------ |
| **0.5**       | drobne paddingi, micro spacing między tagami, mikro marginesy      |
| **1**         | odstęp między drobnymi sekcjami / elementami listy                 |
| **1.5**       | większe marginesy w kartach, między nagłówkiem a contentem         |
| **2**         | padding w Base Card, odstęp między komorami layoutu                |
| **3**         | duży spacing w Hero / sekcje główne                                |
| **4**         | bardzo duże odstępy między głównymi sekcjami / full-screen spacing |

### Zasady stosowania

- Wybierać wartości z powyższej skali, nie wprowadzać arbitralnych wartości w parametrach/marginesach (unikać "magicznych liczb").
- Drobne korekty mogą być stosowane, np. `1.25rem` dla specyficznych i rzadkich przypadków, jeśli narzuca to geometria fontu/elementu.
- Skalę testować w realnych layoutach, aby upewnić się, że spacing wygląda naturalnie i utrzymuje napowietrzenie projektu.
- Skalę można później modyfikować, dodając lub odejmując wartości układowe w razie powstawania nowych typów sekcji.

---

## 9. Typografia — Skala Font-Size

**Metoda:** Fluid (`clamp()`) — płynne skalowanie między mobile a desktop.

| Token        | Mobile     | Desktop    | Zastosowanie                   |
| ------------ | ---------- | ---------- | ------------------------------ |
| `text-hero`  | `2.5rem`   | `5rem`     | Nazwisko w Hero                |
| `text-title` | `1.5rem`   | `2.5rem`   | Nagłówki sekcji                |
| `text-body`  | `1rem`     | `1.125rem` | Treść, opisy projektów         |
| `text-label` | `0.75rem`  | `0.875rem` | Etykiety, tagi, parametry      |
| `text-micro` | `0.625rem` | `0.75rem`  | VT323 podpisy, mikro znaczniki |

**Przykład implementacji:**

```tsx
<h1 className="font-ibm" style={{ fontSize: 'var(--text-hero)' }}>Nagłówek IBM</h1>
<h1 className="font-vt" style={{ fontSize: 'var(--text-hero)' }}>Nagłówek VT323</h1>
```

### Optyczna Kompensacja Skali (VT323)

Ze względu na specyfikę renderowania fontu pikselowego, VT323 w tym samym rozmiarze `font-size` co IBM Plex Mono jest optycznie znacznie mniejsze. Kompensacja jest wbudowana na **poziomie definicji fontu** — VT323 jest ładowany jako `next/font/local` z deskryptorem `size-adjust: 130%` w `@font-face`.

**Efekt:** Przeglądarka automatycznie skaluje VT323 o 130% przy każdym użyciu — niezależnie od tego, czy font jest przypisany przez klasę CSS, inline style, czy CSS module. Nie wymaga żadnych dodatkowych zmiennych, klas ani ręcznego skalowania.

**Pliki fontu:** `src/fonts/VT323-latin.woff2`, `src/fonts/VT323-latin-ext.woff2`
**Definicja:** `src/app/[lang]/layout.tsx` → `localFont({ ..., declarations: [{ prop: 'size-adjust', value: '130%' }] })`

Klasy `.font-ibm` i `.font-vt` w `globals.css` istnieją jako wygodne utility classes przypisujące `font-family`, ale **nie zawierają logiki skalowania** — to robi sam `@font-face`.

---

## 10. Responsywność

**Breakpoint:** Jeden próg — `768px` (mobile / desktop).

### Ogólny Layout

- Poniżej 768px: Układ jednokolumnowy, komory układają się pionowo (stacking).

### Sekcja Projektów na Mobile

- Layout o proporcjach `2/3 + 1/3` zostaje wyłączony.
- Mockup urządzenia staje się **tłem karty** z nałożonym warstwowym przyciemnieniem (`overlay`).
- Opis i tytuł są renderowane na wierzchu mockupu.
- Dane projektu (tagi parametrów) wyświetlają się poniżej lub nad kartą (według ostatecznych ustaleń wizualnych).

---

## 11. Stany Interakcji i Ruch

### Disabled State

- `opacity: 40%` — element widoczny, ale wyraźnie nieaktywny.
- `cursor: not-allowed`
- Brak zmiany koloru lub innej modyfikacji struktury.

### Focus State

- Odłożone na kolejną iterację (na tym etapie nie jest to priorytet wizualny).

### Globalna Zasada Animacji

- **Domyślna prędkość:** `transition-duration: 200ms` dla większości przejść elementarnych.
- **Wyjątki Button Hover:** Animacje polegające na pogrubieniu tekstu tworzone są przez `font-variation-settings`.
- **Interpolacja (Timing-Function):** Brak standardowego `ease-in-out`. Preferujemy `linear` oraz `steps()`, szczególnie tam, gdzie systemowy/techniczny charakter jest priorytetem.

---

## 12. Layrowanie / Z-Index

Definicja warstw (od najniższej do najwyższej), sterująca nakładaniem komponentów na osi Z:

| Poziom | Token           | Elementy                                    |
| ------ | --------------- | ------------------------------------------- |
| 0      | `z-background`  | Linie siatki, asteriski, dekoracje w tle    |
| 1      | `z-card`        | Karty komorowe (Base Card)                  |
| 2      | `z-content`     | Typografia i faktyczna warstwa merytoryczna |
| 3      | `z-interactive` | Przyciski, klikalne tagi, linki             |
| 4      | `z-overlay`     | Interfejs toasty / powiadomienia systemowe  |
