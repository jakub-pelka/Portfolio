# Design system

Źródło prawdy: system projektowy "Jakub Pełka" (https://claude.ai/artifact/V53HRqaKaQhiaUhVz2KA9s).

- Tokeny leżą w `src/styles/tokens.css`.
- Komponenty strony używają klas `.jp-web-*` z `src/styles/globals.css`.
- Stare nazwy `--color-*` to aliasy nowych tokenów. Znikną po migracji komponentów.

## Kluczowe zasady

1. Ostre rogi. Promień zawsze 0, ramki 1px.
2. Hierarchię budujemy kolorem `--ink`, `--ink-muted`, `--ink-subtle`. Nie używamy opacity.
3. `--ink-faint` służy tylko do dekoracji, nigdy do tekstu.
4. Akcent jako tekst tylko `#287373` (jasny motyw). W ciemnym `#55aaaa`. Używaj `--accent-text`.
5. Minimum 12px dla tekstu. Cele dotyku mają min. 44px (`--target-min`).
6. Ruch: 200ms ease. Animacje wejścia: 700ms. Szanuj `prefers-reduced-motion`.
7. Jeden próg responsywny: 768px. Dodatkowo 1085px, tylko dla karty.
8. Fonty: `--font-mono` (IBM Plex Mono) i `--font-pixel` (VT323, tylko etykiety).
