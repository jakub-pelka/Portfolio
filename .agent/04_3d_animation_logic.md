# 🧊 3D Animation Logic: Jednorazowa Animacja Sekcji

Ten dokument opisuje specyfikację i logikę działania wydajnej, jednorazowej animacji 3D (WebGL/GSAP) wyzwalanej przez viewport.

## 🎯 Cel i Założenia

- **Wyzwalanie**: Tylko po wejściu w viewport (min. 40% widoczności).
- **Powtarzalność**: Wykonuje się dokładnie **raz**.
- **Efekt**: Po zakończeniu obiekt zostaje w stanie końcowym (brak resetu).
- **Wydajność**: Render loop (60fps) zostaje całkowicie zatrzymany po zakończeniu animacji.
- **Lazy Loading**: Ciężkie zasoby (GLTF, HDRI) ładowane tylko gdy są potrzebne.

---

## ⚙️ Logika Operacyjna

### 1. Lazy Start (Intersection Observer)

- Wykorzystanie `IntersectionObserver` do śledzenia kontenera sekcji.
- `threshold: 0.4` (40% widoczności sekcji).
- Po pierwszym wykryciu (trigger):
  - Ustawienie flagi `isLoaded = true`.
  - Wywołanie `observer.disconnect()` (sprzątanie).

### 2. Animacja Jednorazowa (GSAP / Framer Motion 3D)

- Kontrola stanem: `animationStarted` oraz `animationFinished`.
- Animacja transformacji (rotation, scale, position) do predefiniowanych wartości docelowych.
- Stan końcowy = aktualna i ostateczna transformacja obiektu.

### 3. Optymalizacja Performance (Kill the Loop)

- Po osiągnięciu stanu docelowego (`onComplete` w GSAP lub flaga w render loopie):
  - Ustawienie `animationFinished = true`.
  - **Zatrzymanie `requestAnimationFrame`**:
    - Jeśli używamy `Three.js`: wywołanie `renderer.setAnimationLoop(null)`.
    - Jeśli używamy `R3F`: modyfikacja flagi kontrolującej `useFrame`.
- **Rezultat**: Zużycie CPU/GPU spada do zera, gdy scena jest statyczna.

### 4. Dynamic Asset Loading

- Wykorzystanie `dynamic import` w Next.js dla komponentu 3D (`ssr: false`).
- Komponent renderowany dopiero gdy `isLoaded === true` (z Intersection Observer).
- Wsparcie dla `React.Suspense` i fallbacku w postaci statycznego obrazka/placeholderu.

---

## 🏗️ Zasady Architektoniczne

- **Niezależność od scrolla**: Po uruchomieniu animacja biegnie własnym tempem, scroll jej nie przyspiesza ani nie cofa.
- **Brak resetu**: Animacja nie uruchamia się ponownie przy przewijaniu góra/dół.
- **Persistence**: Stan końcowy zostaje zachowany do czasu odmontowania komponentu lub odświeżenia strony.

## 🚀 Priorytety Implementacyjne

1. **Wydajność**: Brak niepotrzebnych obliczeń (0% idle overhead).
2. **Determinism**: Zawsze ten sam stan końcowy.
3. **UX**: Płynny start bez tzw. "layout shift".
