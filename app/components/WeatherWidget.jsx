"use client";

export default function WeatherWidget({ forecast, palette }) {
  const entries = Object.entries(forecast).slice(0, 5);
  if (entries.length === 0) return null;

  return (
    <div className="flex gap-2 px-4 py-2">
      {entries.map(([date, w]) => (
        <div key={date} className="text-center text-xs" style={{ color: palette.muted }}>
          <span className="text-base">{w.icon}</span>
          <p className="font-mono">{w.temp}°</p>
          <p className="text-[10px]">{new Date(date + "T00:00").toLocaleDateString(undefined, { weekday: "short" })}</p>
        </div>
      ))}
    </div>
  );
}
