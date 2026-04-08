"use client";
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "wall-cal-notes";
const MEMO_KEY = "wall-cal-memos";

function load(key) {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
}

export default function useNotes() {
  const [notes, setNotes] = useState({});       // { "2026-04-08": [{ id, text, category, pinned, reminder, voiceData }] }
  const [memos, setMemos] = useState({});        // { "2026-04": "memo text" }
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setNotes(load(STORAGE_KEY)); setMemos(load(MEMO_KEY)); setLoaded(true); }, []);
  useEffect(() => { if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); }, [notes, loaded]);
  useEffect(() => { if (loaded) localStorage.setItem(MEMO_KEY, JSON.stringify(memos)); }, [memos, loaded]);

  const addNote = useCallback((dateKey, text, category = "personal") => {
    setNotes((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), { id: Date.now().toString(), text, category, pinned: false, reminder: null, voiceData: null, createdAt: Date.now() }],
    }));
  }, []);

  const updateNote = useCallback((dateKey, noteId, updates) => {
    setNotes((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).map((n) => (n.id === noteId ? { ...n, ...updates } : n)),
    }));
  }, []);

  const deleteNote = useCallback((dateKey, noteId) => {
    setNotes((prev) => {
      const filtered = (prev[dateKey] || []).filter((n) => n.id !== noteId);
      const next = { ...prev };
      if (filtered.length === 0) delete next[dateKey]; else next[dateKey] = filtered;
      return next;
    });
  }, []);

  const togglePin = useCallback((dateKey, noteId) => {
    setNotes((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n)),
    }));
  }, []);

  const setReminder = useCallback((dateKey, noteId, time) => {
    updateNote(dateKey, noteId, { reminder: time });
  }, [updateNote]);

  const getNotesForDate = useCallback((dateKey) => {
    const list = notes[dateKey] || [];
    return [...list].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || a.createdAt - b.createdAt);
  }, [notes]);

  const hasNotes = useCallback((dateKey) => (notes[dateKey]?.length || 0) > 0, [notes]);

  const getCategoriesForDate = useCallback((dateKey) => {
    return [...new Set((notes[dateKey] || []).map((n) => n.category))];
  }, [notes]);

  const setMemo = useCallback((monthKey, text) => {
    setMemos((prev) => ({ ...prev, [monthKey]: text }));
  }, []);

  const getMemo = useCallback((monthKey) => memos[monthKey] || "", [memos]);

  // Streak calculation
  const getStreak = useCallback(() => {
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (notes[key]?.length > 0) streak++;
      else if (i > 0) break; // allow today to be empty
    }
    return streak;
  }, [notes]);

  // Note density for heatmap
  const getNoteDensity = useCallback((dateKey) => (notes[dateKey]?.length || 0), [notes]);

  // Export as ICS
  const exportICS = useCallback((startDate, endDate) => {
    let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//WallCalendar//EN\n";
    Object.entries(notes).forEach(([key, dayNotes]) => {
      if (key >= startDate && key <= endDate) {
        dayNotes.forEach((n) => {
          const d = key.replace(/-/g, "");
          ics += `BEGIN:VEVENT\nDTSTART;VALUE=DATE:${d}\nSUMMARY:${n.text.slice(0, 75)}\nCATEGORIES:${n.category}\nEND:VEVENT\n`;
        });
      }
    });
    ics += "END:VCALENDAR";
    const blob = new Blob([ics], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "calendar-export.ics";
    a.click();
  }, [notes]);

  const exportTXT = useCallback((startDate, endDate) => {
    let txt = `Calendar Notes: ${startDate} to ${endDate}\n${"=".repeat(40)}\n\n`;
    Object.entries(notes).sort().forEach(([key, dayNotes]) => {
      if (key >= startDate && key <= endDate) {
        txt += `📅 ${key}\n`;
        dayNotes.forEach((n) => { txt += `  [${n.category}] ${n.pinned ? "📌 " : ""}${n.text}\n`; });
        txt += "\n";
      }
    });
    const blob = new Blob([txt], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "calendar-notes.txt";
    a.click();
  }, [notes]);

  return {
    notes, addNote, updateNote, deleteNote, togglePin, setReminder,
    getNotesForDate, hasNotes, getCategoriesForDate,
    memos, setMemo, getMemo,
    getStreak, getNoteDensity, exportICS, exportTXT,
  };
}
