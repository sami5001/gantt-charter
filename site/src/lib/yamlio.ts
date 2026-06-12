/**
 * YAML import/export, schema-compatible with the Python CLI
 * (data/gantt_template.yaml): project / config / tasks / milestones.
 */
import yaml from 'js-yaml';
import type { Milestone, ProjectState, Task } from './types';
import { DEFAULT_CONFIG, uid } from './types';
import { PALETTES } from './palettes';

export interface YamlResult {
  state: ProjectState | null;
  errors: string[];
}

function asDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'string') return v.trim();
  return '';
}

export function parseYaml(content: string): YamlResult {
  const errors: string[] = [];
  let doc: any;
  try {
    doc = yaml.load(content);
  } catch (e) {
    return { state: null, errors: [`Not valid YAML: ${(e as Error).message.split('\n')[0]}`] };
  }
  if (!doc || typeof doc !== 'object') {
    return { state: null, errors: ['The YAML file is empty or not a mapping.'] };
  }

  const tasks: Task[] = [];
  const pendingDeps: { task: Task; names: string[] }[] = [];
  for (const t of Array.isArray(doc.tasks) ? doc.tasks : []) {
    if (!t || typeof t !== 'object') continue;
    const name = String(t.name ?? '').trim();
    const start = asDate(t.start);
    const finish = asDate(t.finish) || start;
    if (!name || !start) {
      errors.push(`Skipped task "${name || '(unnamed)'}": needs name and start.`);
      continue;
    }
    const task: Task = {
      id: uid(),
      name,
      start,
      finish,
      resource: t.resource ? String(t.resource) : undefined,
      phase: t.phase ? String(t.phase) : undefined,
      description: t.description ? String(t.description) : undefined,
    };
    if (Array.isArray(t.dependencies) && t.dependencies.length > 0) {
      pendingDeps.push({ task, names: t.dependencies.map(String) });
    }
    tasks.push(task);
  }

  const milestones: Milestone[] = [];
  for (const m of Array.isArray(doc.milestones) ? doc.milestones : []) {
    if (!m || typeof m !== 'object') continue;
    const name = String(m.name ?? '').trim();
    const date = asDate(m.date);
    if (!name || !date) continue;
    milestones.push({ id: uid(), name, date, description: m.description ? String(m.description) : undefined });
  }

  // Resolve dependency names (the YAML schema references tasks and
  // milestones by name)
  for (const { task, names } of pendingDeps) {
    const ids = names
      .map((n) => {
        const key = n.trim().toLowerCase();
        return (
          tasks.find((t) => t.name.trim().toLowerCase() === key)?.id ??
          milestones.find((m) => m.name.trim().toLowerCase() === key)?.id
        );
      })
      .filter((id): id is string => Boolean(id) && id !== task.id);
    if (ids.length > 0) task.dependsOn = ids;
  }

  if (tasks.length === 0) {
    errors.push('No usable tasks found under the "tasks:" key.');
    return { state: null, errors };
  }

  const paletteId = String(doc.config?.palette ?? '').toLowerCase();
  const state: ProjectState = {
    tasks,
    milestones,
    config: {
      ...DEFAULT_CONFIG,
      title: String(doc.project?.title ?? DEFAULT_CONFIG.title),
      subtitle: String(doc.project?.description ?? ''),
      paletteId: PALETTES.some((p) => p.id === paletteId) ? paletteId : DEFAULT_CONFIG.paletteId,
    },
  };
  return { state, errors };
}

export function toYaml(state: ProjectState): string {
  const doc = {
    project: {
      title: state.config.title,
      description: state.config.subtitle || undefined,
    },
    config: {
      palette: state.config.paletteId,
    },
    tasks: state.tasks.map((t) => ({
      name: t.name,
      start: t.start,
      finish: t.finish,
      ...(t.resource ? { resource: t.resource } : {}),
      ...(t.phase ? { phase: t.phase } : {}),
      ...(t.description ? { description: t.description } : {}),
      ...(t.dependsOn?.length
        ? {
            dependencies: t.dependsOn
              .map(
                (id) =>
                  state.tasks.find((x) => x.id === id)?.name ??
                  state.milestones.find((m) => m.id === id)?.name
              )
              .filter(Boolean),
          }
        : {}),
    })),
    ...(state.milestones.length > 0
      ? {
          milestones: state.milestones.map((m) => ({
            name: m.name,
            date: m.date,
            ...(m.description ? { description: m.description } : {}),
          })),
        }
      : {}),
  };
  return yaml.dump(doc, { lineWidth: 100, quotingType: '"' });
}
