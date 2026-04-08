"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pin, Trash2, Bell, FileText } from "lucide-react";
import { CATEGORIES } from "../constants/categories";
import VoiceNote from "./VoiceNote";

export default function NotesPanel({ dateKey, notes, palette, accentColor, onClose }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("personal");
  const [reminderTime, setReminderTime] = useState("");
  const dayNotes = notes.getNotesForDate(dateKey);

  const handleAdd = () => {
    if (!text.trim()) return;
    notes.addNote(dateKey, text.trim(), category);
    setText("");
    // Set reminder if specified
    if (reminderTime) {
      const ms = new Date(reminderTime).getTime() - Date.now();
      if (ms > 0 && "Notification" in window) {
        Notification.requestPermission().then((p) => {
          if (p === "granted") setTimeout(() => new Notification("📅 Reminder", { body: text.trim() }), ms);
        });
      }
      setReminderTime("");
    }
  };

  return (
    <motion.div
      className="fixed right-0 top-0 h-full w-full sm:w-96 z-50 shadow-2xl flex flex-col overflow-hidden"
      style={{ background: palette.surface, color: palette.text }}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: palette.muted + "33" }}>
        <h2 className="font-semibold text-lg">📅 {dateKey}</h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/10" aria-label="Close notes panel">
          <X size={20} />
        </button>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {dayNotes.length === 0 && (
          <div className="text-center py-8 opacity-50">
            <FileText size={32} className="mx-auto mb-2" />
            <p className="text-sm">No notes yet. Add one below.</p>
          </div>
        )}
        <AnimatePresence>
          {dayNotes.map((note) => {
            const cat = CATEGORIES.find((c) => c.id === note.category);
            return (
              <motion.div
                key={note.id}
                className="p-3 rounded-lg border relative"
                style={{ borderColor: cat?.color + "44", borderLeftWidth: 3, borderLeftColor: cat?.color }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 50 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm flex-1">{note.text}</p>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => notes.togglePin(dateKey, note.id)} className={`p-1 rounded ${note.pinned ? "text-amber-500" : "opacity-40 hover:opacity-100"}`} aria-label="Toggle pin">
                      <Pin size={12} fill={note.pinned ? "currentColor" : "none"} />
                    </button>
                    <button onClick={() => notes.deleteNote(dateKey, note.id)} className="p-1 rounded text-red-400 hover:text-red-600" aria-label="Delete note">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: cat?.color + "22", color: cat?.color }}>
                    {cat?.label}
                  </span>
                  {note.reminder && <Bell size={10} className="text-amber-500" />}
                </div>
                {/* Voice note */}
                <VoiceNote
                  audioData={note.voiceData}
                  onSave={(data) => notes.updateNote(dateKey, note.id, { voiceData: data })}
                  onDelete={() => notes.updateNote(dateKey, note.id, { voiceData: null })}
                  accentColor={accentColor}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add note form */}
      <div className="p-4 border-t space-y-2" style={{ borderColor: palette.muted + "33" }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note..."
          className="w-full p-2 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2"
          style={{ borderColor: palette.muted + "33", background: palette.bg, focusRingColor: accentColor }}
          rows={2}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); } }}
        />
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category selector */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-xs p-1 rounded border"
            style={{ borderColor: palette.muted + "33", background: palette.bg }}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          {/* Reminder */}
          <input
            type="datetime-local"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="text-xs p-1 rounded border"
            style={{ borderColor: palette.muted + "33", background: palette.bg }}
          />
          <button
            onClick={handleAdd}
            disabled={!text.trim()}
            className="ml-auto px-3 py-1 rounded-lg text-white text-sm font-medium disabled:opacity-40 transition-colors"
            style={{ background: accentColor }}
          >
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}
