"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarClock,
  Download,
  Moon,
  Printer,
  Sun,
  Monitor,
  Search as SearchIcon,
  Undo2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addDays, monthKey, normalizeRange, toISODate } from "@/lib/calendar-utils";
import {
  loadPersistedState,
  savePersistedState,
  type PersistedCalendarState,
} from "@/lib/persistence";
import { seasonForMonth, seasonPalette } from "@/lib/season-theme";
import type { NoteEntry, SelectionState } from "@/types/wall-calendar";
import { CalendarGrid } from "./CalendarGrid";
import { HeroPanel } from "./HeroPanel";
import { MonthSummaryCard } from "./MonthSummaryCard";
import { NotesMemoPanel } from "./NotesMemoPanel";

const today = new Date();
const TODAY_ISO = toISODate(
  new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0)
);

function useMediaDark(): boolean {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const fn = () => setDark(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return dark;
}

function newNoteId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function WallCalendar() {
  const systemDark = useMediaDark();
  const [hydrated, setHydrated] = useState(false);
  const [themeMode, setThemeMode] =
    useState<PersistedCalendarState["themeMode"]>("system");
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [flipDirection, setFlipDirection] = useState<1 | -1>(1);

  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [monthlyMemos, setMonthlyMemos] = useState<Record<string, string>>({});

  const [selection, setSelection] = useState<SelectionState>({
    start: null,
    end: null,
  });
  const selectionRef = useRef(selection);
  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  const [undoStack, setUndoStack] = useState<SelectionState[]>([]);
  const preDragSelectionRef = useRef<SelectionState | null>(null);

  const dragRef = useRef<{
    active: boolean;
    anchor: string;
    moved: boolean;
    last: string;
  } | null>(null);
  const lastWasDrag = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [goOpen, setGoOpen] = useState(false);
  const [goYear, setGoYear] = useState(String(viewYear));
  const [goMonth, setGoMonth] = useState(String(viewMonth + 1));
  const [printMode, setPrintMode] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedIso, setFocusedIso] = useState<string | null>(TODAY_ISO);

  useEffect(() => {
    const s = loadPersistedState();
    queueMicrotask(() => {
      setNotes(s.notes);
      setMonthlyMemos(s.monthlyMemos);
      setThemeMode(s.themeMode);
      setHydrated(true);
    });
  }, []);

  const resolvedDark =
    themeMode === "system" ? systemDark : themeMode === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedDark);
  }, [resolvedDark]);

  useEffect(() => {
    document.documentElement.classList.toggle("print-mode", printMode);
  }, [printMode]);

  useEffect(() => {
    if (!hydrated) return;
    savePersistedState({ notes, monthlyMemos, themeMode });
  }, [notes, monthlyMemos, themeMode, hydrated]);

  const season = seasonForMonth(viewMonth);
  const palette = useMemo(
    () => seasonPalette(season, resolvedDark),
    [season, resolvedDark]
  );

  const mk = monthKey(viewYear, viewMonth);
  const monthlyMemo = monthlyMemos[mk] ?? "";

  const noteCountByDay = useMemo(() => {
    const m: Record<string, number> = {};
    for (const n of notes) {
      if (n.scope.kind === "day") {
        m[n.scope.key] = (m[n.scope.key] ?? 0) + 1;
      }
    }
    return m;
  }, [notes]);

  const pushUndo = useCallback((prev: SelectionState) => {
    setUndoStack((u) => [...u.slice(-9), prev]);
  }, []);

  const applySelection = useCallback(
    (next: SelectionState) => {
      setSelection((cur) => {
        pushUndo(cur);
        return next;
      });
    },
    [pushUndo]
  );

  const handleTapDay = useCallback((iso: string) => {
    setSelection((cur) => {
      if (cur.start && cur.end) {
        if (cur.start === cur.end && cur.start === iso) {
          pushUndo(cur);
          return { start: null, end: null };
        }
        pushUndo(cur);
        return { start: iso, end: null };
      }
      if (!cur.start) {
        pushUndo(cur);
        return { start: iso, end: null };
      }
      if (cur.start && !cur.end) {
        if (cur.start === iso) {
          pushUndo(cur);
          return { start: null, end: null };
        }
        pushUndo(cur);
        return { start: cur.start, end: iso };
      }
      return cur;
    });
    setFocusedIso(iso);
  }, [pushUndo]);

  const onDayPointerDown = useCallback((iso: string) => {
    preDragSelectionRef.current = { ...selectionRef.current };
    dragRef.current = { active: true, anchor: iso, moved: false, last: iso };
    setIsDragging(true);
  }, []);

  const onDayPointerEnter = useCallback((iso: string) => {
    const d = dragRef.current;
    if (!d?.active) return;
    if (iso !== d.anchor) d.moved = true;
    d.last = iso;
    const { start, end } = normalizeRange(d.anchor, iso);
    setSelection({ start, end });
    setFocusedIso(iso);
  }, []);

  const finalizePointer = useCallback(() => {
    const d = dragRef.current;
    if (!d?.active) return;
    dragRef.current = null;
    lastWasDrag.current = d.moved;
    setIsDragging(false);
    if (d.moved && preDragSelectionRef.current) {
      setUndoStack((u) => [...u.slice(-9), preDragSelectionRef.current!]);
    }
  }, []);

  useEffect(() => {
    const up = () => finalizePointer();
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [finalizePointer]);

  useEffect(() => {
    if (!isDragging) return;
    const move = (e: PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const hit = el?.closest("[data-date]");
      const iso = hit?.getAttribute("data-date");
      if (iso) onDayPointerEnter(iso);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [isDragging, onDayPointerEnter]);

  const prevMonth = () => {
    setFlipDirection(-1);
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    setFlipDirection(1);
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };

  const goToday = () => {
    setFlipDirection(1);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    const ti = TODAY_ISO;
    applySelection({ start: ti, end: null });
    setFocusedIso(ti);
    requestAnimationFrame(() => gridRef.current?.focus());
  };

  const undoSelection = () => {
    setUndoStack((u) => {
      if (!u.length) return u;
      const prev = u[u.length - 1];
      setSelection(prev);
      return u.slice(0, -1);
    });
  };

  const clearSelection = () => {
    applySelection({ start: null, end: null });
  };

  const onGridKeyDown = (e: React.KeyboardEvent) => {
    const base =
      focusedIso ??
      `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-01`;
    let next = base;
    if (e.key === "ArrowLeft") next = addDays(base, -1);
    else if (e.key === "ArrowRight") next = addDays(base, 1);
    else if (e.key === "ArrowUp") next = addDays(base, -7);
    else if (e.key === "ArrowDown") next = addDays(base, 7);
    else if (e.key === "Home") {
      e.preventDefault();
      setFocusedIso(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-01`);
      return;
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTapDay(base);
      return;
    } else return;

    e.preventDefault();
    setFocusedIso(next);
    if (e.shiftKey && selection.start) {
      const { start, end } = normalizeRange(selection.start, next);
      setSelection({ start, end });
    }
  };

  const addNote = (body: string, scope: NoteEntry["scope"], voiceUrl?: string) => {
    setNotes((n) => [
      ...n,
      { id: newNoteId(), body, voiceUrl, updatedAt: new Date().toISOString(), scope },
    ]);
  };

  const updateNote = (id: string, body: string) => {
    setNotes((n) =>
      n.map((x) =>
        x.id === id ? { ...x, body, updatedAt: new Date().toISOString() } : x
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes((n) => n.filter((x) => x.id !== id));
  };

  const handleDoubleClickDay = useCallback((iso: string) => {
    // Navigate to the month of the double-clicked overflow date
    const d = new Date(iso + "T12:00:00");
    const y = d.getFullYear();
    const m = d.getMonth();
    const cur = viewYear * 12 + viewMonth;
    const next = y * 12 + m;
    setFlipDirection(next < cur ? -1 : 1);
    setViewYear(y);
    setViewMonth(m);
  }, [viewYear, viewMonth]);

  const exportNotes = () => {
    const lines: string[] = [];
    const exportDate = new Date().toLocaleString("default", {
      dateStyle: "full",
      timeStyle: "short",
    });

    lines.push("╔══════════════════════════════════════════════════════╗");
    lines.push("║           WALL CALENDAR — NOTES EXPORT               ║");
    lines.push("╚══════════════════════════════════════════════════════╝");
    lines.push(`  Exported on: ${exportDate}`);
    lines.push(`  Total notes: ${notes.length}`);
    lines.push("");

    // Current selection
    if (selection.start) {
      lines.push("── CURRENT SELECTION ─────────────────────────────────");
      lines.push(
        selection.end && selection.end !== selection.start
          ? `  ${selection.start}  →  ${selection.end}`
          : `  ${selection.start}`
      );
      lines.push("");
    }

    // Group day-notes by month (YYYY-MM)
    const byMonth: Record<string, { day: Record<string, typeof notes>; range: typeof notes }> = {};

    for (const note of notes) {
      if (note.scope.kind === "day") {
        const month = note.scope.key.slice(0, 7);
        if (!byMonth[month]) byMonth[month] = { day: {}, range: [] };
        const key = note.scope.key;
        if (!byMonth[month].day[key]) byMonth[month].day[key] = [];
        byMonth[month].day[key].push(note);
      } else if (note.scope.kind === "range") {
        const month = note.scope.start.slice(0, 7);
        if (!byMonth[month]) byMonth[month] = { day: {}, range: [] };
        byMonth[month].range.push(note);
      }
    }

    const sortedMonths = Object.keys(byMonth).sort();

    if (sortedMonths.length === 0 && Object.keys(monthlyMemos).length === 0) {
      lines.push("  (No notes yet)");
    }

    // Merge all months (notes + memos)
    const allMonths = new Set([
      ...sortedMonths,
      ...Object.keys(monthlyMemos),
    ]);

    for (const month of [...allMonths].sort()) {
      const [y, m] = month.split("-").map(Number);
      const monthName = new Date(y, m - 1, 1).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      lines.push(`╔══════════════════════════════════════════════════════╗`);
      lines.push(`  📅  ${monthName.toUpperCase()}`);
      lines.push(`╚══════════════════════════════════════════════════════╝`);
      lines.push("");

      // Monthly memo
      const memo = monthlyMemos[month];
      if (memo?.trim()) {
        lines.push("  ┌─ MONTH OVERVIEW ───────────────────────────────────");
        for (const ln of memo.trim().split("\n")) {
          lines.push(`  │  ${ln}`);
        }
        lines.push("  └────────────────────────────────────────────────────");
        lines.push("");
      }

      const monthData = byMonth[month];

      // Day notes
      const dayKeys = Object.keys(monthData?.day ?? {}).sort();
      for (const dayKey of dayKeys) {
        const dayNotes = monthData.day[dayKey];
        const dateLabel = new Date(dayKey + "T12:00:00").toLocaleDateString("default", {
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        lines.push(`  ▸ ${dateLabel}  [${dayKey}]`);
        lines.push("  ─────────────────────────────────────────────────────");
        for (let i = 0; i < dayNotes.length; i++) {
          const n = dayNotes[i];
          const time = new Date(n.updatedAt).toLocaleTimeString("default", {
            hour: "2-digit",
            minute: "2-digit",
          });
          lines.push(`  [${i + 1}]  ${time}`);
          if (n.body) {
            for (const ln of n.body.split("\n")) {
              lines.push(`       ${ln}`);
            }
          }
          if (n.voiceUrl) {
            lines.push(`       🎤 [Voice recording attached — not included in text export]`);
          }
          lines.push("");
        }
      }

      // Range notes
      if (monthData?.range?.length) {
        lines.push("  ┌─ RANGE NOTES ──────────────────────────────────────");
        for (const n of monthData.range) {
          const scope = n.scope as { kind: "range"; start: string; end: string };
          lines.push(`  │  ${scope.start} → ${scope.end}`);
          if (n.body) {
            for (const ln of n.body.split("\n")) {
              lines.push(`  │     ${ln}`);
            }
          }
          if (n.voiceUrl) {
            lines.push(`  │     🎤 [Voice recording attached — not included in text export]`);
          }
          lines.push("  │");
        }
        lines.push("  └────────────────────────────────────────────────────");
        lines.push("");
      }

      lines.push("");
    }

    lines.push("══════════════════════════════════════════════════════");
    lines.push("  End of export  ·  Wall Calendar Studio");
    lines.push("══════════════════════════════════════════════════════");

    const text = lines.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `wall-calendar-notes-${toISODate(new Date())}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const captions = [
    "Layered like paper, precise like a planner.",
    "Your month, framed and ready to mark.",
    "Soft light, sharp dates, quiet motion.",
  ];
  const caption = captions[viewMonth % captions.length];

  if (!hydrated) {
    return (
      <div className="wc-shell min-h-screen animate-pulse bg-zinc-100 p-6 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-48 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-96 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="wc-shell relative min-h-screen overflow-x-hidden"
      style={
        {
          ["--wc-focus" as string]: palette.accent,
          ["--wc-accent-text" as string]: resolvedDark ? "#e2e8f0" : "#0f172a",
          background: resolvedDark ? "#09090b" : "#fafafa",
        } as React.CSSProperties
      }
    >
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: palette.moodBg }}
        aria-hidden
      />

      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80 print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md"
              style={{ background: palette.accent }}
            >
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Studio
              </p>
              <h1 className="font-serif text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Wall Calendar
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={goToday}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium shadow-sm dark:border-white/10 dark:bg-zinc-900"
            >
              Today
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setGoYear(String(viewYear));
                setGoMonth(String(viewMonth + 1));
                setGoOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium shadow-sm dark:border-white/10 dark:bg-zinc-900"
            >
              <SearchIcon className="h-4 w-4" />
              Go to…
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={undoSelection}
              disabled={undoStack.length === 0}
              className="rounded-xl border border-black/10 bg-white p-2 disabled:opacity-40 dark:border-white/10 dark:bg-zinc-900"
              title="Undo selection"
            >
              <Undo2 className="h-4 w-4" />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={clearSelection}
              className="rounded-xl border border-black/10 bg-white p-2 dark:border-white/10 dark:bg-zinc-900"
              title="Clear selection"
            >
              <X className="h-4 w-4" />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={exportNotes}
              className="rounded-xl border border-black/10 bg-white p-2 dark:border-white/10 dark:bg-zinc-900"
              title="Export notes (.txt)"
            >
              <Download className="h-4 w-4" />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setPrintMode((p) => !p)}
              className={`rounded-xl border p-2 ${
                printMode
                  ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40"
                  : "border-black/10 bg-white dark:border-white/10 dark:bg-zinc-900"
              }`}
              title="Print-friendly"
            >
              <Printer className="h-4 w-4" />
            </motion.button>
            <div className="flex rounded-xl border border-black/10 p-0.5 dark:border-white/10">
              {(
                [
                  ["light", Sun],
                  ["system", Monitor],
                  ["dark", Moon],
                ] as const
              ).map(([m, Icon]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setThemeMode(m)}
                  className={`rounded-lg p-2 ${
                    themeMode === m
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-500"
                  }`}
                  aria-label={`Theme ${m}`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {goOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm print:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal
            aria-labelledby="go-title"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-zinc-900"
            >
              <h2 id="go-title" className="font-serif text-xl font-semibold">
                Jump to month
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="text-xs font-bold uppercase text-zinc-500">
                  Year
                  <input
                    type="number"
                    value={goYear}
                    onChange={(e) => setGoYear(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </label>
                <label className="text-xs font-bold uppercase text-zinc-500">
                  Month
                  <select
                    value={goMonth}
                    onChange={(e) => setGoMonth(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i + 1}>
                        {new Date(2000, i, 1).toLocaleString("default", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGoOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const y = parseInt(goYear, 10);
                    const mo = parseInt(goMonth, 10) - 1;
                    if (!Number.isFinite(y) || mo < 0 || mo > 11) return;
                    const cur = viewYear * 12 + viewMonth;
                    const next = y * 12 + mo;
                    setFlipDirection(next < cur ? -1 : 1);
                    setViewYear(y);
                    setViewMonth(mo);
                    setGoOpen(false);
                  }}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: palette.accent }}
                >
                  Go
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-6xl px-4 py-8 pb-28 md:pb-10 print:py-4">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] print:block">
          <div className="space-y-6 print:space-y-4">
            <HeroPanel
              year={viewYear}
              monthIndex={viewMonth}
              palette={palette}
              monthLabel={monthLabel}
              caption={caption}
            />
            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-x-4 -bottom-6 top-[60%] rounded-[2rem] bg-gradient-to-b from-transparent via-black/[0.04] to-black/[0.07] dark:via-white/[0.03] dark:to-white/[0.05] print:hidden"
                aria-hidden
              />
              <CalendarGrid
                year={viewYear}
                monthIndex={viewMonth}
                palette={palette}
                selection={selection}
                todayIso={TODAY_ISO}
                focusedIso={focusedIso}
                noteCountByDay={noteCountByDay}
                onPrevMonth={prevMonth}
                onNextMonth={nextMonth}
                onDayClick={(iso) => {
                  if (lastWasDrag.current) {
                    lastWasDrag.current = false;
                    return;
                  }
                  handleTapDay(iso);
                }}
                onDayDoubleClick={handleDoubleClickDay}
                onDayPointerDown={onDayPointerDown}
                onDayPointerEnter={onDayPointerEnter}
                isDragging={isDragging}
                flipDirection={flipDirection}
                gridRef={gridRef}
                onGridKeyDown={onGridKeyDown}
              />
            </div>
          </div>

          <div className="space-y-6 print:break-inside-avoid">
            <MonthSummaryCard
              palette={palette}
              selection={selection}
              totalNotes={notes.length}
              year={viewYear}
              monthIndex={viewMonth}
              notes={notes}
            />
            <NotesMemoPanel
              palette={palette}
              monthlyMemo={monthlyMemo}
              onMonthlyMemoChange={(v) =>
                setMonthlyMemos((m) => ({ ...m, [mk]: v }))
              }
              notes={notes}
              onAddNote={addNote}
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
              selection={selection}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
            />
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/10 bg-white/95 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/95 md:hidden print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={prevMonth}
            className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm font-semibold dark:border-zinc-700"
          >
            Prev
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={goToday}
            className="flex-1 rounded-xl py-3 text-sm font-semibold text-white"
            style={{ background: palette.accent }}
          >
            Today
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={nextMonth}
            className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm font-semibold dark:border-zinc-700"
          >
            Next
          </motion.button>
        </div>
      </footer>
    </div>
  );
}
