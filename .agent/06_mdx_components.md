# 🧱 MDX Components Reference

Ten dokument to źródło wiedzy dla AI na temat dostępnych komponentów React zdefiniowanych dla treści w plikach `.mdx` (`pl.mdx` / `en.mdx`). Wszystkie komponenty są oparte o estetykę "Technical Editorial / Analog Architect". Zawsze stosuj je zamiast natywnych znaczników HTML czy Markdown gdy trzeba podkreślić strukturę, metryki, cytaty lub decyzje.

> **Ważne:** Komponenty są rejestrowane globalnie w `src/components/mdx/index.ts` — nie trzeba ich importować w plikach MDX.

---

## Layout

### `SplitLayout` / `ContentLeft` / `ContentRight`
Dwukolumnowy układ strony. `ContentLeft` i `ContentRight` to dzieci `SplitLayout`. Używany do zestawienia narracji z sidebarem (np. `TerminalCard`).

```mdx
<SplitLayout>
  <ContentLeft>
    Treść główna, QuoteBlock, ProcessBox itp.
  </ContentLeft>
  <ContentRight>
    <TerminalCard title="PROJECT_INFO" status="active">
      ...
    </TerminalCard>
  </ContentRight>
</SplitLayout>
```

---

## Sekcje i nagłówki

### `SectionHeader`
Zastępuje `<h2>`. Techniczny nagłówek z numerem sekcji. Prop `id` jest wymagany gdy sekcja ma być linkowana z timeline (`process[].anchor`).

**Props:**
- `num` (string) — numer sekcji, np. `"01"`, `"02"`
- `title` (string) — zawsze UPPERCASE, podkreślniki zamiast spacji, np. `"EXECUTIVE_SUMMARY"`
- `id` (string, opcjonalny) — anchor id, musi odpowiadać `anchor` w `process[]` frontmatter

```mdx
<SectionHeader num="01" title="PROBLEM" id="problem" />
```

---

## Dane i metryki

### `MetricGrid` + `Metric`
Duże liczby/statystyki. `Metric` zawsze wewnątrz `MetricGrid`.

**Props (`Metric`):**
- `value` (string) — wartość z jednostką, np. `"70%"`, `"106"`
- `label` (string) — opis metryki, np. `"Faster Cataloging"`

```mdx
<MetricGrid>
  <Metric value="70%" label="Faster Cataloging" />
  <Metric value="99.4%" label="Accuracy Rating" />
</MetricGrid>
```

### `TerminalCard`
Sidebar/infobox w stylu terminala. Używany w `ContentRight` wewnątrz `SplitLayout`. Zawiera `MetaRow` z danymi technicznymi projektu.

**Props:**
- `title` (string) — np. `"PROJECT_INFO"`, `"PROJECT_PULSE"`
- `status` (string, opcjonalny) — tag statusu, np. `"active"`, `"archived"`

```mdx
<TerminalCard title="PROJECT_INFO" status="active">
  <MetaRow label="STACK">
    <TagList>
      <Tag>Next.js</Tag>
      <Tag>TypeScript</Tag>
    </TagList>
  </MetaRow>
  <MetaRow label="COMMITY">106</MetaRow>
  <MetaRow label="ETAP">Prototyp</MetaRow>
</TerminalCard>
```

### `MetaRow`
Wiersz etykieta + wartość. Używany wewnątrz `TerminalCard`.

**Props:**
- `label` (string) — etykieta w stylu `"STACK"`, `"COMMITY"`
- `children` — wartość (string, `TagList`, lub inny JSX)

### `Tag` + `TagList`
Prymitywy tagów technologii. `Tag` zawsze wewnątrz `TagList`.

```mdx
<TagList>
  <Tag>Next.js</Tag>
  <Tag>Supabase</Tag>
</TagList>
```

---

## Narracja i decyzje

### `QuoteBlock`
Blok cytatu z grubym lewym borderem. IBM Plex Mono italic. Używany do otwierania sekcji narracyjnych lub przytaczania opinii użytkowników.

```mdx
<QuoteBlock>
  "Rekwizytorzy spędzają godziny na ręcznym katalogowaniu..."
</QuoteBlock>
```

### `ProcessBox` + `BoxGrid`
Klocki problem/rozwiązanie. `ProcessBox` zawsze wewnątrz `BoxGrid`.

**Props (`ProcessBox`):**
- `title` (string) — np. `"THE PROBLEM"`, `"HIPOTEZA"`, `"ROZWIĄZANIE"`

```mdx
<BoxGrid>
  <ProcessBox title="THE PROBLEM">
    Opis problemu...
  </ProcessBox>
  <ProcessBox title="THE SOLUTION">
    Opis rozwiązania...
  </ProcessBox>
</BoxGrid>
```

### `ProcessCard`
Dziennik decyzyjny lub insight. Border po lewej zmienia kolor zależnie od `type`.

**Props:**
- `type` (string) — **lowercase**: `"insight"` | `"decision"` | `"problem"`
- `title` (string) — opisowy tytuł, np. `"GEMINI_VS_CUSTOM_MODEL"`

```mdx
<ProcessCard type="decision" title="GEMINI_VS_CUSTOM_MODEL">
  Wybrałem Gemini Vision zamiast custom modelu CV — lepiej rozumiał kontekst vintage...
</ProcessCard>
```

### `CompareBlock` + `CompareRow`
Tabela "przed / po". `CompareRow` zawsze wewnątrz `CompareBlock`.

