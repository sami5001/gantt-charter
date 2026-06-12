import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { ChartConfig } from '../lib/types';

interface Props {
  svg: string;
  width: number;
  height: number;
  config: ChartConfig;
  empty: boolean;
  emptyState: ReactNode;
}

// Checkerboard shown behind transparent exports, tinted per chart style.
const CHECKER_LIGHT =
  'repeating-conic-gradient(#e4e6ea 0% 25%, #f4f5f7 0% 50%) 0 0 / 18px 18px';
const CHECKER_DARK =
  'repeating-conic-gradient(#262c34 0% 25%, #1b2128 0% 50%) 0 0 / 18px 18px';

export function Preview({ svg, width, height, config, empty, emptyState }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const fit = () => {
      const pad = 56;
      const s = Math.min((el.clientWidth - pad) / width, (el.clientHeight - pad) / height, 1);
      setScale(Math.max(s, 0.15));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);

  const darkChart = config.chartStyle === 'dark';
  const sheetBackground = config.transparentBg && !empty
    ? (darkChart ? CHECKER_DARK : CHECKER_LIGHT)
    : (darkChart && !empty ? '#1B2128' : '#FFFFFF');

  const paperLabel = config.paper === 'a4' ? 'A4' : 'Letter';
  const dims =
    config.paper === 'a4'
      ? config.orientation === 'landscape' ? '297 × 210 mm' : '210 × 297 mm'
      : config.orientation === 'landscape' ? '11 × 8.5 in' : '8.5 × 11 in';

  return (
    <div ref={containerRef} className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className="relative shrink-0 shadow-sheet"
        style={{ width: width * scale, height: height * scale, background: sheetBackground }}
      >
        {empty ? (
          // The empty sheet is always white paper; pin its tokens to light.
          <div data-theme="light" className="absolute inset-0 flex items-center justify-center">
            {emptyState}
          </div>
        ) : (
          <div
            style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}
            // The renderer only ever emits its own sanitised SVG.
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>
      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[11px] text-ink-400">
        {paperLabel} {config.orientation} · {dims} · {Math.round(scale * 100)}%
      </p>
    </div>
  );
}
