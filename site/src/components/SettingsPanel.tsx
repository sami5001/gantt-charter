import type { ChartConfig } from '../lib/types';
import { PALETTES, getPalette } from '../lib/palettes';
import { Field, SectionLabel, Segmented, Toggle } from './ui';

interface Props {
  config: ChartConfig;
  onChange: (patch: Partial<ChartConfig>) => void;
}

export function ProjectSection({ config, onChange }: Props) {
  return (
    <section className="flex flex-col gap-2.5">
      <SectionLabel>Project</SectionLabel>
      <Field label="Title">
        <input
          className="field"
          value={config.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Project Timeline"
        />
      </Field>
      <Field label="Subtitle (defaults to the date range)">
        <input
          className="field"
          value={config.subtitle}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          placeholder="Auto"
        />
      </Field>
      <Field label="Caption (small print under the chart)">
        <input
          className="field"
          value={config.caption}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="None"
        />
      </Field>
    </section>
  );
}

export function AppearanceSection({ config, onChange }: Props) {
  const palette = getPalette(config.paletteId);
  return (
    <section className="flex flex-col gap-2.5">
      <SectionLabel>Appearance</SectionLabel>
      <Field label="Colour palette">
        <select
          className="field cursor-pointer"
          value={config.paletteId}
          onChange={(e) => onChange({ paletteId: e.target.value })}
        >
          {PALETTES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}: {p.note}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex h-4 overflow-hidden rounded" aria-hidden>
        {palette.colors.map((c) => (
          <span key={c} className="flex-1" style={{ background: c }} />
        ))}
      </div>
      <Field label="Colour tasks by">
        <Segmented
          label="Colour tasks by"
          value={config.colorBy}
          options={[
            { value: 'resource', label: 'Resource' },
            { value: 'phase', label: 'Phase' },
          ]}
          onChange={(colorBy) => onChange({ colorBy })}
        />
      </Field>
      <div className="flex flex-col">
        <Toggle checked={config.showLegend} onChange={(showLegend) => onChange({ showLegend })} label="Legend" />
        <Toggle checked={config.showGrid} onChange={(showGrid) => onChange({ showGrid })} label="Gridlines" />
        <Toggle checked={config.showToday} onChange={(showToday) => onChange({ showToday })} label="Today marker" />
      </div>
    </section>
  );
}

export function PageSection({ config, onChange }: Props) {
  return (
    <section className="flex flex-col gap-2.5">
      <SectionLabel>Page</SectionLabel>
      <div className="grid grid-cols-2 gap-1.5">
        <Field label="Paper">
          <Segmented
            label="Paper size"
            value={config.paper}
            options={[
              { value: 'a4', label: 'A4' },
              { value: 'letter', label: 'Letter' },
            ]}
            onChange={(paper) => onChange({ paper })}
          />
        </Field>
        <Field label="Orientation">
          <Segmented
            label="Orientation"
            value={config.orientation}
            options={[
              { value: 'landscape', label: 'Landscape' },
              { value: 'portrait', label: 'Portrait' },
            ]}
            onChange={(orientation) => onChange({ orientation })}
          />
        </Field>
      </div>
    </section>
  );
}
