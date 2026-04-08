/** Mock holidays and events for demo — extend freely. */

export const HOLIDAY_LABELS: Record<string, string> = {
  "2026-01-01": "New Year's Day",
  "2026-01-26": "Australia Day",
  "2026-02-14": "Valentine's Day",
  "2026-03-08": "IWD",
  "2026-03-17": "St. Patrick's",
  "2026-04-01": "April Fools",
  "2026-04-07": "Good vibes day",
  "2026-05-01": "Labour Day",
  "2026-06-21": "Solstice",
  "2026-07-04": "Independence Day",
  "2026-08-15": "Summer peak",
  "2026-10-31": "Halloween",
  "2026-11-28": "Advent start",
  "2026-12-24": "Christmas Eve",
  "2026-12-25": "Christmas",
  "2026-12-31": "NYE",
  "2025-12-25": "Christmas",
  "2025-12-31": "NYE",
};

export type CalendarEvent = {
  id: string;
  title: string;
  badge?: "dot" | "star" | "pin";
};

export const EVENTS_BY_DATE: Record<string, CalendarEvent[]> = {
  "2026-04-10": [
    { id: "e1", title: "Design review", badge: "star" },
    { id: "e2", title: "Sprint planning", badge: "dot" },
  ],
  "2026-04-15": [{ id: "e3", title: "Launch dry-run", badge: "pin" }],
  "2026-04-22": [{ id: "e4", title: "Team offsite", badge: "star" }],
  "2026-04-28": [{ id: "e5", title: "Quarter close", badge: "dot" }],
};

export function getHolidayLabel(iso: string): string | undefined {
  return HOLIDAY_LABELS[iso];
}

export function getEventsForDay(iso: string): CalendarEvent[] {
  return EVENTS_BY_DATE[iso] ?? [];
}
