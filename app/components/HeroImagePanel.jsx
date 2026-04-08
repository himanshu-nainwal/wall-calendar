"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroImagePanel({ month, year, theme, locale, dominantColor, onImageLoad, weatherTint, direction }) {
  const [loaded, setLoaded] = useState(false);
  const keyword = theme.keywords[month] || "nature";
  const imgUrl = `https://source.unsplash.com/1200x500/?${encodeURIComponent(keyword)}`;
  const monthName = new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(year, month));
  const accentColor = dominantColor || theme.palette?.primary || "#4A6FA5";

  const handleLoad = (e) => {
    setLoaded(true);
    onImageLoad?.(e.target);
  };

  return (
    <div className="relative w-full h-56 sm:h-64 md:h-80 overflow-hidden print:h-48">
      {/* Skeleton */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse" style={{ background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)` }} />
      )}

      {/* Hero Image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={`${month}-${year}-${keyword}`}
          src={imgUrl}
          alt={`${monthName} ${year}`}
          className="absolute inset-0 w-full h-full object-cover"
          crossOrigin="anonymous"
          onLoad={handleLoad}
          initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
          transition={{ duration: 0.5 }}
        />
      </AnimatePresence>

      {/* Weather tint overlay */}
      {weatherTint && <div className="absolute inset-0" style={{ background: weatherTint }} />}

      {/* Geometric accent shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
          <polygon points="0,280 200,400 0,400" fill={accentColor} opacity="0.85" />
          <polygon points="0,320 300,400 0,400" fill={accentColor} opacity="0.6" />
          <polygon points="600,400 800,300 800,400" fill={accentColor} opacity="0.4" />
        </svg>
      </div>

      {/* Month + Year text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${month}-${year}`}
          className="absolute bottom-4 left-6 sm:bottom-6 sm:left-8 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg capitalize tracking-wide">
            {monthName}
          </h1>
          <p className="text-lg sm:text-xl text-white/80 font-light drop-shadow">{year}</p>
        </motion.div>
      </AnimatePresence>

      {/* Spiral shadow overlay at top */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/20 to-transparent" />
    </div>
  );
}
