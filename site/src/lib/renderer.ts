/**
 * Pure SVG Gantt renderer.
 *
 * Lays out a complete chart for a fixed paper size and returns an SVG string.
 * One rendering path serves the on-screen preview and every export format,
 * so what you see is exactly what prints.
 *
 * Typographic and chart rules follow print discipline: hairline gridlines,
 * no chartjunk, direct labels, solid (opacity-free) colours for reliable
 * PDF conversion. Supports a light and a dark ink scheme plus an optional
 * transparent background for SVG/PNG embedding.
 */
import type { ChartConfig, Milestone, Task } from './types';
import { paletteColors, luminance, darken, MILESTONE_COLOR } from './palettes';
import { pageGeometry } from './paper';
import {
  parseISO, addDays, daysBetween, floorMonth, ceilMonth, addMonths,
  floorWeek, isoWeek, monthShort, yearOf, dayOfMonth, formatHuman, todayUTC,
} from './dates';
import { truncate, type Measure, measureText } from './measure';

interface Scheme {
  paper: string;
  ink: string;
  soft: string;
  faint: string;
  grid: string;
  gridStrong: string;
  axis: string;
  milestone: string;
}

// Solid hex throughout (no opacity) for PDF fidelity.
const SCHEMES: Record<'light' | 'dark', Scheme> = {
  light: {
    paper: '#FFFFFF',
    ink: '#222933',
    soft: '#5B6370',
    faint: '#8C939F',
    grid: '#E8EAEE',
    gridStrong: '#CDD2D9',
    axis: '#B7BCC5',
    milestone: MILESTONE_COLOR,
  },
  dark: {
    paper: '#1B2128',
    ink: '#E9EBEE',
    soft: '#A8AFB9',
    faint: '#79818C',
    grid: '#2B323B',
    gridStrong: '#3D4550',
    axis: '#57616E',
    milestone: '#C9719F',
  },
};

const MARGIN = 48;
const SANS = 'IBM Plex Sans';
const MONO = 'IBM Plex Mono';

export interface RenderResult {
  svg: string;
  width: number;
  height: number;
  warnings: string[];
}

