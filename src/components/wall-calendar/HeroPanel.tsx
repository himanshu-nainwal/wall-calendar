"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { SeasonPalette } from "@/lib/season-theme";

type Props = {
  year: number;
  monthIndex: number;
  palette: SeasonPalette;
  monthLabel: string;
  caption: string;
};

export function HeroPanel({
  year,
  monthIndex,
  palette,
  monthLabel,
  caption,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  const seed = `${year}-${monthIndex + 1}`;
  const src = `https://picsum.photos/seed/${encodeURIComponent(seed)}/1400/720`;

  return (
    <motion.figure
      ref={ref}
      className="relative isolate overflow-hidden rounded-2xl border border-black/5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] dark:border-white/10 dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(135deg, ${palette.heroFrom}, ${palette.heroVia} 45%, ${palette.heroTo})`,
        }}
        aria-hidden
      />
      <motion.div className="relative aspect-[16/9] min-h-[180px] w-full sm:aspect-[21/9] sm:min-h-[220px]" style={{ y }}>
        <Image
          src={src}
          alt=""
          fill
          className="object-cover mix-blend-overlay opacity-90 dark:opacity-80"
          sizes="(max-width: 768px) 100vw, 66vw"
          priority
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent dark:from-black/70"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent dark:from-white/5"
          aria-hidden
        />
      </motion.div>
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-5 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/70"
              style={{ textShadow: "0 1px 12px rgba(0,0,0,0.35)" }}
            >
              Wall calendar
            </p>
            <p
              className="mt-1 font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl md:text-5xl"
              style={{ textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}
            >
              {monthLabel}
            </p>
          </div>
          <p
            className="max-w-md text-sm leading-relaxed text-white/85 sm:text-right"
            style={{ textShadow: "0 1px 10px rgba(0,0,0,0.35)" }}
          >
            {caption}
          </p>
        </div>
        <div
          className="mt-4 hidden h-px w-24 rounded-full sm:block"
          style={{
            background: `linear-gradient(90deg, ${palette.ribbon}, transparent)`,
          }}
          aria-hidden
        />
      </figcaption>
      <div
        className="absolute right-0 top-0 h-16 w-16 rounded-bl-2xl border-b border-l border-white/25 bg-white/10 backdrop-blur-md dark:border-white/10 dark:bg-black/20"
        aria-hidden
      />
    </motion.figure>
  );
}
