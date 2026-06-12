import { useEffect, useMemo, useRef, useState } from 'react';
import { ChartBarHorizontalIcon } from '@phosphor-icons/react';
import type { ChartConfig, ProjectState } from '../lib/types';
import { DEFAULT_CONFIG } from '../lib/types';
import { parseISO } from '../lib/dates';
import { renderChart } from '../lib/renderer';
import { sampleProject } from '../lib/sample';
import { clearState, loadState, saveState } from '../lib/storage';
import { DataSection } from './DataSection';
import { ExportSection } from './ExportSection';
import { MilestoneList } from './MilestoneList';
import { Preview } from './Preview';
import { AppearanceSection, PageSection, ProjectSection } from './SettingsPanel';
import { TaskList } from './TaskList';
import HeaderActions from './HeaderActions';
import { Btn } from './ui';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

function emptyProject(): ProjectState {
  return { tasks: [], milestones: [], config: { ...DEFAULT_CONFIG } };
}

export default function App() {
  const [state, setState] = useState<ProjectState>(() => loadState() ?? emptyProject());
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) setFontsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced autosave
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveState(state), 400);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

  const patchConfig = (patch: Partial<ChartConfig>) =>
    setState((s) => ({ ...s, config: { ...s.config, ...patch } }));

  const hasChart = state.tasks.some((t) => {
    const t0 = parseISO(t.start);
    const t1 = parseISO(t.finish || t.start);
    return t.name.trim() && t0 !== null && t1 !== null && t1 >= t0;
  });

  const result = useMemo(
    () => renderChart(state.tasks, state.milestones, state.config),
    // fontsReady changes text metrics, so it must retrigger layout
    [state.tasks, state.milestones, state.config, fontsReady]
  );

  // Exporters can re-render with overrides (e.g. PDF forces a solid page).
  const renderWith = (overrides?: Partial<ChartConfig>) =>
    overrides ? renderChart(state.tasks, state.milestones, { ...state.config, ...overrides }) : result;

  const clearAll = () => {
    if (window.confirm('Clear all tasks, milestones and settings? This cannot be undone.')) {
      clearState();
      setState(emptyProject());
    }
  };

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-4">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
            <rect x="2" y="4" width="12" height="3.5" rx="1.25" fill="var(--color-ink-950)" />
            <rect x="6" y="9.25" width="14" height="3.5" rx="1.25" fill="var(--color-accent)" />
            <rect x="3.5" y="14.5" width="9" height="3.5" rx="1.25" fill="var(--color-ink-300)" />
          </svg>
          <h1 className="text-[15px] font-semibold tracking-tight">Gantt Charter</h1>
          <span className="mt-0.5 hidden text-[12px] text-ink-500 sm:block">
            print-quality project timelines
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="mr-2 hidden font-mono text-[11px] text-ink-400 lg:block">
            your data never leaves this browser
          </span>
          <nav className="mr-1 flex items-center gap-0.5">
            <a
              href={`${BASE}/guide/`}
              className="rounded-md px-2 py-1 text-[13px] text-ink-500 transition-colors duration-150 hover:bg-line-soft hover:text-ink-950"
            >
              Guide
            </a>
            <a
              href={`${BASE}/about/`}
              className="rounded-md px-2 py-1 text-[13px] text-ink-500 transition-colors duration-150 hover:bg-line-soft hover:text-ink-950"
            >
              About
            </a>
          </nav>
          <HeaderActions />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="editor-scroll order-2 flex w-full flex-col gap-6 overflow-y-auto border-r border-line bg-surface p-4 pb-10 lg:order-1 lg:w-[400px] lg:shrink-0">
          <DataSection state={state} onImport={setState} />
          <hr className="border-line-soft" />
          <ProjectSection config={state.config} onChange={patchConfig} />
          <hr className="border-line-soft" />
          <TaskList
            tasks={state.tasks}
            milestones={state.milestones}
            onChange={(tasks) => setState((s) => ({ ...s, tasks }))}
          />
          <hr className="border-line-soft" />
          <MilestoneList
            milestones={state.milestones}
            onChange={(milestones) =>
              setState((s) => {
                // Drop dependency links pointing at removed milestones
                const known = new Set([...s.tasks.map((t) => t.id), ...milestones.map((m) => m.id)]);
                return {
                  ...s,
                  milestones,
                  tasks: s.tasks.map((t) =>
                    t.dependsOn?.some((d) => !known.has(d))
                      ? { ...t, dependsOn: t.dependsOn.filter((d) => known.has(d)) }
                      : t
                  ),
                };
              })
            }
          />
          <hr className="border-line-soft" />
          <AppearanceSection config={state.config} onChange={patchConfig} />
          <hr className="border-line-soft" />
          <PageSection config={state.config} onChange={patchConfig} />
          <hr className="border-line-soft" />
          <ExportSection
            render={renderWith}
            config={state.config}
            onConfigChange={patchConfig}
            disabled={!hasChart}
          />
          {(state.tasks.length > 0 || state.milestones.length > 0) && (
            <>
              <hr className="border-line-soft" />
              <Btn variant="ghost" onClick={clearAll} className="self-start text-ink-500 hover:text-accent">
                Clear project
              </Btn>
            </>
          )}
        </aside>

        <main className="relative order-1 min-h-[46dvh] flex-1 lg:order-2 lg:min-h-0">
          {result.warnings.length > 0 && (
            <div className="absolute left-1/2 top-3 z-10 max-w-[min(90%,560px)] -translate-x-1/2 rounded-md bg-accent-wash px-3 py-1.5 shadow-sm">
              <p className="text-[12px] leading-snug text-accent-deep">{result.warnings[0]}</p>
            </div>
          )}
          <Preview
            svg={result.svg}
            width={result.width}
            height={result.height}
            config={state.config}
            empty={!hasChart}
            emptyState={
              <div className="flex max-w-[300px] flex-col items-center gap-3 text-center">
                <ChartBarHorizontalIcon size={32} weight="duotone" className="text-ink-300" />
                <div>
                  <h2 className="text-[15px] font-semibold text-ink-950">Start your timeline</h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
                    Add tasks in the side panel, import a CSV, or look around with the sample project.
                  </p>
                </div>
                <Btn variant="primary" onClick={() => setState(sampleProject())}>
                  Load sample project
                </Btn>
              </div>
            }
          />
        </main>
      </div>
    </div>
  );
}
