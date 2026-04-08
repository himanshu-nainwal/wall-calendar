"use client";
import { getMonthDays } from "../hooks/useCalendar";

export default function MiniCalendar({ year, month, locale, palette, accentColor, todayKey, onDateClick }) {
  const days = getMonthDays(year, month);
  const monthName = new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(year, month));
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, 7 + i);
    return new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(d);
  });

  return (
    <div className="text-center">
      <p className="text-xs font-semibold mb-1" style={{ color: palette.text }}>
        {monthName} {year}
      </p>
      <div className="grid grid-cols-7 gap-px text-[10px]">
        {dayLabels.map((d, i) => (
          <span key={i} style={{ color: palette.muted }}>{d}</span>
        ))}
        {days.slice(0, 42).map((d, i) => {
          const key = `${d.year}-${String(d.month + 1).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
          const isToday = key === todayKey;
          return (
            <button
              key={i}
              onClick={() => !d.outside && onDateClick(d.year, d.month)}
              className={`w-5 h-5 rounded-full text-[10px] leading-5 ${d.outside ? "opacity-20" : "hover:bg-black/5"}`}
              style={isToday ? { background: accentColor, color: "#fff" } : { color: palette.text }}
            >
              {d.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
