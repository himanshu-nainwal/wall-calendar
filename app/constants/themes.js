export const THEMES = {
  Mountain: {
    label: "Mountain",
    keywords: ["mountain winter", "mountain spring flowers", "mountain lake", "mountain meadow", "mountain sunrise", "mountain summer", "mountain autumn", "mountain forest fall", "mountain snow", "mountain fog", "mountain frost", "mountain peak winter"],
    palette: { primary: "#4A6FA5", accent: "#6B8FCC", bg: "#F5F0EB", surface: "#FFFFFF", text: "#1A1A2E", muted: "#6B7280" },
    darkPalette: { primary: "#6B8FCC", accent: "#8BAAE0", bg: "#0F172A", surface: "#1E293B", text: "#E2E8F0", muted: "#94A3B8" },
    font: "'Inter', sans-serif",
    shape: "polygon(50% 0%, 0% 100%, 100% 100%)",
  },
  Ocean: {
    label: "Ocean",
    keywords: ["ocean waves", "ocean spring", "ocean coral", "ocean tropical", "ocean sunset", "ocean beach summer", "ocean tide", "ocean cliff autumn", "ocean storm", "ocean calm", "ocean ice", "ocean arctic"],
    palette: { primary: "#0077B6", accent: "#00B4D8", bg: "#F0F7FA", surface: "#FFFFFF", text: "#023E58", muted: "#5B8A9A" },
    darkPalette: { primary: "#00B4D8", accent: "#48CAE4", bg: "#0A1628", surface: "#112240", text: "#CAF0F8", muted: "#7FB3C4" },
    font: "'Inter', sans-serif",
    shape: "ellipse(50% 40% at 50% 50%)",
  },
  Forest: {
    label: "Forest",
    keywords: ["forest snow", "forest path spring", "forest green", "forest wildflowers", "forest canopy", "forest river summer", "forest trail", "forest autumn leaves", "forest fog", "forest rain", "forest frost", "forest winter"],
    palette: { primary: "#2D6A4F", accent: "#52B788", bg: "#F2F7F4", surface: "#FFFFFF", text: "#1B4332", muted: "#6B8F7B" },
    darkPalette: { primary: "#52B788", accent: "#74C69D", bg: "#0B1F15", surface: "#1A3A2A", text: "#D8F3DC", muted: "#7FB89B" },
    font: "'Inter', sans-serif",
    shape: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  },
  Minimal: {
    label: "Minimal",
    keywords: ["minimal architecture", "minimal white", "minimal design", "minimal interior", "minimal abstract", "minimal geometry", "minimal lines", "minimal texture", "minimal concrete", "minimal shadow", "minimal light", "minimal space"],
    palette: { primary: "#333333", accent: "#666666", bg: "#FAFAFA", surface: "#FFFFFF", text: "#111111", muted: "#999999" },
    darkPalette: { primary: "#CCCCCC", accent: "#AAAAAA", bg: "#111111", surface: "#1A1A1A", text: "#EEEEEE", muted: "#777777" },
    font: "'Inter', sans-serif",
    shape: "inset(10% 10% 10% 10%)",
  },
  "Dark Academia": {
    label: "Dark Academia",
    keywords: ["old library", "vintage books spring", "antique desk", "classical architecture", "old university", "vintage map", "leather books", "autumn library", "gothic architecture", "candlelight books", "vintage winter", "classical painting"],
    palette: { primary: "#5C4033", accent: "#8B6914", bg: "#F5F0E8", surface: "#FFF8EE", text: "#2C1810", muted: "#8B7355" },
    darkPalette: { primary: "#C4956A", accent: "#D4A843", bg: "#1A1209", surface: "#2C1F10", text: "#E8D5B7", muted: "#9B8B6B" },
    font: "'Georgia', serif",
    shape: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
  },
};

export const LOCALES = [
  { code: "en-US", label: "English" },
  { code: "es-ES", label: "Español" },
  { code: "fr-FR", label: "Français" },
  { code: "hi-IN", label: "हिन्दी" },
  { code: "de-DE", label: "Deutsch" },
  { code: "ja-JP", label: "日本語" },
  { code: "zh-CN", label: "中文" },
  { code: "pt-BR", label: "Português" },
];
