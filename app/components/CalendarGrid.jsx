"use client";
import DayCell from "./DayCell";
import { HOLIDAYS } from "../constants/holidays";
import { dateKey as dk } from "../hooks/useCalendar";

const DAY_LABELS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarGrid({
  weeks, weekNumbers, todayKey, selectedDate, calendar, notes, weather,
  palette, accentColor, locale, country, heatmapMode, categoryFilter,
  onDateClick, onDragStart, onDragOver, onDragEnd, onDateSelect,
}) {
  const holidays = HOLIDAYS[country] || HOLIDAYS.US;
  const dayLabels = DAY_LABELS_EN.map((_, i) => {
    const d = new Date(2024, 0, i); // Jan 2024 starts on Monday... use a known Sunday
    const base = new Date(2024, 0, 7 + i); // Jan 7 2024 is Sunday
    return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(base);
  });

  return (
    <div className="px-2 sm:px-4 pb-4" role="grid" aria-label="Calendar grid" onMouseUp={onDragEnd} onMouseLeave={onDragEnd}>
      {/* Day headers */}
      <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-1 mb-1">
        <div className="w-8 text-[10px] text-center" style={{ color: palette.muted }}>Wk</div>
        {dayLabels.map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold py-1" style={{ color: palette.muted }}>
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-[auto_repeat(7,1fr)] gap-1">
          {/* Week number */}
          <div className="w-8 flex items-center justify-center text-[10px] font-mono" style={{ color: palette.muted }}>
            {weekNumbers[wi]}
          </div>
          {week.map((dayObj, di) => {
            const key = dk(dayObj.year, dayObj.month, dayObj.day);
            const mmdd = `${String(dayObj.month + 1).padStart(2, "0")}-${String(dayObj.day).padStart(2, "0")}`;
            const holiday = holidays[mmdd];
            const noteCats = notes.getCategoriesForDate(key);
            const hasNotes = notes.hasNotes(key);
            const hasPinned = (notes.getNotesForDate(key) || []).some((n) => n.pinned);
            const density = notes.getNoteDensity(key);
            const weatherData = weather.forecast[key];

            // Category filter
            if (categoryFilter && hasNotes && !noteCats.includes(categoryFilter)) {
              // dim it
            }

            return (
              <DayCell
                key={key}
                dayObj={dayObj}
                dateKey={key}
                isToday={key === todayKey}
                isSelected={key === selectedDate}
                isInRange={calendar.isInRange(dayObj)}
                isRangeEdge={calendar.isRangeEdge(dayObj)}
                isOutside={dayObj.outside}
                holiday={holiday}
                weather={weatherData}
                noteCategories={noteCats}
                hasNotes={hasNotes}
                hasPinned={hasPinned}
                noteDensity={density}
                heatmapMode={heatmapMode}
                palette={palette}
                accentColor={accentColor}
                onClick={() => { onDateClick(dayObj); onDateSelect(key); }}
                onMouseDown={(e) => { e.preventDefault(); onDragStart(dayObj); }}
                onMouseEnter={() => onDragOver(dayObj)}
                onDoubleClick={() => {
                  if (key === selectedDate) onDateSelect(null);
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
