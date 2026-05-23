// Shared visual tokens. Use these instead of hardcoded values.

export const colors = {
  background: "#101318",
  surface: "#1a1f27",
  surfaceMuted: "#141a22",
  surfaceLight: "#1b2029",
  border: "#252d38",
  borderMuted: "#303846",
  borderStrong: "#39414f",

  text: "#f8fafc",
  textMuted: "#b7c2d3",
  textSubtle: "#97a3b6",
  textDim: "#7f8fa3",

  accent: "#f4b860",
  accentText: "#151922",
  teal: "#52c4c8",
  tealDark: "#2a6864",
  berry: "#d06b87",
  berryDark: "#684052",
  success: "#7ce0ab",
  successBg: "#214b35",
  warning: "#f0c985",
  warningBg: "#5f4a1f",
} as const;

export const radii = {
  sm: 10,
  md: 14, // default for cards/buttons (was 8 — feels too technical)
  lg: 18,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

export const pressed = {
  opacity: 0.78,
} as const;
