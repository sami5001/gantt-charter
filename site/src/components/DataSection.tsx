import { useRef, useState } from 'react';
import { DownloadSimpleIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import type { ProjectState } from '../lib/types';
import { parseCsv, tasksToCsv, CSV_TEMPLATE } from '../lib/csv';
import { parseYaml, toYaml } from '../lib/yamlio';
import { Btn, SectionLabel } from './ui';

interface Props {
  state: ProjectState;
  onImport: (state: ProjectState) => void;
}

function downloadText(content: string, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function DataSection({ state, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFile = async (file: File) => {
    if (/\.xlsx?$/i.test(file.name)) {
      // SheetJS loads lazily; Excel files become CSV and reuse the same parser.
      try {
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(await file.arrayBuffer());
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!sheet) throw new Error('The workbook has no sheets.');
        const { tasks, milestones, errors: errs } = parseCsv(XLSX.utils.sheet_to_csv(sheet));
        setErrors(errs.slice(0, 6));
        if (tasks.length > 0 || milestones.length > 0) {
          onImport({ tasks, milestones, config: state.config });
        }
      } catch (e) {
        setErrors([`Could not read the Excel file: ${(e as Error).message}`]);
      }
      return;
    }
    const content = await file.text();
    const isYaml = /\.ya?ml$/i.test(file.name);
    if (isYaml) {
      const { state: imported, errors: errs } = parseYaml(content);
      setErrors(errs.slice(0, 6));
      if (imported) {
        onImport({ ...imported, config: { ...state.config, ...imported.config } });
      }
    } else {
      const { tasks, milestones, errors: errs } = parseCsv(content);
      setErrors(errs.slice(0, 6));
      if (tasks.length > 0 || milestones.length > 0) {
        onImport({ tasks, milestones, config: state.config });
      }
    }
  };

  const hasData = state.tasks.length > 0;

  return (
    <section className="flex flex-col gap-2">
      <SectionLabel>Data</SectionLabel>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.xlsx,.xls,.yaml,.yml,text/csv"
        className="sr-only"
        aria-label="Import CSV, Excel or YAML file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />
      <div className="flex flex-wrap gap-1.5">
        <Btn onClick={() => fileRef.current?.click()} variant="secondary">
          <UploadSimpleIcon size={13} weight="bold" /> Import CSV, Excel or YAML
        </Btn>
        <Btn
          onClick={() => downloadText(CSV_TEMPLATE, 'gantt-template.csv', 'text/csv')}
          variant="ghost"
          title="Download a CSV file showing the expected columns"
        >
          CSV template
        </Btn>
      </div>
      {hasData && (
        <div className="flex flex-wrap gap-1.5">
          <Btn
            onClick={() => downloadText(tasksToCsv(state.tasks, state.milestones), 'gantt-data.csv', 'text/csv')}
            variant="ghost"
          >
            <DownloadSimpleIcon size={13} weight="bold" /> Save as CSV
          </Btn>
          <Btn
            onClick={() => downloadText(toYaml(state), 'gantt-data.yaml', 'text/yaml')}
            variant="ghost"
            title="YAML in the same format the Python CLI reads"
          >
            <DownloadSimpleIcon size={13} weight="bold" /> Save as YAML
          </Btn>
        </div>
      )}
      {errors.length > 0 && (
        <div className="rounded-md bg-accent-wash px-3 py-2" role="alert">
          <ul className="flex list-none flex-col gap-0.5">
            {errors.map((err, i) => (
              <li key={i} className="text-[12px] leading-snug text-accent-deep">
                {err}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-1 text-[11px] font-medium text-accent-deep underline underline-offset-2"
            onClick={() => setErrors([])}
          >
            Dismiss
          </button>
        </div>
      )}
    </section>
  );
}