**Props (`CompareBlock`):**
- `beforeLabel` (string) — nagłówek lewej kolumny, np. `"BEZ SYSTEMU"`
- `afterLabel` (string) — nagłówek prawej kolumny, np. `"Z REKWIZYTOREM"`

**Props (`CompareRow`):**
- `label` (string) — nazwa wiersza, np. `"Katalogowanie"`
- `before` (string) — wartość przed
- `after` (string) — wartość po

```mdx
<CompareBlock beforeLabel="BEZ SYSTEMU" afterLabel="Z REKWIZYTOREM">
  <CompareRow label="Katalogowanie" before="Ręczne opisywanie" after="Zdjęcie → auto rekord" />
  <CompareRow label="Wyszukiwanie" before="Excel / notatki" after="Filtrowanie po spektaklu" />
</CompareBlock>
```

---

## Media

### `FullwidthImage`
Obrazek na pełną szerokość z opcjonalnym podpisem. Domyślnie ma ramkę `1px solid var(--color-border)` — wyłącz przez `frame={false}` dla screenshotów aplikacji (ciemne UI źle wyglądają z ramką).

**Props:**
- `src` (string) — ścieżka z `/public/`, np. `"/projects/rekwizytor/Home-page.png"`
- `alt` (string) — opis dla accessibility
- `caption` (string, opcjonalny) — podpis pod obrazkiem
- `frame` (boolean, opcjonalny) — domyślnie `true`; użyj `frame={false}` dla screenshotów aplikacji

```mdx
<FullwidthImage
  src="/projects/rekwizytor/Home-page.png"
  alt="Ekran główny aplikacji"
  caption="Lista produkcji z przypisanymi rekwizytami"
  frame={false}
/>
```

### `ImageGrid`
Siatka zdjęć z filtrem grayscale (hover = kolor). Domyślnie ramka — wyłącz przez `frame={false}`.

**Props:**
- `images` (array) — tablica ścieżek z `/public/`
- `columns` (number, opcjonalny) — domyślnie `3`; dostępne: `2`, `3`
- `frame` (boolean, opcjonalny) — domyślnie `true`

```mdx
<ImageGrid columns={2} images={['/projects/rekwizytor/Home-page.png', '/projects/rekwizytor/Grupy-page.png']} />
```

### `CodeSnippet`
Terminal-style blok kodu z tytułem pliku i opcjonalną annotacją.

**Props:**
- `code` (string) — kod jako string z `\n` zamiast newlines (ograniczenie MDX: nie używaj template literals)
- `lang` (string, opcjonalny) — np. `"typescript"`, `"bash"`
- `title` (string, opcjonalny) — nazwa pliku, np. `"lib/vision/classify.ts"`
- `annotation` (string, opcjonalny) — komentarz pod tytułem

```mdx
<CodeSnippet
  lang="typescript"
  title="lib/vision/classify.ts"
  annotation="Gemini Vision zwraca ustrukturyzowany obiekt zgodny ze schematem Zod"
  code={"const result = await model.generateContent([...]);\nreturn schema.parse(JSON.parse(result.response.text()));"}
/>
```

---

## Podsumowanie

### `OutcomeBanner`
Wielka konkluzja na końcu strony projektu. Z lewym borderem w kolorze `--project-highlight`.

**Props:**
- `statusTag` (string) — systemowy tag wynikowy, np. `"PROTOTYP_GOTOWY"`, `"DEPLOYMENT_STABLE"`
- `children` — treść podsumowania w Markdown / JSX

```mdx
<OutcomeBanner statusTag="PROTOTYP_GOTOWY">
  System działa end-to-end — od uploadu zdjęcia do przeszukiwalnego katalogu.
</OutcomeBanner>
```

---

## Czego NIE używać

- `ReadingFooter` — istnieje w kodzie ale **nie wstawiamy w MDX** — będzie częścią globalnego layoutu
- Natywnych `<h2>`, `<h3>` — zastąp `SectionHeader`
- Inline `style={{}}` na prymitywach — używaj komponentów zamiast tego

---

## Zasady unikania duplikacji danych

### Stack technologiczny

**Jeden źródłowy zapis — `meta.json` → `tags[]`.**

`ProjectHero` automatycznie renderuje `tags[]` jako `TECH_STACK` w prawej kolumnie hero. **Nie wstawiaj technologii ponownie** w:
- `facts[]` frontmatter MDX (np. `TECHNOLOGIE: "NEXT.JS / TYPESCRIPT"`) — **zabronione**
- `TerminalCard` z `<TagList>` w treści MDX — **zabronione**

`facts[]` służy wyłącznie do danych których nie ma w `meta.json`: ROLA, CZAS, KONTEKST, COMMITY, STATUS, PLATFORMA itp.

### Linki (GitHub / Live)

**Jeden zapis — `meta.json` → `links.github` / `links.live`.**

`ProjectHero` renderuje przyciski automatycznie. `OutcomeBanner` przyjmuje `githubUrl` i `liveUrl` jako props — przepisz je ręcznie z `meta.json` przy tworzeniu OutcomeBanner. Nie dodawaj linków nigdzie indziej w treści MDX.

---

## Ograniczenia MDX (next-mdx-remote)

- **Tablice obiektów inline** jako props **nie działają**: `prop={[{key: 'val'}]}` → użyj children pattern
- **Template literals** jako props **nie działają**: `` prop={`tekst`} `` → użyj `prop={"tekst\nnewline"}`
- **Newlines w string props**: używaj `\n` w cudzysłowach: `code={"linia1\nlinia2"}`
