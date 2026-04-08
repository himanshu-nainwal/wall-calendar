"use client";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { CATEGORIES } from "../constants/categories";

export default function DayCell({
  dayObj, dateKey, isToday, isSelected, isInRange, isRangeEdge, isOutside,
  holiday, weather, noteCategories, hasNotes, hasPinned, noteDensity, heatmapMode,
  palette, accentColor, onClick, onMouseDown, onMouseEnter, onDoubleClick,
}) {
  const catColors = noteCategories?.map((c) => CATEGORIES.find((x) => x.id === c)?.color).filter(Boolean) || [];
  const bgColor = heatmapMode
    ? noteDensity > 0 ? `${accentColor}${Math.min(20 + noteDensity * 15, 80).toString(16)}` : "transparent"
    : isRangeEdge ? accentColor
    : isInRange ? `${accentColor}22`
    : holiday ? "#FEF2F2"
    : "transparent";
  const textColor = isRangeEdge ? "#FFFFFF" : isOutside ? palette.muted : palette.text;

  return (
    <motion.button
      className={`relative flex flex-col items-center justify-start p-1 min-h-[44px] sm:min-h-[56px] rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
        isOutside ? "opacity-40" : ""
      }`}
      style={{
        background: bgColor,
        color: textColor,
        focusRingColor: accentColor,
      }}
      whileHover={!isOutside ? { scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" } : {}}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onDoubleClick={onDoubleClick}
      role="gridcell"
      aria-label={`${dayObj.day}${isToday ? ", today" : ""}${holiday ? `, ${holiday}` : ""}${hasNotes ? ", has notes" : ""}`}
      aria-selected={isSelected}
      tabIndex={isOutside ? -1 : 0}
    >
      {/* Today indicator */}
      {isToday && !isRangeEdge && (
        <div className="absolute inset-0 rounded-lg border-2" style={{ borderColor: accentColor }} />
      )}

      {/* Date number */}
      <span className={`text-sm sm:text-base font-medium z-10 ${isRangeEdge ? "font-bold" : ""}`}>
        {dayObj.day}
      </span>

      {/* Holiday icon */}
      {holiday && <Star size={10} className="text-red-500 mt-0.5" fill="currentColor" />}

      {/* Weather */}
      {weather && !isOutside && (
        <span className="text-[10px] leading-none mt-0.5" title={`${weather.temp}°`}>
          {weather.icon}
        </span>
      )}

      {/* Category dots */}
      {catColors.length > 0 && !heatmapMode && (
        <div className="flex gap-0.5 mt-auto">
          {catColors.slice(0, 3).map((c, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
      )}

      {/* Pin indicator */}
      {hasPinned && <span className="absolute top-0 right-0.5 text-[8px]">📌</span>}
    </motion.button>
  );
}