interface ValidTask extends Task {
  t0: number;
  t1: number; // exclusive end (finish + 1 day)
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface TextOpts {
  size: number;
  weight?: 'normal' | 'bold';
  mono?: boolean;
  fill: string;
  anchor?: 'start' | 'middle' | 'end';
}

function text(x: number, y: number, content: string, o: TextOpts): string {
  const family = o.mono ? MONO : SANS;
  const weight = o.weight === 'bold' ? ' font-weight="bold"' : '';
  const anchor = o.anchor && o.anchor !== 'start' ? ` text-anchor="${o.anchor}"` : '';
  return `<text x="${r2(x)}" y="${r2(y)}" font-family="${family}" font-size="${o.size}"${weight}${anchor} fill="${o.fill}">${esc(content)}</text>`;
}

function line(x1: number, y1: number, x2: number, y2: number, stroke: string, width = 1, dash?: string): string {
  const d = dash ? ` stroke-dasharray="${dash}"` : '';
  return `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="${stroke}" stroke-width="${width}"${d}/>`;
}

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Mix a hex colour toward a base colour (f = how much of the colour remains). */
function mix(hex: string, f: number, base = '#FFFFFF'): string {
  const c = hex.replace('#', '');
  const b = base.replace('#', '');
  const ch = [0, 2, 4].map((i) => {
    const v = parseInt(c.slice(i, i + 2), 16);
    const bv = parseInt(b.slice(i, i + 2), 16);
    const m = Math.round(bv + (v - bv) * f);
    return Math.max(0, Math.min(255, m)).toString(16).padStart(2, '0');
  });
  return `#${ch.join('')}`;
}

type TickUnit = 'week' | 'month' | 'quarter' | 'year';

interface Tick {
  t: number;
  label?: string;
}

function chooseUnit(rangeDays: number): TickUnit {
  if (rangeDays <= 84) return 'week';
  if (rangeDays <= 920) return 'month';
  if (rangeDays <= 2200) return 'quarter';
  return 'year';
}

export function renderChart(
  tasks: Task[],
  milestones: Milestone[],
  config: ChartConfig,
  measure: Measure = measureText
): RenderResult {
  const warnings: string[] = [];
  const page = pageGeometry(config.paper, config.orientation);
  const W = page.width;
  const H = page.height;
  const S = SCHEMES[config.chartStyle ?? 'light'];
  const dark = config.chartStyle === 'dark';

  // ---- Validate data ----
  const valid: ValidTask[] = [];
  for (const task of tasks) {
    const t0 = parseISO(task.start);
    const t1 = task.finish ? parseISO(task.finish) : t0;
    if (t0 === null || t1 === null || !task.name.trim()) {
      warnings.push(`Skipped "${task.name || 'unnamed task'}": missing or invalid dates.`);
      continue;
    }
    if (t1 < t0) {
      warnings.push(`Skipped "${task.name}": finish date is before start date.`);
      continue;
    }
    valid.push({ ...task, t0, t1: addDays(t1, 1) });
  }
  const validMilestones = milestones.filter((m) => {
    const ok = parseISO(m.date) !== null && m.name.trim();
    if (!ok && (m.name || m.date)) warnings.push(`Skipped milestone "${m.name || m.date}".`);
    return ok;
  });

  if (valid.length === 0) {
    return { svg: emptySvg(W, H, S, config.transparentBg), width: W, height: H, warnings };
  }

  // ---- Time range ----
  let tMin = Math.min(...valid.map((t) => t.t0));
  let tMax = Math.max(...valid.map((t) => t.t1));
  for (const m of validMilestones) {
    const t = parseISO(m.date)!;
    tMin = Math.min(tMin, t);
    tMax = Math.max(tMax, addDays(t, 1));
  }
  const unit = chooseUnit(daysBetween(tMin, tMax));
  if (unit === 'week') {
    tMin = floorWeek(tMin);
    tMax = addDays(floorWeek(addDays(tMax, 6)), 7);
  } else {
    tMin = floorMonth(tMin);
    tMax = ceilMonth(addDays(tMax, -1));
    if (unit === 'quarter' || unit === 'year') {
      // Extend to quarter/year boundaries. tMin and tMax are month starts here.
      const step = unit === 'quarter' ? 3 : 12;
      const d0 = new Date(tMin);
      tMin = Date.UTC(d0.getUTCFullYear(), Math.floor(d0.getUTCMonth() / step) * step, 1);
      const d1 = new Date(tMax);
      if (d1.getUTCMonth() % step !== 0) {
        tMax = Date.UTC(d1.getUTCFullYear(), Math.ceil(d1.getUTCMonth() / step) * step, 1);
      }
    }
  }

  // ---- Colour groups ----
  const groupOf = (t: Task) => (config.colorBy === 'phase' ? t.phase : t.resource)?.trim() || '';
  const groupNames: string[] = [];
  for (const t of valid) {
    const g = groupOf(t);
    if (g && !groupNames.includes(g)) groupNames.push(g);
  }
  const hasGroups = groupNames.length > 0;
  // Extended so every group gets its own colour even past the palette size
  const colors = paletteColors(config.paletteId, groupNames.length);
  const colorFor = (t: Task): string => {
    const g = groupOf(t);
    if (!g) return hasGroups ? S.faint : colors[0];
    return colors[groupNames.indexOf(g) % colors.length];
  };

  // ---- Vertical layout ----
  const contentW = W - MARGIN * 2;
  const titleSize = 19;
  const subtitleSize = 11;
  const subtitle = config.subtitle.trim() || `${formatHuman(tMin)} to ${formatHuman(addDays(tMax, -1))}`;

  // Legend (right-aligned, wraps; at most ~45% of content width per row)
  const legendItems = config.showLegend && hasGroups
    ? groupNames.map((g, i) => ({ label: g, color: colors[i % colors.length] }))
    : [];
  const legendSize = 9.5;
  const legendRows: { label: string; color: string }[][] = [];
  if (legendItems.length > 0) {
    const maxRowW = contentW * 0.45;
    let row: typeof legendItems = [];
    let rowW = 0;
    for (const item of legendItems) {
      const itemW = 9 + 6 + measure(item.label, legendSize) + 16;
      if (row.length > 0 && rowW + itemW > maxRowW) {
        legendRows.push(row);
        row = [];
        rowW = 0;
      }
      row.push(item);
      rowW += itemW;
    }
    if (row.length) legendRows.push(row);
  }

  const headerH = Math.max(46, 14 + legendRows.length * 16);
  const axisH = unit === 'year' || unit === 'quarter' ? 22 : 34;

  // Milestone lane: assign each label to the first row where it does not
  // collide with an earlier label, so clusters of long names stack instead
  // of overwriting each other. Uses a provisional horizontal scale (the
  // real one depends on the row height chosen below); positions are
  // recomputed exactly at draw time, only row assignment happens here.
  const msSorted = [...validMilestones]
    .map((m) => ({ ...m, t: parseISO(m.date)!, row: 0 }))
    .sort((a, b) => a.t - b.t);
  if (msSorted.length > 0) {
    const estLabelW = Math.min(Math.max(...valid.map((t) => measure(t.name, 10.5)), 40) + 14, contentW * 0.34);
    const estPlotX = MARGIN + estLabelW;
    const estPlotW = W - MARGIN - estPlotX;
    const ex = (t: number) => estPlotX + ((t - tMin) / (tMax - tMin)) * estPlotW;
    const rowEnds: number[] = [];
    for (const m of msSorted) {
      const mx = ex(addDays(m.t, 0.5));
      const lw = measure(m.name, 8.5);
      let x0 = mx - lw / 2;
      if (x0 < estPlotX) x0 = mx - 4;
      else if (mx + lw / 2 > W - MARGIN) x0 = mx + 4 - lw;
      const x1 = x0 + lw;
      let row = rowEnds.findIndex((end) => x0 >= end + 8);
      if (row === -1) {
        row = Math.min(rowEnds.length, 5);
        if (row === rowEnds.length) rowEnds.push(0);
      }
      rowEnds[row] = Math.max(rowEnds[row], x1);
      m.row = row;
    }
  }
  const msRowCount = msSorted.reduce((n, m) => Math.max(n, m.row + 1), 0);
  const msLaneH = msSorted.length > 0 ? 21 + msRowCount * 11 : 0;
  const captionH = config.caption.trim() ? 34 : 0;
  const plotTop = MARGIN + headerH + axisH + msLaneH;
  const maxPlotBottom = H - MARGIN - captionH;
  const maxPlotH = maxPlotBottom - plotTop;

  // Tasks repeated under the same name share one row: each occurrence
  // draws its own bar, so recurring work reads as several ranges on a
  // single line instead of duplicate rows.
  const rowIndexByName = new Map<string, number>();
  for (const t of valid) {
    const key = t.name.trim();
    if (!rowIndexByName.has(key)) rowIndexByName.set(key, rowIndexByName.size);
  }

  const n = rowIndexByName.size;
  // Cap row height so sparse charts end naturally instead of stretching
  // bars across the whole page; dense charts still fill it exactly.
  const rowH = Math.min(maxPlotH / n, 64);
  const plotBottom = plotTop + rowH * n;
  if (rowH < 12) {
    warnings.push(
      `${n} tasks is crowded for one ${page.label} ${config.orientation} page. Try landscape, fewer tasks, or a larger paper size.`
    );
  }
  const labelSize = rowH < 15 ? 9 : 10.5;
  const barH = Math.max(5, Math.min(18, rowH * 0.58));

  // ---- Label column ----
  const maxLabelW = Math.max(...valid.map((t) => measure(t.name, labelSize)), 40);
  const labelW = Math.min(maxLabelW + 14, contentW * 0.34);
  const plotX = MARGIN + labelW;
  const plotW = W - MARGIN - plotX;

  const x = (t: number) => plotX + ((t - tMin) / (tMax - tMin)) * plotW;

  // ---- Ticks ----
  const ticks: Tick[] = [];
  const bandSpans: { t0: number; t1: number; label: string }[] = [];
  if (unit === 'week') {
    for (let t = tMin; t <= tMax; t = addDays(t, 7)) {
      ticks.push({ t, label: t < tMax ? `${dayOfMonth(t)} ${monthShort(t)}` : undefined });
    }
    // Band above the week labels: month + year spans
    let spanStart = tMin;
    let key = `${yearOf(tMin)}-${new Date(tMin).getUTCMonth()}`;
    for (let t = tMin; t <= tMax; t = addDays(t, 7)) {
      const k = `${yearOf(t)}-${new Date(t).getUTCMonth()}`;
      if (t >= tMax || k !== key) {
        bandSpans.push({ t0: spanStart, t1: Math.min(t, tMax), label: `${monthShort(spanStart)} ${yearOf(spanStart)}` });
        spanStart = t;
        key = k;
      }
    }
  } else {
    const stepMonths = unit === 'month' ? 1 : unit === 'quarter' ? 3 : 12;
    for (let t = tMin; t <= tMax; t = addMonths(t, stepMonths)) {
      let label: string | undefined;
      if (t < tMax) {
        if (unit === 'month') label = monthShort(t);
        else if (unit === 'quarter') label = `Q${Math.floor(new Date(t).getUTCMonth() / 3) + 1} ${yearOf(t)}`;
        else label = String(yearOf(t));
      }
      ticks.push({ t, label });
    }
    if (unit === 'month') {
      // Year band above the month labels
      let spanStart = tMin;
      let year = yearOf(tMin);
      for (let t = tMin; t <= tMax; t = addMonths(t, 1)) {
        if (t >= tMax || yearOf(t) !== year) {
          bandSpans.push({ t0: spanStart, t1: Math.min(t, tMax), label: String(year) });
          spanStart = t;
          year = yearOf(t);
        }
      }
      if (bandSpans.length === 0) bandSpans.push({ t0: tMin, t1: tMax, label: String(yearOf(tMin)) });
    }
  }

  const tickWidth = ticks.length > 1 ? x(ticks[1].t) - x(ticks[0].t) : plotW;
  // Week mode: append ISO week numbers when there is room
  const showWeekNumbers = unit === 'week' && tickWidth >= 72;

  // ---- Build SVG ----
  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
  );
  if (!config.transparentBg) {
    parts.push(`<rect width="${W}" height="${H}" fill="${S.paper}"/>`);
  }

