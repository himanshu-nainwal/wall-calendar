"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CornerDownRight,
  Sparkles,
} from "lucide-react";
import { buildMonthGrid, isInRange, normalizeRange } from "@/lib/calendar-utils";
import { getEventsForDay, getHolidayLabel } from "@/lib/holidays-events";
import type { SeasonPalette } from "@/lib/season-theme";
import type { SelectionState } from "@/types/wall-calendar";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = {
  year: number;
  monthIndex: number;
  palette: SeasonPalette;
  selection: SelectionState;
  todayIso: string;
  focusedIso: string | null;
  noteCountByDay: Record<string, number>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (iso: string) => void;
  onDayPointerDown: (iso: string) => void;
  onDayPointerEnter: (iso: string) => void;
  onDayDoubleClick: (iso: string) => void;
  isDragging: boolean;
  flipDirection: 1 | -1;
  gridRef: React.RefObject<HTMLDivElement | null>;
  onGridKeyDown: (e: React.KeyboardEvent) => void;
};

export function CalendarGrid({
  year,
  monthIndex,
  palette,
  selection,
  todayIso,
  focusedIso,
  noteCountByDay,
  onPrevMonth,
  onNextMonth,
  onDayClick,
  onDayPointerDown,
  onDayPointerEnter,
  onDayDoubleClick,
  isDragging,
  flipDirection,
  gridRef,
  onGridKeyDown,
}: Props) {
  const cells = buildMonthGrid(year, monthIndex);
  const monthName = new Date(year, monthIndex, 1).toLocaleString("default", {
    month: "long",
  });

  const rangeActive = selection.start && selection.end;
  const { start: rs, end: re } =
    selection.start && selection.end
      ? normalizeRange(selection.start, selection.end)
      : { start: null, end: null };

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -top-3 left-1/2 z-20 flex -translate-x-1/2 gap-2"
        aria-hidden
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-4 w-4 rounded-full border border-black/20 bg-gradient-to-b from-zinc-200 to-zinc-400 shadow-md dark:border-white/20 dark:from-zinc-600 dark:to-zinc-800"
            style={{ boxShadow: `0 0 0 2px ${palette.ring}` }}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-black/8 bg-white/70 p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.2)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/70 dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] sm:p-5 md:p-6">
        <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3">
          <div
            className="absolute -left-1 top-1/2 hidden h-12 w-3 -translate-y-1/2 rounded-r-md shadow-md md:block"
            style={{
              background: `linear-gradient(180deg, ${palette.ribbon}, ${palette.accent})`,
            }}
            aria-hidden
          />
          <div className="flex min-w-0 items-center gap-2 pl-0 md:pl-4">
            <CornerDownRight
              className="hidden h-5 w-5 shrink-0 opacity-40 sm:block"
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Month at a glance
              </p>
              <h2 className="truncate font-serif text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {monthName}{" "}
                <span className="font-sans text-lg font-normal text-zinc-500 dark:text-zinc-400">
                  {year}
                </span>
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={onPrevMonth}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white/90 text-zinc-800 shadow-sm transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wc-focus)] dark:border-white/10 dark:bg-zinc-800/90 dark:text-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={onNextMonth}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white/90 text-zinc-800 shadow-sm transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wc-focus)] dark:border-white/10 dark:bg-zinc-800/90 dark:text-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        <motion.div
          key={`${year}-${monthIndex}`}
          initial={{ rotateY: flipDirection * -12, opacity: 0.65 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ perspective: 1200, transformStyle: "preserve-3d" }}
          ref={gridRef}
          tabIndex={0}
          role="application"
          aria-label={`Calendar grid for ${monthName} ${year}`}
          onKeyDown={onGridKeyDown}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[var(--wc-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900 rounded-xl"
        >
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {WEEKDAYS.map((d, i) => (
              <div
                key={d}
                className={`pb-1 text-center text-[10px] font-bold uppercase tracking-wider sm:text-xs ${
                  i === 0 || i === 6
                    ? "text-amber-700/80 dark:text-amber-300/90"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {d}
              </div>
            ))}
            {cells.map((cell) => {
              const { iso, inMonth } = cell;
              const dow = cell.date.getDay();
              const weekend = dow === 0 || dow === 6;
              const isToday = iso === todayIso;
              const holiday = getHolidayLabel(iso);
              const events = getEventsForDay(iso);
              const tip = [
                holiday,
                ...events.map((ev) => ev.title),
              ]
                .filter(Boolean)
                .join(" · ");
              const inSel =
                rangeActive &&
                rs &&
                re &&
                isInRange(iso, rs, re);
              const isStart = rangeActive && iso === rs;
              const isEnd = rangeActive && iso === re;
              const noteCount = noteCountByDay[iso] ?? 0;
              const focused = focusedIso === iso;

              return (
                <motion.button
                  key={`${year}-${monthIndex}-${iso}`}
                  type="button"
                  data-date={iso}
                  title={
                    !inMonth
                      ? `Double-click to go to ${cell.date.toLocaleString("default", { month: "long", year: "numeric" })}`
                      : tip || undefined
                  }
                  onClick={() => {
                    if (!inMonth) return; // block single-click on overflow dates
                    onDayClick(iso);
                  }}
                  onDoubleClick={() => {
                    if (!inMonth) onDayDoubleClick(iso); // navigate on double-click
                  }}
                  onPointerDown={() => {
                    if (!inMonth) return; // no drag from overflow dates
                    onDayPointerDown(iso);
                  }}
                  onPointerEnter={() => onDayPointerEnter(iso)}
                  whileHover={{ scale: inMonth ? 1.02 : 1 }}
                  whileTap={{ scale: 0.97 }}
                  className={[
                    "group relative flex min-h-[44px] flex-col items-center justify-start rounded-xl border px-0.5 py-1.5 text-center transition-colors sm:min-h-[52px]",
                    !inMonth
                      ? "border-transparent bg-zinc-100/40 text-zinc-400 dark:bg-zinc-800/30 dark:text-zinc-600"
                      : weekend
                        ? "border-amber-200/50 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/25"
                        : "border-black/5 bg-white/50 dark:border-white/5 dark:bg-zinc-800/40",
                    isToday
                      ? "ring-2 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900"
                      : "",
                    inSel && inMonth
                      ? "z-[1] border-transparent"
                      : "",
                    focused
                      ? "z-[2] ring-2 ring-[var(--wc-focus)] ring-offset-2 ring-offset-white dark:ring-offset-zinc-900"
                      : "",
                    !inMonth
                      ? "cursor-zoom-in"
                      : isDragging
                        ? "cursor-grabbing"
                        : "cursor-pointer",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={
                    isToday
                      ? {
                          boxShadow: `0 0 0 2px ${palette.accent}`,
                          ...(inSel && inMonth
                            ? {
                                background: palette.accentSoft,
                              }
                            : {}),
                        }
                      : inSel && inMonth
                        ? {
                            background: palette.accentSoft,
                            boxShadow: `inset 0 0 0 1px ${palette.accent}33`,
                          }
                        : undefined
                  }
                >
                  {holiday && inMonth && (
                    <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-rose-500 shadow-sm" />
                  )}
                  <span
                    className={`text-sm font-semibold tabular-nums sm:text-base ${
                      inMonth
                        ? "text-zinc-900 dark:text-zinc-50"
                        : "text-zinc-400 dark:text-zinc-600"
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>
                  {isStart && inMonth && rangeActive && rs === re && (
                    <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wide text-[var(--wc-accent-text)]">
                      Day
                    </span>
                  )}
                  {isStart && inMonth && rangeActive && rs !== re && (
                    <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wide text-[var(--wc-accent-text)]">
                      Start
                    </span>
                  )}
                  {isEnd && inMonth && rangeActive && rs !== re && !isStart && (
                    <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wide text-[var(--wc-accent-text)]">
                      End
                    </span>
                  )}
                  {events.length > 0 && inMonth && (
                    <Sparkles className="mt-0.5 h-3 w-3 text-amber-500 opacity-80" />
                  )}
                  {noteCount > 0 && inMonth && (
                    <span className="mt-auto flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-zinc-900/90 px-1 text-[9px] font-bold text-white dark:bg-white dark:text-zinc-900">
                      {noteCount > 9 ? "9+" : noteCount}
                    </span>
                  )}
                  {holiday && inMonth && (
                    <span className="sr-only">Holiday: {holiday}</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
