import { useState } from 'react';
import { FilePdfIcon, FilePngIcon, FileSvgIcon } from '@phosphor-icons/react';
import type { ChartConfig } from '../lib/types';
import type { RenderResult } from '../lib/renderer';
import { Btn, Field, SectionLabel, Segmented, Toggle } from './ui';

// Loaded on demand so jsPDF and svg2pdf stay out of the initial bundle.
const exporters = () => import('../lib/exporters');

interface Props {
  render: (overrides?: Partial<ChartConfig>) => RenderResult;
  config: ChartConfig;
  onConfigChange: (patch: Partial<ChartConfig>) => void;
  disabled: boolean;
}

type Busy = 'pdf' | 'svg' | 'png' | null;

export function ExportSection({ render, config, onConfigChange, disabled }: Props) {
  const [busy, setBusy] = useState<Busy>(null);
  const [scale, setScale] = useState<'2' | '3' | '4'>('3');
  const [error, setError] = useState<string | null>(null);

  const run = async (kind: Exclude<Busy, null>, fn: () => Promise<void>) => {
    setBusy(kind);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(`${kind.toUpperCase()} export failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="flex flex-col gap-2.5">
      <SectionLabel>Export</SectionLabel>

      <Field label="Chart style">
        <Segmented
          label="Chart style"
          value={config.chartStyle}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
          onChange={(chartStyle) => onConfigChange({ chartStyle })}
        />
      </Field>
      <Toggle
        checked={config.transparentBg}
        onChange={(transparentBg) => onConfigChange({ transparentBg })}
        label="Transparent background"
        hint="Applies to SVG and PNG. PDF always keeps a solid page."
      />

      <div className="flex flex-col gap-1.5">
        <Btn
          variant="accent"
          disabled={disabled}
          busy={busy === 'pdf'}
          onClick={() =>
            void run('pdf', async () => {
              // A PDF is a page, so it always gets a solid background.
              const r = render({ transparentBg: false });
              return (await exporters()).exportPdf(r.svg, r.width, r.height, config);
            })
          }
          title="Vector PDF at true paper size, fonts embedded"
        >
          <FilePdfIcon size={14} weight="bold" /> Export PDF
        </Btn>
        <div className="grid grid-cols-2 gap-1.5">
          <Btn
            variant="secondary"
            disabled={disabled}
            busy={busy === 'svg'}
            onClick={() =>
              void run('svg', async () => {
                const r = render();
                return (await exporters()).exportSvg(r.svg, config);
              })
            }
            title="Standalone vector SVG, fonts embedded"
          >
            <FileSvgIcon size={14} weight="bold" /> SVG
          </Btn>
          <Btn
            variant="secondary"
            disabled={disabled}
            busy={busy === 'png'}
            onClick={() =>
              void run('png', async () => {
                const r = render();
                return (await exporters()).exportPng(r.svg, r.width, r.height, config, Number(scale));
              })
            }
            title="High-resolution PNG"
          >
            <FilePngIcon size={14} weight="bold" /> PNG
          </Btn>
        </div>
        <Field label="PNG resolution">
          <Segmented
            label="PNG resolution"
            value={scale}
            options={[
              { value: '2', label: '2×' },
              { value: '3', label: '3×' },
              { value: '4', label: '4×' },
            ]}
            onChange={setScale}
          />
        </Field>
      </div>
      {error && (
        <p role="alert" className="rounded-md bg-accent-wash px-3 py-2 text-[12px] leading-snug text-accent-deep">
          {error}
        </p>
      )}
    </section>
  );
}
