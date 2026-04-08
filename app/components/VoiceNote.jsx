"use client";
import { Mic, Square, Play, Trash2 } from "lucide-react";
import useVoiceRecorder from "../hooks/useVoiceRecorder";

export default function VoiceNote({ audioData, onSave, onDelete, accentColor }) {
  const { isRecording, audioURL, audioLevel, startRecording, stopRecording, reset, setAudioURL } = useVoiceRecorder();
  const hasExisting = !!audioData;
  const hasNew = !!audioURL;

  return (
    <div className="flex items-center gap-2 mt-2">
      {/* Existing audio playback */}
      {hasExisting && !hasNew && (
        <>
          <audio src={audioData} controls className="h-8 flex-1" style={{ maxWidth: 200 }} />
          <button onClick={onDelete} className="p-1 rounded hover:bg-red-100" aria-label="Delete voice note">
            <Trash2 size={14} className="text-red-500" />
          </button>
        </>
      )}

      {/* New recording playback */}
      {hasNew && (
        <>
          <audio src={audioURL} controls className="h-8 flex-1" style={{ maxWidth: 200 }} />
          <button onClick={() => { onSave(audioURL); reset(); }} className="text-xs px-2 py-1 rounded text-white" style={{ background: accentColor }}>
            Save
          </button>
          <button onClick={reset} className="p-1 rounded hover:bg-gray-100" aria-label="Discard">
            <Trash2 size={14} />
          </button>
        </>
      )}

      {/* Record button */}
      {!hasNew && (
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-2 rounded-full transition-all ${isRecording ? "bg-red-500 text-white animate-pulse" : "hover:bg-gray-100"}`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? <Square size={14} /> : <Mic size={14} />}
        </button>
      )}

      {/* Waveform visualization */}
      {isRecording && (
        <div className="flex items-end gap-0.5 h-6">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-red-500 transition-all duration-75"
              style={{ height: `${Math.max(4, audioLevel * 24 * (0.5 + Math.random() * 0.5))}px` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
