"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Flame, Printer, Download, BarChart3, Grid3X3,
} from "lucide-react";
import CalendarShell from "./components/CalendarShell";
import HeroImagePanel from "./components/HeroImagePanel";
import CalendarGrid from "./components/CalendarGrid";
import NotesPanel from "./components/NotesPanel";
import MiniCalendar from "./components/MiniCalendar";
import WeatherWidget from "./components/WeatherWidget";
import ThemeSwitcher from "./components/ThemeSwitcher";
import { THEMES } from "./constants/themes";
import { CATEGORIES } from "./constants/categories";
import useCalendar, { dateKey as dk } from "./hooks/useCalendar";
import useNotes from "./hooks/useNotes";
import useWeather from "./hooks/useWeather";
import useDominantColor from "./hooks/useDominantColor";

const SETTINGS_KEY = "wall-cal-settings";

function loadSettings() {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"); } catch { return {}; }
}

export default function Home() {
  const saved = loadSettings();
  const [themeName, setThemeName] = useState(saved.theme || "Mountain");
  const [darkMode, setDarkMode] = useState(saved.darkMode || false);
  const [locale, setLocale] = useState(saved.locale || "en-US");
  const [country, setCountry] = useState(saved.country || "US");
  const [notesPanelDate, setNotesPanelDate] = useState(null);
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [direction, setDirection] = useState(0);
  const [monthMemo, setMonthMemo] = useState("");
  const touchStart = useRef(null);

  const calendar = useCalendar();
  const notes = useNotes();
  const weather = useWeather();
  const { dominantColor, extractColor } = useDominantColor();

  const theme = THEMES[themeName] || THEMES.Mountain;
  const palette = darkMode ? theme.darkPalette : theme.palette;
  const accentColor = dominantColor || palette.primary;

  // Persist settings
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme: themeName, darkMode, locale, country }));
  }, [themeName, darkMode, locale, country]);

  // Load month memo
  const monthKey = `${calendar.year}-${String(calendar.month + 1).padStart(2, "0")}`;
  useEffect(() => { setMonthMemo(notes.getMemo(monthKey)); }, [monthKey, notes]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (notesPanelDate) return; // don't navigate while notes open
      if (e.key === "ArrowLeft") { setDirection(-1); calendar.prevMonth(); }
      if (e.key === "ArrowRight") { setDirection(1); calendar.nextMonth(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [calendar, notesPanelDate]);

  // Touch swipe
  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(diff) > 60) {
      if (diff > 0) { setDirection(-1); calendar.prevMonth(); }
      else { setDirection(1); calendar.nextMonth(); }
    }
    touchStart.current = null;
  };

  const handlePrev = () => { setDirection(-1); calendar.prevMonth(); };
  const handleNext = () => { setDirection(1); calendar.nextMonth(); };

  const handleDateSelect = useCallback((key) => {
    if (key) setNotesPanelDate(key);
  }, []);

  const handlePrint = () => window.print();

  const handleExport = () => {
    const start = calendar.rangeStart || dk(calendar.year, calendar.month, 1);
    const end = calendar.rangeEnd || dk(calendar.year, calendar.month, new Date(calendar.year, calendar.month + 1, 0).getDate());
    notes.exportICS(start, end);
  };

  const handleExportTxt = () => {
    const start = calendar.rangeStart || dk(calendar.year, calendar.month, 1);
    const end = calendar.rangeEnd || dk(calendar.year, calendar.month, new Date(calendar.year, calendar.month + 1, 0).getDate());
    notes.exportTXT(start, end);
  };

  const streak = notes.getStreak();

  // Prev/next month for mini calendars
  const prevM = calendar.month === 0 ? 11 : calendar.month - 1;
  const prevY = calendar.month === 0 ? calendar.year - 1 : calendar.year;
  const nextM = calendar.month === 11 ? 0 : calendar.month + 1;
  const nextY = calendar.month === 11 ? calendar.year + 1 : calendar.year;

  return (
    <div
      className="min-h-screen transition-colors duration-500 p-4 sm:p-6 md:p-8"
      style={{ background: palette.bg, fontFamily: theme.font }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top toolbar */}
      <div className="max-w-6xl mx-auto mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <ThemeSwitcher
            theme={themeName} setTheme={setThemeName}
            darkMode={darkMode} setDarkMode={setDarkMode}
            locale={locale} setLocale={setLocale}
            country={country} setCountry={setCountry}
            palette={palette}
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Streak */}
          {streak > 0 && (
            <span className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg" style={{ color: palette.text, background: palette.muted + "15" }}>
              🔥 {streak}
            </span>
          )}
          {/* Heatmap toggle */}
          <button
            onClick={() => setHeatmapMode(!heatmapMode)}
            className="p-2 rounded-lg transition-colors hover:bg-black/10"
            style={{ color: heatmapMode ? accentColor : palette.muted }}
            aria-label="Toggle heatmap view"
          >
            {heatmapMode ? <Grid3X3 size={18} /> : <BarChart3 size={18} />}
          </button>
          {/* Print */}
          <button onClick={handlePrint} className="p-2 rounded-lg hover:bg-black/10" style={{ color: palette.muted }} aria-label="Print calendar">
            <Printer size={18} />
          </button>
          {/* Export */}
          <button onClick={handleExport} className="p-2 rounded-lg hover:bg-black/10" style={{ color: palette.muted }} aria-label="Export as ICS" title="Export .ics">
            <Download size={18} />
          </button>
          <button onClick={handleExportTxt} className="text-xs px-2 py-1 rounded border hover:bg-black/5" style={{ color: palette.muted, borderColor: palette.muted + "33" }}>
            .txt
          </button>
        </div>
      </div>

      {/* Category filter bar */}
      <div className="max-w-6xl mx-auto mb-3 flex flex-wrap gap-2 print:hidden">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(categoryFilter === c.id ? null : c.id)}
            className="text-xs px-2 py-1 rounded-full border transition-all"
            style={{
              borderColor: c.color,
              background: categoryFilter === c.id ? c.color : "transparent",
              color: categoryFilter === c.id ? "#fff" : c.color,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Main calendar layout */}
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-4">
        {/* Mini calendars sidebar (desktop) */}
        <div className="hidden lg:flex flex-col gap-4 w-40 shrink-0 print:hidden">
          <MiniCalendar year={prevY} month={prevM} locale={locale} palette={palette} accentColor={accentColor} todayKey={calendar.todayKey} onDateClick={calendar.goToDate} />
          <MiniCalendar year={nextY} month={nextM} locale={locale} palette={palette} accentColor={accentColor} todayKey={calendar.todayKey} onDateClick={calendar.goToDate} />
          {/* Weather widget */}
          <WeatherWidget forecast={weather.forecast} palette={palette} />
        </div>

        {/* Calendar body */}
        <div className="flex-1 min-w-0">
          <CalendarShell palette={palette}>
            {/* Hero image */}
            <HeroImagePanel
              month={calendar.month}
              year={calendar.year}
              theme={theme}
              locale={locale}
              dominantColor={dominantColor}
              onImageLoad={extractColor}
              weatherTint={weather.tint}
              direction={direction}
            />

            {/* Month navigation */}
            <div className="flex items-center justify-between px-4 py-3 print:py-2">
              <button onClick={handlePrev} className="p-2 rounded-lg hover:bg-black/10 transition-colors print:hidden" style={{ color: palette.text }} aria-label="Previous month">
                <ChevronLeft size={20} />
              </button>
              <div className="text-center">
                <h2 className="text-lg font-semibold capitalize" style={{ color: palette.text }}>
                  {new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(calendar.year, calendar.month))}
                </h2>
              </div>
              <button onClick={handleNext} className="p-2 rounded-lg hover:bg-black/10 transition-colors print:hidden" style={{ color: palette.text }} aria-label="Next month">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Calendar grid */}
            <CalendarGrid
              weeks={calendar.weeks}
              weekNumbers={calendar.weekNumbers}
              todayKey={calendar.todayKey}
              selectedDate={calendar.selectedDate}
              calendar={calendar}
              notes={notes}
              weather={weather}
              palette={palette}
              accentColor={accentColor}
              locale={locale}
              country={country}
              heatmapMode={heatmapMode}
              categoryFilter={categoryFilter}
              onDateClick={calendar.handleDateClick}
              onDragStart={calendar.handleDragStart}
              onDragOver={calendar.handleDragOver}
              onDragEnd={calendar.handleDragEnd}
              onDateSelect={handleDateSelect}
            />

            {/* Monthly memo area */}
            <div className="px-4 pb-4 print:pb-2">
              <div className="rounded-lg p-3 border" style={{ borderColor: palette.muted + "22", background: palette.bg }}>
                <p className="text-xs font-semibold mb-1" style={{ color: palette.muted }}>Monthly Notes</p>
                <textarea
                  value={monthMemo}
                  onChange={(e) => { setMonthMemo(e.target.value); notes.setMemo(monthKey, e.target.value); }}
                  placeholder="General notes for this month..."
                  className="w-full text-sm bg-transparent resize-none focus:outline-none"
                  style={{ color: palette.text, minHeight: 60, backgroundImage: `repeating-linear-gradient(transparent, transparent 23px, ${palette.muted}15 24px)`, lineHeight: "24px" }}
                  rows={3}
                />
              </div>
            </div>
          </CalendarShell>

          {/* Mobile mini calendars + weather */}
          <div className="lg:hidden flex flex-wrap justify-center gap-6 mt-4 print:hidden">
            <MiniCalendar year={prevY} month={prevM} locale={locale} palette={palette} accentColor={accentColor} todayKey={calendar.todayKey} onDateClick={calendar.goToDate} />
            <MiniCalendar year={nextY} month={nextM} locale={locale} palette={palette} accentColor={accentColor} todayKey={calendar.todayKey} onDateClick={calendar.goToDate} />
            <WeatherWidget forecast={weather.forecast} palette={palette} />
          </div>
        </div>
      </div>

      {/* Notes slide-in panel */}
      <AnimatePresence>
        {notesPanelDate && (
          <>
            <div className="fixed inset-0 bg-black/30 z-40 print:hidden" onClick={() => setNotesPanelDate(null)} />
            <NotesPanel
              dateKey={notesPanelDate}
              notes={notes}
              palette={palette}
              accentColor={accentColor}
              onClose={() => setNotesPanelDate(null)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
