import type { NoteEntry } from "@/types/wall-calendar";

const STORAGE_KEY = "wall-calendar-studio-v1";

export type PersistedCalendarState = {
  notes: NoteEntry[];
  monthlyMemos: Record<string, string>;
  themeMode: "light" | "dark" | "system";
};

const defaultState: PersistedCalendarState = {
  notes: [],
  monthlyMemos: {},
  themeMode: "system",
};

export function loadPersistedState(): PersistedCalendarState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<PersistedCalendarState>;
    return {
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      monthlyMemos:
        parsed.monthlyMemos && typeof parsed.monthlyMemos === "object"
          ? parsed.monthlyMemos
          : {},
      themeMode:
        parsed.themeMode === "light" ||
        parsed.themeMode === "dark" ||
        parsed.themeMode === "system"
          ? parsed.themeMode
          : "system",
    };
  } catch {
    return defaultState;
  }
}

export function savePersistedState(state: PersistedCalendarState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}
