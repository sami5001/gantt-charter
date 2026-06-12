import type { ProjectState } from './types';
import { DEFAULT_CONFIG } from './types';

const KEY = 'gantt-charter:v1';

export function loadState(): ProjectState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProjectState;
    if (!Array.isArray(parsed.tasks) || !Array.isArray(parsed.milestones)) return null;
    return {
      tasks: parsed.tasks,
      milestones: parsed.milestones,
      config: { ...DEFAULT_CONFIG, ...parsed.config },
    };
  } catch {
    return null;
  }
}

export function saveState(state: ProjectState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable: the app still works, it just won't persist.
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
