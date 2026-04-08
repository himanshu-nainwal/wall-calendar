"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, Pin, Play, Search, StickyNote, Trash2, Pencil, Plus, Square } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { listDaysInRange, normalizeRange } from "@/lib/calendar-utils";
import type { SeasonPalette } from "@/lib/season-theme";
import type { NoteEntry, SelectionState } from "@/types/wall-calendar";

type Props = {
  palette: SeasonPalette;
  monthlyMemo: string;
  onMonthlyMemoChange: (v: string) => void;
  notes: NoteEntry[];
  onAddNote: (body: string, scope: NoteEntry["scope"], voiceUrl?: string) => void;
  onUpdateNote: (id: string, body: string) => void;
  onDeleteNote: (id: string) => void;
  selection: SelectionState;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
};

type RecordState = "idle" | "recording" | "done";

export function NotesMemoPanel({
  palette,
  monthlyMemo,
  onMonthlyMemoChange,
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  selection,
  searchQuery,
  onSearchQueryChange,
}: Props) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");

  // Voice recording state
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voicePreviewUrl, setVoicePreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const rangeKey =
    selection.start && selection.end
      ? normalizeRange(selection.start, selection.end)
      : null;

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => n.body.toLowerCase().includes(q));
  }, [notes, searchQuery]);

  const dayNotes = useMemo(() => {
    if (!selection.start || selection.end) return [];
    return filteredNotes.filter(
      (n) => n.scope.kind === "day" && n.scope.key === selection.start
    );
  }, [filteredNotes, selection.start, selection.end]);

  const rangeNotes = useMemo(() => {
    if (!rangeKey) return [];
    return filteredNotes.filter(
      (n) =>
        n.scope.kind === "range" &&
        n.scope.start === rangeKey.start &&
        n.scope.end === rangeKey.end
    );
  }, [filteredNotes, rangeKey]);

  const agendaDays =
    rangeKey && selection.start && selection.end
      ? listDaysInRange(rangeKey.start, rangeKey.end)
      : selection.start && !selection.end
        ? [selection.start]
        : [];

  // ── Voice recording helpers ─────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setVoiceBlob(blob);
        const url = URL.createObjectURL(blob);
        setVoicePreviewUrl(url);
        setRecordState("done");
      };
      mr.start();
      setRecordState("recording");
    } catch {
      alert("Microphone access denied. Please allow mic permissions.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const discardVoice = () => {
    if (voicePreviewUrl) URL.revokeObjectURL(voicePreviewUrl);
    setVoiceBlob(null);
    setVoicePreviewUrl(null);
    setRecordState("idle");
  };

  const getScope = (): NoteEntry["scope"] | null => {
    if (rangeKey) return { kind: "range", start: rangeKey.start, end: rangeKey.end };
    if (selection.start && !selection.end) return { kind: "day", key: selection.start };
    return null;
  };

  const submitNote = async () => {
    const scope = getScope();
    if (!scope) return;
    if (!draft.trim() && !voiceBlob) return;

    let voiceUrl: string | undefined;
    if (voiceBlob) {
      // Convert blob to base64 data URL for persistence
      const reader = new FileReader();
      voiceUrl = await new Promise<string>((res) => {
        reader.onloadend = () => res(reader.result as string);
        reader.readAsDataURL(voiceBlob);
      });
    }

    onAddNote(draft.trim(), scope, voiceUrl);
    setDraft("");
    discardVoice();
  };

  const canSubmit = !!(draft.trim() || voiceBlob);
  const hasSelection = !!(rangeKey || (selection.start && !selection.end));

  return (
    <aside className="relative">
      <div
        className="absolute -right-2 top-8 z-10 hidden h-24 w-3 rotate-3 rounded-sm shadow-lg md:block"
        style={{
          background: `repeating-linear-gradient(-45deg, ${palette.ribbon}, ${palette.ribbon} 4px, transparent 4px, transparent 8px)`,
          opacity: 0.85,
        }}
        aria-hidden
      />
      <div className="rounded-2xl border border-amber-200/60 bg-[#fffdf8] p-4 shadow-[8px_16px_40px_-12px_rgba(0,0,0,0.15)] dark:border-amber-900/40 dark:bg-[#1c1917] dark:shadow-[8px_16px_40px_-12px_rgba(0,0,0,0.5)] sm:p-5">
        <div className="flex items-start gap-3 border-b border-amber-900/10 pb-4 dark:border-amber-100/10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
            <StickyNote className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Memo board
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Monthly scratch pad, day jots, and range notes — saved on this device.
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search notes…"
            className="w-full rounded-xl border border-zinc-200 bg-white/90 py-2.5 pl-10 pr-3 text-sm text-zinc-900 shadow-inner outline-none transition placeholder:text-zinc-400 focus:border-[var(--wc-focus)] focus:ring-2 focus:ring-[var(--wc-focus)]/30 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100"
          />
        </div>

        <div className="mt-5">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <Pin className="h-3.5 w-3.5" />
            Month overview
          </label>
          <textarea
            value={monthlyMemo}
            onChange={(e) => onMonthlyMemoChange(e.target.value)}
            rows={3}
            className="mt-2 w-full resize-y rounded-xl border border-zinc-200 bg-[linear-gradient(to_bottom,transparent_1.4rem,#f4f4f5_1.4rem)] bg-[length:100%_1.4rem] p-3 font-mono text-sm leading-[1.4rem] text-zinc-800 shadow-inner outline-none focus:border-[var(--wc-focus)] focus:ring-2 focus:ring-[var(--wc-focus)]/30 dark:border-zinc-700 dark:bg-zinc-900/60 dark:bg-[linear-gradient(to_bottom,transparent_1.4rem,#27272a_1.4rem)] dark:text-zinc-100"
            placeholder="Goals, reminders, or a quote for the month…"
          />
        </div>

        {agendaDays.length > 0 && (
          <div className="mt-5 rounded-xl border border-dashed border-zinc-300/80 bg-white/60 p-3 dark:border-zinc-600 dark:bg-zinc-900/40">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Mini agenda
            </p>
            <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-sm text-zinc-700 dark:text-zinc-300">
              {agendaDays.slice(0, 14).map((iso) => (
                <li key={iso} className="flex justify-between gap-2">
                  <span className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                    {iso}
                  </span>
                  <span className="truncate text-zinc-500 dark:text-zinc-400">
                    {(notes.filter((n) => n.scope.kind === "day" && n.scope.key === iso).length ||
                      0) + " notes"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {rangeKey
              ? `Range ${rangeKey.start} → ${rangeKey.end}`
              : selection.start && !selection.end
                ? `Day ${selection.start}`
                : "Select dates on the calendar"}
          </p>
          <div className="mt-2 space-y-2">
            <AnimatePresence mode="popLayout">
              {(rangeKey ? rangeNotes : dayNotes).map((n) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="group relative rounded-xl border border-amber-300/50 bg-amber-50/80 p-3 shadow-sm dark:border-amber-800/50 dark:bg-amber-950/30"
                >
                  {editingId === n.id ? (
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-zinc-200 bg-white p-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                    />
                  ) : (
                    <>
                      {n.body && (
                        <p className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
                          {n.body}
                        </p>
                      )}
                      {/* Voice note playback */}
                      {n.voiceUrl && (
                        <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-white/80 px-2 py-1.5 dark:border-amber-800/40 dark:bg-zinc-900/60">
                          <Play className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                          <audio
                            src={n.voiceUrl}
                            controls
                            className="h-7 w-full min-w-0"
                            style={{ colorScheme: "light" }}
                          />
                        </div>
                      )}
                    </>
                  )}
                  <div className="mt-2 flex gap-2">
                    {editingId === n.id ? (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateNote(n.id, editBody);
                          setEditingId(null);
                        }}
                        className="rounded-lg bg-zinc-900 px-3 py-1 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(n.id);
                          setEditBody(n.body);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs font-medium dark:border-zinc-600"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteNote(n.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-700 dark:border-red-900 dark:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {hasSelection && (
            <div className="mt-3 space-y-2">
              {/* Text + Add row */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Add a sticky…"
                  className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--wc-focus)] focus:ring-2 focus:ring-[var(--wc-focus)]/30 dark:border-zinc-700 dark:bg-zinc-900"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitNote();
                    }
                  }}
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={submitNote}
                  disabled={!canSubmit}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md disabled:opacity-40"
                  style={{ backgroundColor: palette.accent }}
                >
                  <Plus className="h-4 w-4" />
                  Add note
                </motion.button>
              </div>

              {/* Voice note controls */}
              <div className="flex items-center gap-2">
                {recordState === "idle" && (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={startRecording}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:border-rose-300 hover:text-rose-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-rose-700 dark:hover:text-rose-400"
                  >
                    <Mic className="h-3.5 w-3.5" />
                    Voice note
                  </motion.button>
                )}

                {recordState === "recording" && (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={stopRecording}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                  >
                    <Square className="h-3.5 w-3.5 fill-rose-600" />
                    Stop recording
                  </motion.button>
                )}

                {recordState === "done" && voicePreviewUrl && (
                  <div className="flex flex-1 items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-1.5 dark:border-amber-800/40 dark:bg-amber-950/30">
                    <MicOff className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <audio
                      src={voicePreviewUrl}
                      controls
                      className="h-7 flex-1 min-w-0"
                      style={{ colorScheme: "light" }}
                    />
                    <button
                      type="button"
                      onClick={discardVoice}
                      className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      Discard
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {notes.length === 0 && !monthlyMemo && (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-6 text-center dark:border-zinc-600 dark:bg-zinc-900/40">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-inner dark:bg-zinc-800">
              <StickyNote className="h-7 w-7 text-amber-600 opacity-70" />
            </div>
            <p className="font-medium text-zinc-800 dark:text-zinc-100">
              Your memo board is ready
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Jot monthly intentions, tap a day for quick notes, or drag a range for
              trip plans — everything stays in your browser.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
