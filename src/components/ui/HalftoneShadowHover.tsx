import React from 'react';
import styles from './HalftoneShadowHover.module.css';
import type { HalftoneDirection } from './HalftoneShadow';

interface HalftoneShadowHoverProps {
  /** Szerokość karty (px) */
  cardWidth: number;
  /** Wysokość karty (px) */
  cardHeight: number;
  /** Odległość cienia / dystans "wyskoku" karty (px), default: 16 */
  offset?: number;
  /** Kierunek, w którym pada cień (karta "wyskakuje" w stronę przeciwną) */
  direction?: HalftoneDirection;
  /** Odstęp między centrami kropek (px), default: 10 */
  grid?: number;
  /** Maksymalny promień kropki (px), default: 4 */
  maxRadius?: number;
  /** Minimalny promień kropki (px), default: 0.5 */
  minRadius?: number;
  /** Liczba schodków wielkości, default: 12 */
  levels?: number;
  /** Kolor kropek, default: var(--color-text) */
  color?: string;
  /** Czas rozłożenia pojawiania się kropek od karty do najdalszego rogu (ms), default: 380 */
  staggerMs?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * HalftoneShadowHover — jak HalftoneShadow, ale cień jest niewidoczny w stanie
 * spoczynku. Na hover karta "wyskakuje" w stronę przeciwną do kierunku cienia,
 * a kropki cienia materializują się pojedynczo z opóźnieniem rosnącym wraz
 * z odległością od karty — jak progresywny raster dithered shadingu (PS1-owe
 * software rasterizery), a nie jedna płynnie odsłaniana bryła.
 */
export function HalftoneShadowHover({
  cardWidth,
  cardHeight,
  offset = 16,
  direction = 'bottom-right',
  grid = 10,
  maxRadius = 4,
  minRadius = 0.5,
  levels = 12,
  color = 'var(--color-text)',
  staggerMs = 380,
  children,
  className,
  style,
}: HalftoneShadowHoverProps) {
  const svgW = cardWidth + offset;
  const svgH = cardHeight + offset;

  const cols = Math.ceil(svgW / grid) + 1;
  const rows = Math.ceil(svgH / grid) + 1;

  const maxDist = (() => {
    switch (direction) {
      case 'bottom': return rows - 1;
      case 'right':  return cols - 1;
      default:       return cols + rows - 2; // diagonal
    }
  })();

  const step = maxDist / levels;

  const getDist = (row: number, col: number): number => {
    switch (direction) {
      case 'bottom-right': return row + col;
      case 'bottom-left':  return row + (cols - 1 - col);
      case 'top-right':    return (rows - 1 - row) + col;
      case 'top-left':     return (rows - 1 - row) + (cols - 1 - col);
      case 'bottom':       return row;
      case 'right':        return col;
    }
  };

  const dots: { cx: number; cy: number; r: number; delay: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const dist = getDist(row, col);
      const level = Math.min(Math.floor(dist / step), levels - 1);
      const r = maxRadius - level * ((maxRadius - minRadius) / (levels - 1));
      const delay = (dist / maxDist) * staggerMs;
      dots.push({ cx: col * grid + grid / 2, cy: row * grid + grid / 2, r, delay });
    }
  }

  const wrapperW = cardWidth + offset;
  const wrapperH = cardHeight + offset;

  // Pozycje (svg = cień, card = karta) oraz kierunek "wyskoku" (przeciwny do cienia)
  let svgTop = 0, svgLeft = 0;
  let cardTop = 0, cardLeft = 0;
  let popX = 0, popY = 0;

  switch (direction) {
    case 'bottom-right':
      svgTop = offset; svgLeft = offset;
      cardTop = 0;     cardLeft = 0;
      popX = -offset;  popY = -offset;
      break;
    case 'bottom-left':
      svgTop = offset; svgLeft = 0;
      cardTop = 0;     cardLeft = offset;
      popX = offset;   popY = -offset;
      break;
    case 'top-right':
      svgTop = 0;      svgLeft = offset;
      cardTop = offset; cardLeft = 0;
      popX = -offset;  popY = offset;
      break;
    case 'top-left':
      svgTop = 0;      svgLeft = 0;
      cardTop = offset; cardLeft = offset;
      popX = offset;   popY = offset;
      break;
    case 'bottom':
      svgTop = offset; svgLeft = 0;
      cardTop = 0;     cardLeft = 0;
      popX = 0;        popY = -offset;
      break;
    case 'right':
      svgTop = 0;      svgLeft = offset;
      cardTop = 0;     cardLeft = 0;
      popX = -offset;  popY = 0;
      break;
  }

  return (
    <div
      tabIndex={0}
      className={`${styles.wrapper}${className ? ` ${className}` : ''}`}
      style={{
        width: wrapperW,
        height: wrapperH,
        ['--htw-pop-x' as string]: `${popX}px`,
        ['--htw-pop-y' as string]: `${popY}px`,
        ...style,
      }}
    >
      <svg
        className={styles.shadow}
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ top: svgTop, left: svgLeft }}
        aria-hidden="true"
      >
        {dots.map((d, i) => (
          <circle
            key={i}
            className={styles.dot}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill={color}
            style={{ ['--dot-delay' as string]: `${d.delay}ms` }}
          />
        ))}
      </svg>

      <div
        className={styles.card}
        style={{ top: cardTop, left: cardLeft, width: cardWidth, height: cardHeight }}
      >
        {children}
      </div>
    </div>
  );
}
