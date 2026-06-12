export type Measure = (text: string, sizePx: number, weight?: number, mono?: boolean) => number;

let ctx: CanvasRenderingContext2D | null = null;

function context(): CanvasRenderingContext2D | null {
  if (ctx) return ctx;
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  ctx = canvas.getContext('2d');
  return ctx;
}

/** Measure text width using the actual loaded chart fonts. */
export const measureText: Measure = (text, sizePx, weight = 400, mono = false) => {
  const c = context();
  const family = mono ? '"IBM Plex Mono", monospace' : '"IBM Plex Sans", sans-serif';
  if (!c) return text.length * sizePx * (mono ? 0.6 : 0.54);
  c.font = `${weight} ${sizePx}px ${family}`;
  return c.measureText(text).width;
};

/** Trim text with an ellipsis so it fits within maxWidth. */
export function truncate(
  text: string,
  maxWidth: number,
  sizePx: number,
  weight = 400,
  mono = false,
  measure: Measure = measureText
): string {
  if (measure(text, sizePx, weight, mono) <= maxWidth) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (measure(`${text.slice(0, mid)}…`, sizePx, weight, mono) <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return lo === 0 ? '…' : `${text.slice(0, lo)}…`;
}