  // Header: title + subtitle
  const titleMaxW = legendRows.length > 0 ? contentW * 0.52 : contentW;
  parts.push(text(MARGIN, MARGIN + 16, truncate(config.title || 'Untitled timeline', titleMaxW, titleSize, 700, false, measure), {
    size: titleSize,
    weight: 'bold',
    fill: S.ink,
  }));
  parts.push(text(MARGIN, MARGIN + 34, truncate(subtitle, titleMaxW, subtitleSize, 400, true, measure), {
    size: subtitleSize,
    mono: true,
    fill: S.soft,
  }));

  // Legend, right-aligned
  legendRows.forEach((row, ri) => {
    const rowW = row.reduce((w, item) => w + 9 + 6 + measure(item.label, legendSize) + 16, -16);
    let lx = W - MARGIN - rowW;
    const ly = MARGIN + 8 + ri * 16;
    for (const item of row) {
      parts.push(`<rect x="${r2(lx)}" y="${r2(ly)}" width="9" height="9" rx="2" fill="${item.color}"/>`);
      parts.push(text(lx + 15, ly + 8, item.label, { size: legendSize, fill: S.soft }));
      lx += 9 + 6 + measure(item.label, legendSize) + 16;
    }
  });

  // ---- Axis ----
  const axisTop = MARGIN + headerH;
  const axisBaseline = axisTop + axisH;

