import { jsPDF } from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import type { ChartConfig } from './types';
import { pxToPt } from './paper';
import { loadPdfFonts, loadSvgFontCss } from './fonts';

function slug(title: string): string {
  const s = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s || 'gantt-chart';
}

export function exportFilename(config: ChartConfig, ext: string): string {
  return `${slug(config.title)}-${config.paper}-${config.orientation}.${ext}`;
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Standalone SVG with fonts embedded so it renders identically anywhere. */
async function svgWithFonts(svg: string): Promise<string> {
  const css = await loadSvgFontCss();
  return svg.replace(/<svg([^>]*)>/, `<svg$1>\n<defs><style>${css}</style></defs>`);
}

export async function exportSvg(svg: string, config: ChartConfig): Promise<void> {
  const out = await svgWithFonts(svg);
  download(new Blob([out], { type: 'image/svg+xml' }), exportFilename(config, 'svg'));
}

export async function exportPng(
  svg: string,
  width: number,
  height: number,
  config: ChartConfig,
  scale = 3
): Promise<void> {
  const out = await svgWithFonts(svg);
  const url = URL.createObjectURL(new Blob([out], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.decoding = 'async';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Could not rasterise the SVG.'));
      img.src = url;
    });
    // Give the browser a beat to apply the embedded fonts before drawing.
    await new Promise((r) => setTimeout(r, 120));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is unavailable in this browser.');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('PNG encoding failed.');
    download(blob, exportFilename(config, 'png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function exportPdf(
  svg: string,
  width: number,
  height: number,
  config: ChartConfig
): Promise<void> {
  const fonts = await loadPdfFonts();
  const wPt = pxToPt(width);
  const hPt = pxToPt(height);
  const pdf = new jsPDF({
    unit: 'pt',
    format: [wPt, hPt],
    orientation: wPt >= hPt ? 'landscape' : 'portrait',
    compress: true,
  });

  pdf.addFileToVFS('IBMPlexSans-Regular.ttf', fonts.sansRegular);
  pdf.addFont('IBMPlexSans-Regular.ttf', 'IBM Plex Sans', 'normal');
  pdf.addFileToVFS('IBMPlexSans-SemiBold.ttf', fonts.sansSemiBold);
  pdf.addFont('IBMPlexSans-SemiBold.ttf', 'IBM Plex Sans', 'bold');
  pdf.addFileToVFS('IBMPlexMono-Regular.ttf', fonts.monoRegular);
  pdf.addFont('IBMPlexMono-Regular.ttf', 'IBM Plex Mono', 'normal');

  pdf.setDocumentProperties({
    title: config.title,
    creator: 'Gantt Charter',
  });

  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-99999px';
  host.innerHTML = svg;
  document.body.appendChild(host);
  try {
    const el = host.querySelector('svg');
    if (!el) throw new Error('Invalid chart SVG.');
    await svg2pdf(el, pdf, { width: wPt, height: hPt });
  } finally {
    host.remove();
  }
  pdf.save(exportFilename(config, 'pdf'));
}
