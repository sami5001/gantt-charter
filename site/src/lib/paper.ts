import type { Orientation, PaperSize } from './types';

/**
 * Page geometry at 96 dpi (CSS pixels). Dimensions chosen so that
 * 1 px here equals 0.75 pt in the exported PDF, i.e. true paper size.
 */
const SIZES: Record<PaperSize, { long: number; short: number; label: string }> = {
  a4: { long: 1122.5, short: 793.7, label: 'A4' }, // 297 x 210 mm, exact at 96 dpi
  letter: { long: 1056, short: 816, label: 'Letter' }, // 11 x 8.5 in
};

export interface PageGeometry {
  width: number;
  height: number;
  label: string;
}

export function pageGeometry(paper: PaperSize, orientation: Orientation): PageGeometry {
  const s = SIZES[paper];
  return orientation === 'landscape'
    ? { width: s.long, height: s.short, label: s.label }
    : { width: s.short, height: s.long, label: s.label };
}

/** Convert CSS px (96 dpi) to PDF points (72 dpi). */
export function pxToPt(px: number): number {
  return (px * 72) / 96;
}
