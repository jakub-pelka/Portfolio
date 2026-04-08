import React from 'react';

export type HalftoneDirection =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'bottom'
  | 'right';

interface HalftoneShadowProps {
  /** Szerokość karta (px) — SVG dopasuje się automatycznie */
  cardWidth: number;
  /** Wysokości karta (px) */
  cardHeight: number;
  /** Odległość przesunięcia cienia (px), default: 16 */
  offset?: number;
  /** Kierunek / skąd pada cień */
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
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * HalftoneShadow — karta z komiksowym cieniem z pixeli/kropek.
 *
 * Cień jest generowany jako SVG: każda <circle> ma promień obliczony
 * schodkowo na podstawie odległości od narożnika wskazanego przez `direction`.
 * Dzięki temu każda kropka jest zawsze wyświetlana w całości (zero uciętych).
 */
export function HalftoneShadow({
  cardWidth,
  cardHeight,
  offset = 16,
  direction = 'bottom-right',
  grid = 10,
  maxRadius = 4,
  minRadius = 0.5,
  levels = 12,
  color = 'var(--color-text)',
  children,
  className,
  style,
}: HalftoneShadowProps) {
  // SVG covers card area + offset in the shadow direction
  const svgW = cardWidth + offset;
  const svgH = cardHeight + offset;

  const cols = Math.ceil(svgW / grid) + 1;
  const rows = Math.ceil(svgH / grid) + 1;

  const maxDist = (() => {
    switch (direction) {
      case 'bottom':   return rows - 1;
      case 'right':    return cols - 1;
      default:         return cols + rows - 2; // diagonal
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

  const dots: { cx: number; cy: number; r: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const dist = getDist(row, col);
      const level = Math.min(Math.floor(dist / step), levels - 1);
      const r = maxRadius - level * ((maxRadius - minRadius) / (levels - 1));
      dots.push({
        cx: col * grid + grid / 2,
        cy: row * grid + grid / 2,
        r,
      });
    }
  }

  // Position offsets: where to place SVG and Card within the wrapper
  // Wrapper is always (cardWidth + offset) × (cardHeight + offset)
  const wrapperW = cardWidth + offset;
  const wrapperH = cardHeight + offset;

  // SVG origin and Card origin depend on direction
  let svgTop = 0, svgLeft = 0;
  let cardTop = 0, cardLeft = 0;

  switch (direction) {
    case 'bottom-right':
      svgTop = offset; svgLeft = offset;
      cardTop = 0;     cardLeft = 0;
      break;
    case 'bottom-left':
      svgTop = offset; svgLeft = 0;
      cardTop = 0;     cardLeft = offset;
      break;
    case 'top-right':
      svgTop = 0;      svgLeft = offset;
      cardTop = offset; cardLeft = 0;
      break;
    case 'top-left':
      svgTop = 0;      svgLeft = 0;
      cardTop = offset; cardLeft = offset;
      break;
    case 'bottom':
      svgTop = offset; svgLeft = 0;
      cardTop = 0;     cardLeft = 0;
      break;
    case 'right':
      svgTop = 0;      svgLeft = offset;
      cardTop = 0;     cardLeft = 0;
      break;
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: wrapperW,
        height: wrapperH,
        ...style,
      }}
    >
      {/* Halftone shadow SVG */}
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{
          position: 'absolute',
          top: svgTop,
          left: svgLeft,
          zIndex: 0,
          overflow: 'visible',
        }}
        aria-hidden="true"
      >
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={color} />
        ))}
      </svg>

      {/* Card surface — always above shadow */}
      <div
        style={{
          position: 'absolute',
          top: cardTop,
          left: cardLeft,
          width: cardWidth,
          height: cardHeight,
          zIndex: 1,
          backgroundColor: 'var(--color-bg)',
          border: '1px solid var(--color-text)',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}
