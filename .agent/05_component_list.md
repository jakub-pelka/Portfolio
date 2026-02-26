# 🧩 Lista Komponentów (Component List)

Lista komponentów do zaoferowania w ramach Design Systemu. Stanowi checklistę postępów prac nad UI.

### 1. Struktura i Kontenery (Layout & Containers)

- [ ] **Siatka główna (Grid System):** Zdefiniowane kolumny i twarde zasady odstępów.
- [ ] **Kontener neutralny (Base Card):** Tło bazowe, ostre lub minimalnie zaokrąglone rogi (1-2px), brak miękkich cieni.
- [ ] **Komora Akcentowa (Hero/Showcase):** Wariant kontenera z materiałem (subtelne ziarno/metal) i technicznymi krawędziami.
- [ ] **Linie podziału (Dividers):** Wersja neutralna (1px, niski kontrast) oraz wersja techniczna (np. z krzyżykiem `+` na końcu).

### 2. Typografia i Znakowanie (Typography & Badges)

- [ ] **Style Nagłówków (H1 - H6):** Skala dla fontu Grotesk.
- [ ] **Styl Tekstu Głównego (Body Copy):** Skala i interlinia dla fontu Grotesk.
- [ ] **Blok Parametrów (Technical Readouts):** Skala dla fontu Monospace (daty, ID projektu, metryki).
- [ ] **Znaczniki neutralne (Tags):** Grotesk, cienki obrys (np. do kategorii projektów).
- [ ] **Znaczniki statusu (Status Pills):** Monospace + kolor akcentowy (np. błękit/amber dla statusu wdrożenia).
- [ ] **Oznaczenia techniczne (Fiducial markers):** Celowniki, krzyżyki lub kropki do osadzenia na skrzyżowaniach siatki.

### 3. Akcja i Nawigacja (Action & Navigation)

- [ ] **Przycisk Główny (Primary Button):** Stan _Default_, _Hover_ (ostra inwersja/brak płynnego przejścia), _Active_, _Disabled_.
- [ ] **Przycisk Dodatkowy (Ghost Button):** Obrys 1px + opcjonalny detal Monospace (np. `->`).
- [ ] **Nawigacja Główna (Navbar):** Surowy układ nagłówka strony.
- [ ] **Linki tekstowe (Text Links):** Styl w tekście i ostre pojawienie się podkreślenia na _Hover_.
- [ ] **Kursor (Opcjonalnie):** Customowy, techniczny celownik (zamiast standardowej łapki).

### 4. System i Feedback (System State & Feedback)

- [ ] **Pasek ładowania / Progress:** Wersja krokowa, blokowa lub migający znak `_`.
- [ ] **Puste stany (Empty States):** Układ komunikatu błędu / braku danych z użyciem Monospace (np. `[ NO_DATA ]`).
- [ ] **Powiadomienia (Toasts / Alerts):** Karta powiadomienia z ostrym, kolorowym panelem bocznym.

### 5. Media i Prezentacja

- [ ] **Kontener na obrazy (Media Wrapper):** Rama wokół screenów Twoich projektów.
- [ ] **Nawigacja po projektach (Pagination / Carousel):** Przyciski typu `[ PREV ]` / `[ NEXT ]`.
