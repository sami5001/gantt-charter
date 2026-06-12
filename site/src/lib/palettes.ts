/**
 * The twelve Oxford palettes, mirrored from the Python package
 * (utils/oxford_plotly_theme/theme.py) so web and CLI output match.
 */
export interface Palette {
  id: string;
  label: string;
  note: string;
  colors: string[];
}

export const PALETTES: Palette[] = [
  {
    id: 'professional',
    label: 'Professional',
    note: 'Business and academic timelines',
    colors: ['#002147', '#61615F', '#426A5A', '#994636', '#1D42A6', '#89827A'],
  },
  {
    id: 'primary',
    label: 'Primary',
    note: 'Most versatile, ten colours',
    colors: [
      '#002147', '#FE615A', '#00AAB4', '#E2C044', '#7F055F',
      '#A0AF84', '#FB5607', '#B9D6F2', '#E6007E', '#15616D',
    ],
  },
  {
    id: 'corporate',
    label: 'Corporate',
    note: 'Blues and greys for formal reports',
    colors: ['#002147', '#1D42A6', '#211D1C', '#61615F', '#D9D8D6', '#789E9E'],
  },
  {
    id: 'traditional',
    label: 'Traditional',
    note: 'Heritage and stability',
    colors: ['#002147', '#BE0F34', '#426A5A', '#E2C044', '#211D1C', '#D9D8D6'],
  },
  {
    id: 'contemporary',
    label: 'Contemporary',
    note: 'Muted, modern research tones',
    colors: ['#776885', '#E08D79', '#C4A29E', '#789E9E', '#994636', '#A0AF84'],
  },
  {
    id: 'vibrant',
    label: 'Vibrant',
    note: 'Eye-catching presentations',
    colors: ['#FE615A', '#00AAB4', '#FB5607', '#E6007E', '#65E5AE', '#49B6FF', '#E2C044'],
  },
  {
    id: 'pastel',
    label: 'Pastel',
    note: 'Soft, low-contrast grouping',
    colors: ['#B9D6F2', '#E08D79', '#D1BDD5', '#A0AF84', '#ED9390', '#D4CDF4', '#789E9E'],
  },
  {
    id: 'health',
    label: 'Health',
    note: 'Clinical and public-health work',
    colors: ['#8A1751', '#7F055F', '#FE615A', '#00AAB4', '#A0AF84'],
  },
  {
    id: 'innovative',
    label: 'Innovative',
    note: 'Tech-forward greens and blues',
    colors: ['#00AAB4', '#65E5AE', '#49B6FF', '#95C11F', '#15616D', '#B9D6F2'],
  },
  {
    id: 'celebratory',
    label: 'Celebratory',
    note: 'Festive and bright',
    colors: ['#E6007E', '#FB5607', '#FE615A', '#E2C044', '#65E5AE', '#B9D6F2'],
  },
  {
    id: 'diverging',
    label: 'Diverging',
    note: 'Two-ended comparisons',
    colors: ['#FE615A', '#E08D79', '#D9D8D6', '#B9D6F2', '#002147'],
  },
  {
    id: 'sequential_blue',
    label: 'Sequential Blue',
    note: 'Ordered, single-hue progression',
    colors: ['#B9D6F2', '#49B6FF', '#1D42A6', '#002147', '#211D1C'],
  },
];

export function getPalette(id: string): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

/**
 * Palette colours, extended with colours from other Oxford palettes when a
 * chart has more groups than the palette holds, so no two groups silently
 * share a colour. Mirrors the Python package's behaviour exactly, keeping
 * web and CLI output identical.
 */
export function paletteColors(id: string, count: number): string[] {
  const colors = [...getPalette(id).colors];
  for (const extra of ['vibrant', 'primary', 'contemporary', 'traditional']) {
    if (colors.length >= count) break;
    if (extra === id) continue;
    for (const color of getPalette(extra).colors) {
      if (!colors.includes(color)) colors.push(color);
    }
  }
  return colors;
}

/** Milestone marker colour, shared with the Python package (PHC accent). */
export const MILESTONE_COLOR = '#8A1751';

/** Relative luminance (sRGB) for contrast decisions on light bars. */
export function luminance(hex: string): number {
  const c = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Darken a hex colour by a factor (0..1). */
export function darken(hex: string, factor: number): string {
  const c = hex.replace('#', '');
  const ch = [0, 2, 4].map((i) => {
    const v = Math.round(parseInt(c.slice(i, i + 2), 16) * (1 - factor));
    return Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
  });
  return `#${ch.join('')}`;
}
