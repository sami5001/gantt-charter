import Papa from 'papaparse';
import type { Milestone, Task } from './types';
import { uid } from './types';
import { parseISO } from './dates';

export interface CsvResult {
  tasks: Task[];
  milestones: Milestone[];
  errors: string[];
}

const HEADER_ALIASES: Record<string, string> = {
  task: 'name', name: 'name', title: 'name',
  start: 'start', 'start date': 'start', begin: 'start',
  finish: 'finish', end: 'finish', 'end date': 'finish', 'finish date': 'finish',
  resource: 'resource', assignee: 'resource', who: 'resource', owner: 'resource',
  phase: 'phase', group: 'phase', category: 'phase',
  description: 'description', notes: 'description',
  dependencies: 'dependencies', 'depends on': 'dependencies', predecessors: 'dependencies',
  type: 'type', date: 'date',
};

function normaliseDate(value: string, errors: string[], row: number, field: string): string {
  const v = value.trim();
  if (!v) return '';
  if (parseISO(v) !== null) return v;
  // Accept D/M/Y, M/D/Y (unambiguous only) and Y/M/D variants
  const parsed = Date.parse(v);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }
  errors.push(`Row ${row}: could not read ${field} date "${v}". Use YYYY-MM-DD.`);
  return '';
}

export function parseCsv(content: string): CsvResult {
  const errors: string[] = [];
  const tasks: Task[] = [];
  const milestones: Milestone[] = [];
  const pendingDeps: { task: Task; names: string[] }[] = [];

  const result = Papa.parse<Record<string, string>>(content.trim(), {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => HEADER_ALIASES[h.trim().toLowerCase()] ?? h.trim().toLowerCase(),
  });
  for (const err of result.errors.slice(0, 3)) {
    errors.push(`Line ${(err.row ?? 0) + 2}: ${err.message}`);
  }

  result.data.forEach((row, i) => {
    const rowNo = i + 2; // 1-based + header row
    const name = (row.name ?? '').trim();
    const type = (row.type ?? '').trim().toLowerCase();
    if (!name) {
      errors.push(`Row ${rowNo}: missing task name, skipped.`);
      return;
    }
    if (type === 'milestone') {
      const date = normaliseDate(row.date || row.start || '', errors, rowNo, 'milestone');
      if (!date) return;
      milestones.push({ id: uid(), name, date, description: row.description?.trim() || undefined });
      return;
    }
    const start = normaliseDate(row.start ?? '', errors, rowNo, 'start');
    const finish = normaliseDate(row.finish ?? '', errors, rowNo, 'finish') || start;
    if (!start) {
      errors.push(`Row ${rowNo}: "${name}" has no start date, skipped.`);
      return;
    }
    const task: Task = {
      id: uid(),
      name,
      start,
      finish,
      resource: row.resource?.trim() || undefined,
      phase: row.phase?.trim() || undefined,
      description: row.description?.trim() || undefined,
    };
    const depNames = (row.dependencies ?? '').split(';').map((s) => s.trim()).filter(Boolean);
    if (depNames.length > 0) pendingDeps.push({ task, names: depNames });
    tasks.push(task);
  });

  // Resolve dependency names to task or milestone ids (case-insensitive)
  for (const { task, names } of pendingDeps) {
    const ids: string[] = [];
    for (const depName of names) {
      const target =
        tasks.find((t) => t.name.trim().toLowerCase() === depName.toLowerCase()) ??
        milestones.find((m) => m.name.trim().toLowerCase() === depName.toLowerCase());
      if (target && target.id !== task.id) ids.push(target.id);
      else errors.push(`"${task.name}": unknown dependency "${depName}" ignored.`);
    }
    if (ids.length > 0) task.dependsOn = ids;
  }

  if (tasks.length === 0 && milestones.length === 0 && errors.length === 0) {
    errors.push('No rows found. Expected columns: Task, Start, Finish, Resource, Phase.');
  }
  return { tasks, milestones, errors };
}

export function tasksToCsv(tasks: Task[], milestones: Milestone[]): string {
  const nameOf = (id: string) =>
    tasks.find((t) => t.id === id)?.name ?? milestones.find((m) => m.id === id)?.name ?? '';
  const rows = [
    ['Type', 'Task', 'Start', 'Finish', 'Resource', 'Phase', 'Dependencies', 'Description'],
    ...tasks.map((t) => [
      'task', t.name, t.start, t.finish, t.resource ?? '', t.phase ?? '',
      (t.dependsOn ?? []).map(nameOf).filter(Boolean).join('; '),
      t.description ?? '',
    ]),
    ...milestones.map((m) => ['milestone', m.name, m.date, '', '', '', '', m.description ?? '']),
  ];
  return Papa.unparse(rows);
}

export const CSV_TEMPLATE = [
  'Type,Task,Start,Finish,Resource,Phase,Dependencies,Description',
  'task,Literature review,2026-01-05,2026-02-13,Researcher,Preparation,,Survey existing work',
  'task,Data collection,2026-02-16,2026-04-10,Research assistant,Fieldwork,Literature review,',
  'task,Analysis,2026-04-13,2026-05-29,Researcher,Analysis,Data collection,',
  'milestone,Ethics approval,2026-02-02,,,,,Approval received',
].join('\n');
