/** Local calendar helpers — all dates use the user's local timezone. */

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, day] = iso.split("-").map(Number);
  return new Date(y, m - 1, day, 12, 0, 0, 0);
}

export function compareISODate(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function normalizeRange(
  start: string,
  end: string
): { start: string; end: string } {
  return compareISODate(start, end) <= 0
    ? { start, end }
    : { start: end, end: start };
}

export function isInRange(iso: string, start: string, end: string): boolean {
  const { start: s, end: e } = normalizeRange(start, end);
  return compareISODate(iso, s) >= 0 && compareISODate(iso, e) <= 0;
}

export function addDays(iso: string, delta: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + delta);
  return toISODate(d);
}

export function monthKey(year: number, monthIndex: number): string {
  return `${year}-${pad2(monthIndex + 1)}`;
}

export type GridCell = {
  iso: string;
  inMonth: boolean;
  date: Date;
};

export function buildMonthGrid(year: number, monthIndex: number): GridCell[] {
  const first = new Date(year, monthIndex, 1, 12, 0, 0, 0);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const grid: GridCell[] = [];
  const lead = startDay;
  for (let i = lead - 1; i >= 0; i--) {
    const d = new Date(year, monthIndex, -i, 12, 0, 0, 0);
    grid.push({ iso: toISODate(d), inMonth: false, date: d });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, monthIndex, day, 12, 0, 0, 0);
    grid.push({ iso: toISODate(d), inMonth: true, date: d });
  }
  while (grid.length % 7 !== 0 || grid.length < 42) {
    const last = grid[grid.length - 1].date;
    const next = new Date(
      last.getFullYear(),
      last.getMonth(),
      last.getDate() + 1,
      12,
      0,
      0,
      0
    );
    grid.push({ iso: toISODate(next), inMonth: false, date: next });
  }
  while (grid.length < 42) {
    const last = grid[grid.length - 1].date;
    const next = new Date(
      last.getFullYear(),
      last.getMonth(),
      last.getDate() + 1,
      12,
      0,
      0,
      0
    );
    grid.push({ iso: toISODate(next), inMonth: false, date: next });
  }
  return grid.slice(0, 42);
}

export function listDaysInRange(start: string, end: string): string[] {
  const { start: s, end: e } = normalizeRange(start, end);
  const out: string[] = [];
  let cur = s;
  while (compareISODate(cur, e) <= 0) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}
