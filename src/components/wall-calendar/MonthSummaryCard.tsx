"use client";

import { motion } from "framer-motion";
import { CalendarRange, ClipboardList, Sparkles } from "lucide-react";
import { listDaysInRange, normalizeRange, pad2 } from "@/lib/calendar-utils";
import { getHolidayLabel } from "@/lib/holidays-events";
import type { SeasonPalette } from "@/lib/season-theme";
import type { NoteEntry, SelectionState } from "@/types/wall-calendar";

type Props = {
  palette: SeasonPalette;
  selection: SelectionState;
  totalNotes: number;
  year: number;
  monthIndex: number;
  notes: NoteEntry[];
};

export function MonthSummaryCard({
  palette,
  selection,
  totalNotes,
  year,
  monthIndex,
  notes,
}: Props) {
  const prefix = `${year}-${pad2(monthIndex + 1)}`;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const range =
    selection.start && selection.end
      ? normalizeRange(selection.start, selection.end)
      : null;
  const rangeDayCount =
    range != null ? listDaysInRange(range.start, range.end).length : 0;

  const notesInSelection = range
    ? notes.filter(
        (n) =>
          n.scope.kind === "range" &&
          n.scope.start === range.start &&
          n.scope.end === range.end
      ).length
    : selection.start && !selection.end
      ? notes.filter((n) => n.scope.kind === "day" && n.scope.key === selection.start)
          .length
      : 0;

  const holidayHits: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${prefix}-${pad2(day)}`;
    const label = getHolidayLabel(iso);
    if (label) holidayHits.push(`${iso}: ${label}`);
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-black/6 bg-white/75 p-4 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/75 sm:p-5"
      style={{
        boxShadow: `0 18px 40px -20px ${palette.accentSoft}`,
      }}
    >
      <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-3 dark:border-zinc-700/80">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
          style={{ background: palette.accent }}
        >
          <ClipboardList className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Month snapshot
          </p>
          <p className="font-serif text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            At a glance
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-start justify-between gap-3">
          <dt className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <CalendarRange className="h-4 w-4 shrink-0" />
            Selection
          </dt>
          <dd className="max-w-[55%] text-right font-medium leading-snug text-zinc-900 dark:text-zinc-100">
            {range
              ? `${range.start} → ${range.end} · ${rangeDayCount}d`
              : selection.start
                ? `${selection.start} (pick end)`
                : "None"}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="text-zinc-500 dark:text-zinc-400">Notes in view</dt>
          <dd className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {notesInSelection}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="text-zinc-500 dark:text-zinc-400">All notes</dt>
          <dd className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {totalNotes}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Sparkles className="h-4 w-4" />
            Important dates
          </dt>
          <dd className="mt-1 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
            {holidayHits.length === 0 ? (
              <span className="text-zinc-400">No preset holidays this month</span>
            ) : (
              holidayHits.slice(0, 5).map((h) => (
                <div key={h} className="truncate" title={h}>
                  {h}
                </div>
              ))
            )}
          </dd>
        </div>
      </dl>
    </motion.div>
  );
}
