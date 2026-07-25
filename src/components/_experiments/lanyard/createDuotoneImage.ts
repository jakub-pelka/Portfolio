// Recolors a photo into a two-tone gradient by luminance: dark pixels map to
// `shadowColor`, bright pixels map to `highlightColor`, everything between is
// interpolated. Used so a real photo's highlights land on our cream
// background tone instead of stark white, rather than a plain grayscale.
// Colors are fixed hex values, not theme CSS vars — a photo's tonal treatment
// is a deliberate one-time design choice and shouldn't invert when the site
// switches to dark mode.
export function createDuotoneImage(
  img: HTMLImageElement | HTMLCanvasElement,
  shadowColor: string,
  highlightColor: string
): HTMLCanvasElement {
  const parseHex = (hex: string): [number, number, number] => {
    const c = hex.replace('#', '');
    const full = c.length === 3 ? c.split('').map((ch) => ch + ch).join('') : c;
    const value = parseInt(full, 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  };

  const canvas = document.createElement('canvas');
  canvas.width = img instanceof HTMLImageElement ? img.naturalWidth || img.width : img.width;
  canvas.height = img instanceof HTMLImageElement ? img.naturalHeight || img.height : img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const [sr, sg, sb] = parseHex(shadowColor);
  const [hr, hg, hb] = parseHex(highlightColor);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const luminance = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
    data[i] = sr + (hr - sr) * luminance;
    data[i + 1] = sg + (hg - sg) * luminance;
    data[i + 2] = sb + (hb - sb) * luminance;
  }
  ctx.putImageData(imageData, 0, 0);

  return canvas;
}
