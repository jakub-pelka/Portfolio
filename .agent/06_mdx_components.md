# 🧱 MDX Components Reference (Analog Architect)

Ten dokument to źródło wiedzy dla AI na temat dostępnych "klocków" (komponentów React) zdefiniowanych dla treści w plikach `.mdx` (np. `pl.mdx`/`en.mdx`). Wszystkie komponenty wizualnie są oparte o specyfikację "Technical Editorial / Analog Architect". Zawsze stosuj je zamiast natywnych znaczników HTML czy Markdown, gdy trzeba podkreślić strukturę, metryki, cytaty lub tablice (Insights/Decisions).

## Lista Komponentów do użycia w `MDXRemote`

### 1. `SectionHeader`
Zastępuje standardowe `<h2>` lub `###`. Tworzy techniczny nagłówek oddzielający logiczne sekcje dokumentu (zgodny z "The Analog Architect").
**Props:**
- `num` (string) - np. `"01"`, `"02"` - numer sekcji w formacie 2-cyfrowym.
- `title` (string) - np. `"EXECUTIVE_SUMMARY"`. Zawsze uppercase, techniczne nawlekanie (np. używanie podłogi w nazwach wieloczłonowych jest mocno zalecane).
**Przykład:** 
```mdx
<SectionHeader num="01" title="EXECUTIVE_SUMMARY" />
```

### 2. `MetricGrid` & `Metric`
Moduł używany do pokazywania wielkich statystyk czy danych (np. przyspieszenie, SLA, wzrost) z użyciem fontu IBM Plex Mono w asymetrycznym ułożeniu. Przestrzeń pod spodem idealna na luźny paragraf tekstu.
**Props (`Metric`):**
- `value` (string) - Wartość liczbowa + jednostka (np. `"70%"`, `"99.4%"`).
- `label` (string) - VT323 system label opisujący zmienną (np. `"Faster Cataloging"`).
**Przykład:**
```mdx
<MetricGrid>
  <Metric value="70%" label="Faster Cataloging" />
  <Metric value="99.4%" label="Accuracy Rating" />
</MetricGrid>
```

### 3. `QuoteBlock`
Blok cytatu z grubym lewym borderem (brak obwódki wokół, "No-Line Rule"). Tekst kursywą imitujący odręczną, ludzką notatkę (IBM Plex Mono Italic) stanowiąca balans z surową technicznąresztą kodu.
**Przykład:**
```mdx
<QuoteBlock>
  "Rekwizytor was conceived to solve the critical bottleneck in high-volume prop management..."
</QuoteBlock>
```

### 4. `ProcessBox` i `BoxGrid`
Baza do opisów problem/rozwiązanie. Lekko zacienione klocki `surface-container-low` (brak obwódek kontrastowych) oddzielające logiczne sekcje. 
**Props (`ProcessBox`):**
- `title` (string) - Tytuł klocka, np. `"THE PROBLEM"`, `"THE SOLUTION"`.
**Przykład:**
```mdx
<BoxGrid>
  <ProcessBox title="THE PROBLEM">
    Zbyt wiele czasu schodziło na ręczne katalogowanie tysięcy fizycznych obiektów...
  </ProcessBox>
</BoxGrid>
```

### 5. `TerminalCard` / `PulseCard`
Specyficzny komponent z "Halftone Gradient" umiejscawiany asymetrycznie obok treści głównych. Najczęściej renderowany z tłem typu "surface-container-low". Użycie dla technicznego "Heartbeat" projektu lub schematów.
**Props:**
- `title` (string) - np. `"PROJECT_PULSE"`.
- `status` (string) - opcjonalne, status tag, np. `"active"`.
**Przykład:**
```mdx
<TerminalCard title="PROJECT_PULSE" status="active">
  ### ROLE_ID
  ARCHITECT_01
</TerminalCard>
```

### 6. `ProcessCard`
Specyficzny dziennik decyzyjny (Decision Log / Insight Log). Zbudowany tak, by border po lewej łapał kolor w zależności od kontekstu. Zawiera systemową etykietkę [ INSIGHT ] lub [ DECISION ].
**Props:**
- `type` (enum "INSIGHT" | "DECISION" | "PROBLEM") - determinuje kolor linii.
- `title` (string) - opisujący tytuł procederu, np. `"THE NOTEPAD HOOK"`.
**Przykład:**
```mdx
<ProcessCard type="INSIGHT" title="THE NOTEPAD HOOK">
  User testing revealed that prop masters don't want complex forms...
</ProcessCard>
```

### 7. `ImageGrid`
Techniczne moduły renderujące zdjęcia. Z góry narzucony czarno-biały filtr `grayscale`, który włącza kolor (`grayscale-0`) na interakcji `hover`.
**Props:**
- `columns` (number) - Domyślnie `3`.
- `images` (array) - Tablica url do zdjęć z katalogów `/public/`.
**Przykład:**
```mdx
<ImageGrid columns={3} images={['/img/reco1.jpg', '/img/reco2.jpg']} />
```

### 8. `OutcomeBanner`
Wielka konkluzja na sam koniec strony produktu. Zawsze użyta z olbrzymim offsetem do góry, na tle z warstwą "Halftone".
**Props:**
- `statusTag` (string) - Systemowy "zielony/zatwierdzony" tag, np. `DEPLOYMENT_STABLE_VER_1.2.0`.
- Zawartość tekstu to wynik/konkluzja w Markdownie z opcjonalnymi podsumowującymi metrykami (MetricsAlpha, Beta).
**Przykład:**
```mdx
<OutcomeBanner statusTag="DEPLOYMENT_STABLE_VER_1.2.0">
  Rekwizytor is currently the primary inventory hub for three major European production houses...
</OutcomeBanner>
```
