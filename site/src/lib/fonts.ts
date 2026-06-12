/**
 * Chart font assets. The same IBM Plex files drive the preview (via
 * @fontsource CSS), the standalone SVG/PNG exports (embedded woff2),
 * and the vector PDF export (TTF registered with jsPDF).
 */
import sansRegularTtf from '../assets/fonts/IBMPlexSans-Regular.ttf?url';
import sansSemiBoldTtf from '../assets/fonts/IBMPlexSans-SemiBold.ttf?url';
import monoRegularTtf from '../assets/fonts/IBMPlexMono-Regular.ttf?url';
import sansRegularWoff2 from '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2?url';
import sansSemiBoldWoff2 from '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2?url';
import monoRegularWoff2 from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2?url';

async function fetchBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load font: ${url}`);
  const buf = await res.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buf);
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export interface PdfFonts {
  sansRegular: string;
  sansSemiBold: string;
  monoRegular: string;
}

let pdfFontsPromise: Promise<PdfFonts> | null = null;

export function loadPdfFonts(): Promise<PdfFonts> {
  pdfFontsPromise ??= (async () => ({
    sansRegular: await fetchBase64(sansRegularTtf),
    sansSemiBold: await fetchBase64(sansSemiBoldTtf),
    monoRegular: await fetchBase64(monoRegularTtf),
  }))();
  return pdfFontsPromise;
}

let svgFontCssPromise: Promise<string> | null = null;

/** @font-face block with base64 woff2, embedded into standalone SVG/PNG exports. */
export function loadSvgFontCss(): Promise<string> {
  svgFontCssPromise ??= (async () => {
    const [sans400, sans600, mono400] = await Promise.all([
      fetchBase64(sansRegularWoff2),
      fetchBase64(sansSemiBoldWoff2),
      fetchBase64(monoRegularWoff2),
    ]);
    const face = (family: string, weight: string, b64: string) =>
      `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
    return [
      face('IBM Plex Sans', '400', sans400),
      face('IBM Plex Sans', '700', sans600),
      face('IBM Plex Mono', '400', mono400),
    ].join('\n');
  })();
  return svgFontCssPromise;
}