  // Band row (years above months, or month-year above weeks)
  for (const span of bandSpans) {
    const cx = (x(span.t0) + x(span.t1)) / 2;
    if (x(span.t1) - x(span.t0) > measure(span.label, 9.5, 700) + 10) {
      parts.push(text(cx, axisTop + 11, span.label, { size: 9.5, weight: 'bold', anchor: 'middle', fill: S.soft }));
    }
  }

  // Unit labels + gridlines. Labels are measured and greedily skipped when
  // they would collide with the previous drawn label (narrow months, or
  // quarter/year labels on portrait pages).
  let lastLabelEnd = -Infinity;
  ticks.forEach((tick, i) => {
    const tx = x(tick.t);
    const isBandEdge =
      (unit === 'month' && (i === 0 || yearOf(tick.t) !== yearOf(ticks[Math.max(0, i - 1)].t))) ||
      (unit === 'week' && (i === 0 || new Date(tick.t).getUTCMonth() !== new Date(ticks[Math.max(0, i - 1)].t).getUTCMonth()));
    if (config.showGrid && i > 0 && i < ticks.length - 1) {
      parts.push(line(tx, axisBaseline, tx, plotBottom, isBandEdge ? S.gridStrong : S.grid, 1));
    }
    // Small tick marks on the axis
    parts.push(line(tx, axisBaseline - 4, tx, axisBaseline, S.axis, 1));
    if (tick.label) {
      const labelY = axisBaseline - 9;
      let label = tick.label;
      let lx: number;
      let anchor: 'start' | 'middle' = 'middle';
      if (unit === 'week') {
        label = showWeekNumbers ? `W${String(isoWeek(tick.t)).padStart(2, '0')} · ${tick.label}` : tick.label;
        lx = tx + 4;
        anchor = 'start';
      } else {
        const next = ticks[i + 1];
        lx = next ? (tx + x(next.t)) / 2 : tx;
      }
      const lw = measure(label, 8.5, 400, true);
      const x0 = anchor === 'start' ? lx : lx - lw / 2;
      if (x0 >= lastLabelEnd + 7) {
        parts.push(text(lx, labelY, label, { size: 8.5, mono: true, anchor, fill: S.soft }));
        lastLabelEnd = x0 + lw;
      }
    }
  });
  parts.push(line(plotX, axisBaseline, W - MARGIN, axisBaseline, S.axis, 1));

