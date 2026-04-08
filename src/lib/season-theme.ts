export type Season = "winter" | "spring" | "summer" | "autumn";

export function seasonForMonth(monthIndex: number): Season {
  if (monthIndex <= 1 || monthIndex === 11) return "winter";
  if (monthIndex >= 2 && monthIndex <= 4) return "spring";
  if (monthIndex >= 5 && monthIndex <= 7) return "summer";
  return "autumn";
}

export type SeasonPalette = {
  accent: string;
  accentSoft: string;
  heroFrom: string;
  heroVia: string;
  heroTo: string;
  ribbon: string;
  ring: string;
  moodBg: string;
};

export function seasonPalette(season: Season, dark: boolean): SeasonPalette {
  if (dark) {
    const map: Record<Season, SeasonPalette> = {
      winter: {
        accent: "#7dd3fc",
        accentSoft: "rgba(125, 211, 252, 0.15)",
        heroFrom: "#0c4a6e",
        heroVia: "#1e3a5f",
        heroTo: "#0f172a",
        ribbon: "#38bdf8",
        ring: "rgba(56, 189, 248, 0.45)",
        moodBg:
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56,189,248,0.2), transparent 55%)",
      },
      spring: {
        accent: "#86efac",
        accentSoft: "rgba(134, 239, 172, 0.12)",
        heroFrom: "#14532d",
        heroVia: "#1e3a2f",
        heroTo: "#0f172a",
        ribbon: "#4ade80",
        ring: "rgba(74, 222, 128, 0.4)",
        moodBg:
          "radial-gradient(ellipse 70% 45% at 80% 0%, rgba(74,222,128,0.18), transparent 50%)",
      },
      summer: {
        accent: "#fcd34d",
        accentSoft: "rgba(252, 211, 77, 0.12)",
        heroFrom: "#78350f",
        heroVia: "#422006",
        heroTo: "#0f172a",
        ribbon: "#fbbf24",
        ring: "rgba(251, 191, 36, 0.4)",
        moodBg:
          "radial-gradient(ellipse 60% 40% at 20% 10%, rgba(251,191,36,0.15), transparent 50%)",
      },
      autumn: {
        accent: "#fb923c",
        accentSoft: "rgba(251, 146, 60, 0.12)",
        heroFrom: "#7c2d12",
        heroVia: "#431407",
        heroTo: "#0f172a",
        ribbon: "#f97316",
        ring: "rgba(249, 115, 22, 0.4)",
        moodBg:
          "radial-gradient(ellipse 75% 50% at 50% 0%, rgba(249,115,22,0.16), transparent 55%)",
      },
    };
    return map[season];
  }
  const map: Record<Season, SeasonPalette> = {
    winter: {
      accent: "#0284c7",
      accentSoft: "rgba(2, 132, 199, 0.12)",
      heroFrom: "#e0f2fe",
      heroVia: "#bae6fd",
      heroTo: "#f0f9ff",
      ribbon: "#0ea5e9",
      ring: "rgba(14, 165, 233, 0.35)",
      moodBg:
        "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(14,165,233,0.12), transparent 55%)",
    },
    spring: {
      accent: "#16a34a",
      accentSoft: "rgba(22, 163, 74, 0.1)",
      heroFrom: "#ecfccb",
      heroVia: "#d9f99d",
      heroTo: "#f7fee7",
      ribbon: "#22c55e",
      ring: "rgba(34, 197, 94, 0.35)",
      moodBg:
        "radial-gradient(ellipse 80% 50% at 90% 0%, rgba(34,197,94,0.1), transparent 50%)",
    },
    summer: {
      accent: "#d97706",
      accentSoft: "rgba(217, 119, 6, 0.1)",
      heroFrom: "#fef3c7",
      heroVia: "#fde68a",
      heroTo: "#fffbeb",
      ribbon: "#f59e0b",
      ring: "rgba(245, 158, 11, 0.35)",
      moodBg:
        "radial-gradient(ellipse 70% 45% at 15% 5%, rgba(245,158,11,0.12), transparent 50%)",
    },
    autumn: {
      accent: "#c2410c",
      accentSoft: "rgba(194, 65, 12, 0.1)",
      heroFrom: "#ffedd5",
      heroVia: "#fed7aa",
      heroTo: "#fff7ed",
      ribbon: "#ea580c",
      ring: "rgba(234, 88, 12, 0.35)",
      moodBg:
        "radial-gradient(ellipse 85% 55% at 50% 0%, rgba(234,88,12,0.1), transparent 55%)",
    },
  };
  return map[season];
}
