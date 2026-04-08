"use client";
import { useState, useRef, useCallback } from "react";

export default function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const analyser = useRef(null);
  const animFrame = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      analyser.current = ctx.createAnalyser();
      analyser.current.fftSize = 256;
      source.connect(analyser.current);

      const updateLevel = () => {
        if (!analyser.current) return;
        const data = new Uint8Array(analyser.current.frequencyBinCount);
        analyser.current.getByteFrequencyData(data);
        setAudioLevel(data.reduce((a, b) => a + b, 0) / data.length / 255);
        animFrame.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => setAudioURL(reader.result);
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
        cancelAnimationFrame(animFrame.current);
        ctx.close();
        setAudioLevel(0);
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  }, []);

  const reset = useCallback(() => { setAudioURL(null); setAudioLevel(0); }, []);

  return { isRecording, audioURL, audioLevel, startRecording, stopRecording, reset, setAudioURL };
}