  // ---- Milestones ----
  if (msSorted.length > 0) {
    const laneY = axisBaseline + 6;
    // All diamonds share one baseline below the stacked label rows, so a
    // diamond can never sit on top of another milestone's label text.
    const dyc = laneY + msRowCount * 11 + 7;
    const s = 4.2;
    msSorted.forEach((m) => {
      const mx = x(addDays(m.t, 0.5)); // centre of the day
      const ly = laneY + m.row * 11;
      parts.push(line(mx, dyc + s, mx, plotBottom, mix(S.milestone, 0.45, S.paper), 1, '2 3'));
      parts.push(
        `<path d="M ${r2(mx)} ${r2(dyc - s)} L ${r2(mx + s)} ${r2(dyc)} L ${r2(mx)} ${r2(dyc + s)} L ${r2(mx - s)} ${r2(dyc)} Z" fill="${S.milestone}"/>`
      );
      // label, clamped to plot edges
      const lw = measure(m.name, 8.5);
      let anchor: 'start' | 'middle' | 'end' = 'middle';
      let lx = mx;
      if (mx - lw / 2 < plotX) {
        anchor = 'start';
        lx = mx - 4;
      } else if (mx + lw / 2 > W - MARGIN) {
        anchor = 'end';
        lx = mx + 4;
      }
      parts.push(text(lx, ly + 6, m.name, { size: 8.5, anchor, fill: S.milestone }));
    });
  }

  // ---- Task bars ----
  const rowGeo = new Map<string, { x0: number; x1: number; cy: number; row: number }>();
  const labelledRows = new Set<number>();
  valid.forEach((task) => {
    const row = rowIndexByName.get(task.name.trim())!;
    const cy = plotTop + rowH * row + rowH / 2;
    const color = colorFor(task);
    if (!labelledRows.has(row)) {
      labelledRows.add(row);
      const label = truncate(task.name, labelW - 14, labelSize, 400, false, measure);
      parts.push(text(plotX - 10, cy + labelSize * 0.34, label, { size: labelSize, anchor: 'end', fill: S.ink }));
    }

    const x0 = x(task.t0);
    const x1 = x(task.t1);
    rowGeo.set(task.id, { x0, x1, cy, row });
    const w = x1 - x0;
    if (task.t1 - task.t0 <= 86_400_000 && w < barH) {
      // Zero/one-day task: render as a solid diamond so it stays visible.
      const s = barH / 2 + 1;
      const cx = (x0 + x1) / 2;
      parts.push(
        `<path d="M ${r2(cx)} ${r2(cy - s)} L ${r2(cx + s)} ${r2(cy)} L ${r2(cx)} ${r2(cy + s)} L ${r2(cx - s)} ${r2(cy)} Z" fill="${color}"/>`
      );
    } else {
      // Keep bars visible when their colour is close to the page colour.
      const lum = luminance(color);
      let stroke = '';
      if (!dark && lum > 0.75) stroke = ` stroke="${darken(color, 0.3)}" stroke-width="0.75"`;
      if (dark && lum < 0.08) stroke = ` stroke="${mix(color, 0.55)}" stroke-width="0.75"`;
      parts.push(
        `<rect x="${r2(x0)}" y="${r2(cy - barH / 2)}" width="${r2(Math.max(w, 2))}" height="${r2(barH)}" rx="2" fill="${color}"${stroke}/>`
      );
    }
  });

