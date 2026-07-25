import * as THREE from 'three';

export function readCssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function createPlaceholderCardTexture(aspect: number): THREE.CanvasTexture {
  const width = 512;
  const height = Math.round(width * aspect);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const bg = readCssVar('--color-bg-card', '#F6F5F0');
  const text = readCssVar('--color-text', '#1C1C1C');
  const accent = readCssVar('--color-accent', '#55AAAA');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = text;
  ctx.globalAlpha = 0.35;
  ctx.setLineDash([10, 8]);
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  ctx.globalAlpha = 1;

  ctx.fillStyle = accent;
  ctx.fillRect(20, 20, 44, 6);
  ctx.fillRect(20, 20, 6, 44);
  ctx.fillRect(width - 64, height - 26, 44, 6);
  ctx.fillRect(width - 26, height - 64, 6, 44);

  ctx.fillStyle = text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 32px "IBM Plex Mono", monospace';
  ctx.fillText('[ PLACEHOLDER ]', width / 2, height / 2 - 14);
  ctx.globalAlpha = 0.6;
  ctx.font = '400 16px "IBM Plex Mono", monospace';
  ctx.fillText('SWAP VIA imageUrl PROP', width / 2, height / 2 + 22);
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
