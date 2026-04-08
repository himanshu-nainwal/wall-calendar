"use client";
import { motion } from "framer-motion";

// Spiral binding SVG - realistic wire coils
function SpiralBinding() {
  const coils = 15;
  return (
    <div className="relative w-full h-8 z-20 flex items-center justify-center print:hidden" aria-hidden="true">
      <svg width="100%" height="32" viewBox="0 0 800 32" preserveAspectRatio="xMidYMid meet" className="drop-shadow-md">
        {Array.from({ length: coils }, (_, i) => {
          const x = 30 + (i * (740 / (coils - 1)));
          return (
            <g key={i}>
              <ellipse cx={x} cy="16" rx="12" ry="14" fill="none" stroke="#A0A0A0" strokeWidth="2.5" />
              <ellipse cx={x} cy="16" rx="12" ry="14" fill="none" stroke="#D0D0D0" strokeWidth="1" strokeDasharray="0 28 44" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function CalendarShell({ children, palette }) {
  return (
    <motion.div
      className="relative max-w-6xl mx-auto rounded-2xl overflow-hidden select-none"
      style={{
        background: palette.surface,
        boxShadow: "0 25px 60px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)",
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SpiralBinding />
      {children}
    </motion.div>
  );
}
