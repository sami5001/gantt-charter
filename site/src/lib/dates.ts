const DAY = 86_400_000;

export function parseISO(date: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const t = Date.parse(`${date}T00:00:00Z`);
  return Number.isNaN(t) ? null : t;
}

export function toISO(t: number): string {
  return new Date(t).toISOString().slice(0, 10);
}

export function daysBetween(a: number, b: number): number {
  return Math.round((b - a) / DAY);
}

export function addDays(t: number, days: number): number {
  return t + days * DAY;
}

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function monthShort(t: number): string {
  return MONTHS_SHORT[new Date(t).getUTCMonth()];
}

export function yearOf(t: number): number {
  return new Date(t).getUTCFullYear();
}

export function dayOfMonth(t: number): number {
  return new Date(t).getUTCDate();
}

/** "8 Jan 2026" */
export function formatHuman(t: number): string {
  const d = new Date(t);
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Start of the month containing t. */
export function floorMonth(t: number): number {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}

/** Start of the month after the one containing t (exclusive ceiling). */
export function ceilMonth(t: number): number {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
}

export function addMonths(t: number, n: number): number {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1);
}

/** Monday on or before t. */
export function floorWeek(t: number): number {
  const d = new Date(t);
  const dow = (d.getUTCDay() + 6) % 7; // Monday = 0
  return addDays(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), -dow);
}

/** ISO 8601 week number (1..53). */
export function isoWeek(t: number): number {
  const d = new Date(t);
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7; // Monday = 0
  target.setUTCDate(target.getUTCDate() - dayNr + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstDayNr = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNr + 3);
  return 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
}

export function todayUTC(): number {
  const d = new Date();
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}
