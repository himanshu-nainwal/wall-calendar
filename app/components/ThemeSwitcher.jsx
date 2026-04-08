"use client";
import { Sun, Moon, Palette, Globe, MapPin } from "lucide-react";
import { THEMES, LOCALES } from "../constants/themes";
import { HOLIDAY_COUNTRIES } from "../constants/holidays";

export default function ThemeSwitcher({ theme, setTheme, darkMode, setDarkMode, locale, setLocale, country, setCountry, palette }) {
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      {/* Dark/Light toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="p-2 rounded-lg transition-colors hover:bg-black/10"
        style={{ color: palette.text }}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Theme presets */}
      <div className="flex items-center gap-1">
        <Palette size={14} style={{ color: palette.muted }} />
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="text-xs p-1 rounded border bg-transparent"
          style={{ borderColor: palette.muted + "33", color: palette.text }}
        >
          {Object.keys(THEMES).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Locale */}
      <div className="flex items-center gap-1">
        <Globe size={14} style={{ color: palette.muted }} />
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          className="text-xs p-1 rounded border bg-transparent"
          style={{ borderColor: palette.muted + "33", color: palette.text }}
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Country holidays */}
      <div className="flex items-center gap-1">
        <MapPin size={14} style={{ color: palette.muted }} />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="text-xs p-1 rounded border bg-transparent"
          style={{ borderColor: palette.muted + "33", color: palette.text }}
        >
          {HOLIDAY_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
