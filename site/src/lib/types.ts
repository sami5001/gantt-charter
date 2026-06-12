export interface Task {
  id: string;
  name: string;
  /** ISO date, YYYY-MM-DD */
  start: string;
  /** ISO date, YYYY-MM-DD (inclusive) */
  finish: string;
  resource?: string;
  phase?: string;
  description?: string;
  /** ids of tasks this one depends on */
  dependsOn?: string[];
}

export interface Milestone {
  id: string;
  name: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  description?: string;
}

export type PaperSize = 'a4' | 'letter';
export type Orientation = 'landscape' | 'portrait';
export type ColorBy = 'resource' | 'phase';
export type ChartStyle = 'light' | 'dark';

export interface ChartConfig {
  title: string;
  subtitle: string;
  caption: string;
  paper: PaperSize;
  orientation: Orientation;
  paletteId: string;
  colorBy: ColorBy;
  showLegend: boolean;
  showToday: boolean;
  showGrid: boolean;
  /** Ink scheme of the chart itself (independent of the UI theme). */
  chartStyle: ChartStyle;
  /** Omit the page background in SVG/PNG exports. */
  transparentBg: boolean;
}

export interface ProjectState {
  tasks: Task[];
  milestones: Milestone[];
  config: ChartConfig;
}

export const DEFAULT_CONFIG: ChartConfig = {
  title: 'Project Timeline',
  subtitle: '',
  caption: '',
  paper: 'a4',
  orientation: 'landscape',
  paletteId: 'professional',
  colorBy: 'resource',
  showLegend: true,
  showToday: false,
  showGrid: true,
  chartStyle: 'light',
  transparentBg: false,
};

let counter = 0;
export function uid(): string {
  counter += 1;
  return `${Date.now().toString(36)}-${counter.toString(36)}`;
}