  // ---- Dependency arrows ----
  const arrowStroke = S.faint;
  const milestoneX = new Map(msSorted.map((m) => [m.id, x(addDays(m.t, 0.5))]));
  for (const task of valid) {
    if (!task.dependsOn?.length) continue;
    const to = rowGeo.get(task.id)!;
    for (const depId of task.dependsOn) {
      const from = rowGeo.get(depId);
      if (!from && milestoneX.has(depId)) {
        // Task depends on a milestone: arrow from the milestone's guide
        // line into the bar start, along the task's own row.
        const mx = milestoneX.get(depId)!;
        if (mx <= to.x0 - 10) {
          parts.push(
            `<path d="M ${r2(mx)} ${r2(to.cy)} H ${r2(to.x0 - 3.5)}" fill="none" stroke="${arrowStroke}" stroke-width="1"/>`
          );
          parts.push(
            `<path d="M ${r2(to.x0 - 4.5)} ${r2(to.cy - 3)} L ${r2(to.x0 - 0.5)} ${r2(to.cy)} L ${r2(to.x0 - 4.5)} ${r2(to.cy + 3)} Z" fill="${arrowStroke}"/>`
          );
        }
        continue;
      }
      if (!from || depId === task.id) continue;
      const startX = from.x1;
      const startY = from.cy;
      const endX = to.x0;
      const endY = to.cy;
      if (Math.abs(endY - startY) < 1) continue; // same row, nothing useful to draw
      let d: string;
      if (endX >= startX + 14) {
        // Forward elbow: out, down/up, in.
        const elbowX = startX + 7;
        d = `M ${r2(startX)} ${r2(startY)} H ${r2(elbowX)} V ${r2(endY)} H ${r2(endX - 3.5)}`;
      } else {
        // Successor starts at/before the predecessor's finish: route around.
        const outX = startX + 7;
        const midY = endY > startY ? to.cy - rowH / 2 : to.cy + rowH / 2;
        const backX = endX - 9;
        d = `M ${r2(startX)} ${r2(startY)} H ${r2(outX)} V ${r2(midY)} H ${r2(backX)} V ${r2(endY)} H ${r2(endX - 3.5)}`;
      }
      parts.push(
        `<path d="${d}" fill="none" stroke="${arrowStroke}" stroke-width="1" stroke-linejoin="round"/>`
      );
      // Arrowhead pointing into the successor bar.
      parts.push(
        `<path d="M ${r2(endX - 4.5)} ${r2(endY - 3)} L ${r2(endX - 0.5)} ${r2(endY)} L ${r2(endX - 4.5)} ${r2(endY + 3)} Z" fill="${arrowStroke}"/>`
      );
    }
  }

  // ---- Today marker ----
  if (config.showToday) {
    const now = todayUTC();
    if (now >= tMin && now <= tMax) {
      const tx = x(now);
      parts.push(line(tx, axisBaseline, tx, plotBottom, S.soft, 1, '4 3'));
      const lw = measure('Today', 8);
      const left = tx + 5 + lw > W - MARGIN;
      parts.push(text(left ? tx - 5 : tx + 5, plotBottom - 5, 'Today', {
        size: 8,
        mono: true,
        fill: S.soft,
        anchor: left ? 'end' : 'start',
      }));
    }
  }

  // ---- Caption ----
  if (config.caption.trim()) {
    parts.push(text(MARGIN, plotBottom + 28, truncate(config.caption.trim(), contentW, 9.5, 400, false, measure), {
      size: 9.5,
      fill: S.faint,
    }));
  }

  parts.push('</svg>');
  return { svg: parts.join('\n'), width: W, height: H, warnings };
}

function emptySvg(w: number, h: number, scheme: Scheme, transparent: boolean): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    transparent ? '' : `<rect width="${w}" height="${h}" fill="${scheme.paper}"/>`,
    `</svg>`,
  ].join('\n');
}
