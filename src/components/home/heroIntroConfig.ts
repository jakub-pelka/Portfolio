/** Wspólne stałe osi czasu animacji startowej hero (sekundy). */
export const INTRO_DURATION = 6;
/** Moment, w którym napisy i interfejs zaczynają wejście (w połowie ruchu gwiazdki). */
export const INTRO_TEXT_START = 2.2;

/** Interfejs gwiazdki ASCII, którym steruje Hero. */
export interface StarHandle {
  /** Rysuje klatkę dla czasu t (s). */
  render(t: number): void;
  /** Rusza pętlę obrotu od czasu t (zatrzymuje się poza ekranem i w karcie w tle). */
  startLoop(t: number): void;
  stopLoop(): void;
}
