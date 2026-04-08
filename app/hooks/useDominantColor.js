"use client";
import { useState, useCallback } from "react";

export default function useDominantColor() {
  const [dominantColor, setDominantColor] = useState(null);

  const extractColor = useCallback((imgElement) => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(imgElement, 0, 0, 50, 50);
      const data = ctx.getImageData(0, 0, 50, 50).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 16) {
        r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
      }
      r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
      setDominantColor(`rgb(${r},${g},${b})`);
    } catch {
      setDominantColor(null);
    }
  }, []);

  return { dominantColor, extractColor };
}
