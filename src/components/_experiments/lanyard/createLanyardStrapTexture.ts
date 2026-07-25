import * as THREE from 'three';
import { readCssVar } from './createPlaceholderCardTexture';

// Strap print — same "JP" mark as the site header logo (SiteHeader.module.css
// .logo: IBM Plex Mono, bold) instead of the react-bits demo's baked-in logo.
// One mark per texture — the band mesh already repeats this whole texture
// 4x along the strap's length (repeat={[-4, 1]} in LanyardReactBits), so
// tiling more copies in here on top of that made "JP" show up ~16 times
// instead of the intended 4.
export function createLanyardStrapTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const bg = readCssVar('--color-text', '#1C1C1C');
  const fg = readCssVar('--color-bg', '#F6F5F0');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = fg;
  ctx.font = '700 190px "IBM Plex Mono", monospace';
  ctx.fillText('JP', width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}
