/* ─── Theme Color System ─── */

export interface ThemeSlots {
  accent: string;
  xp: string;
  streak: string;
  success: string;
  bgBase: string;
}

export const DEFAULT_THEME: ThemeSlots = {
  accent: "#E8E6DF",
  xp: "#C4913A",
  streak: "#D4622A",
  success: "#42A870",
  bgBase: "#090909",
};

export const THEME_STORAGE_KEY = "lumio-theme";

/* ─── Hex Utilities ─── */

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((c) => Math.max(0, Math.min(255, Math.round(c))))
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Lighten a hex color by `amount` (0-255 per channel, additive). */
export function lightenHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + amount, g + amount, b + amount);
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ─── Derive Full CSS Variable Map ─── */

export function deriveCssVars(slots: ThemeSlots): Record<string, string> {
  return {
    // Accent
    "--accent": slots.accent,

    // XP
    "--xp": slots.xp,
    "--xp-lo": rgba(slots.xp, 0.1),
    "--xp-mid": rgba(slots.xp, 0.22),
    "--xp-glow": rgba(slots.xp, 0.32),

    // Streak
    "--streak": slots.streak,
    "--streak-lo": rgba(slots.streak, 0.1),
    "--streak-mid": rgba(slots.streak, 0.22),

    // Success
    "--success": slots.success,
    "--success-lo": rgba(slots.success, 0.1),
    "--success-mid": rgba(slots.success, 0.2),

    // Background tiers (lighten by fixed increments)
    "--bg-base": slots.bgBase,
    "--bg-surface": lightenHex(slots.bgBase, 5),
    "--bg-raised": lightenHex(slots.bgBase, 13),
    "--bg-hover": lightenHex(slots.bgBase, 21),
  };
}

/* ─── Validation ─── */

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function isValidTheme(obj: unknown): obj is ThemeSlots {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.accent === "string" &&
    HEX_RE.test(o.accent) &&
    typeof o.xp === "string" &&
    HEX_RE.test(o.xp) &&
    typeof o.streak === "string" &&
    HEX_RE.test(o.streak) &&
    typeof o.success === "string" &&
    HEX_RE.test(o.success) &&
    typeof o.bgBase === "string" &&
    HEX_RE.test(o.bgBase)
  );
}
