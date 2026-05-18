"use client";

import { useState } from "react";
import { useTheme } from "@/src/components/theme-provider";
import { ColorWheel } from "@/src/components/ui/color-wheel";
import type { ThemeSlots } from "@/src/lib/theme";

/* ─── 20 Curated Presets ─── */

interface Preset {
  name: string;
  slots: ThemeSlots;
}

const PRESETS: Preset[] = [
  {
    name: "Lumio Original",
    slots: { accent: "#E8E6DF", xp: "#C4913A", streak: "#D4622A", success: "#42A870", bgBase: "#090909" },
  },
  {
    name: "Midnight Blue",
    slots: { accent: "#7EB8DA", xp: "#E0A526", streak: "#E06840", success: "#4CAF7D", bgBase: "#080C14" },
  },
  {
    name: "Cyberpunk",
    slots: { accent: "#FF2D95", xp: "#FFD700", streak: "#FF6B2B", success: "#00FF88", bgBase: "#0A0A12" },
  },
  {
    name: "Forest Night",
    slots: { accent: "#A8C686", xp: "#D4A843", streak: "#C47A3A", success: "#6BBF7A", bgBase: "#0B0E09" },
  },
  {
    name: "Lavender Dream",
    slots: { accent: "#C4A8E0", xp: "#D4A03A", streak: "#D06848", success: "#68B888", bgBase: "#0C0A10" },
  },
  {
    name: "Rose Gold",
    slots: { accent: "#E8B4B4", xp: "#D4A260", streak: "#CC6A5A", success: "#6AAA7C", bgBase: "#0E0A0A" },
  },
  {
    name: "Arctic",
    slots: { accent: "#B8D8E8", xp: "#C8A84C", streak: "#D87A4A", success: "#58B88A", bgBase: "#080B0E" },
  },
  {
    name: "Amber Noir",
    slots: { accent: "#F0C060", xp: "#E8A830", streak: "#E07030", success: "#50A870", bgBase: "#0A0908" },
  },
  {
    name: "Neon Tokyo",
    slots: { accent: "#00E5FF", xp: "#FFB300", streak: "#FF5252", success: "#69F0AE", bgBase: "#08080E" },
  },
  {
    name: "Monokai",
    slots: { accent: "#F8F8F2", xp: "#E6DB74", streak: "#F92672", success: "#A6E22E", bgBase: "#0D0D0D" },
  },
  {
    name: "Emerald Dark",
    slots: { accent: "#50E8A0", xp: "#D0A840", streak: "#D46838", success: "#48C878", bgBase: "#080C0A" },
  },
  {
    name: "Copper Patina",
    slots: { accent: "#C89070", xp: "#B88840", streak: "#C06030", success: "#5DA878", bgBase: "#0A0908" },
  },
  {
    name: "Dracula",
    slots: { accent: "#BD93F9", xp: "#F1FA8C", streak: "#FF79C6", success: "#50FA7B", bgBase: "#0B0B10" },
  },
  {
    name: "Ocean Depth",
    slots: { accent: "#64B5F6", xp: "#FFB74D", streak: "#EF5350", success: "#66BB6A", bgBase: "#060A10" },
  },
  {
    name: "Sunset",
    slots: { accent: "#FFA07A", xp: "#F0C050", streak: "#E85040", success: "#6AB880", bgBase: "#0E0908" },
  },
  {
    name: "Mint Chocolate",
    slots: { accent: "#80E8C8", xp: "#D0A050", streak: "#C86848", success: "#5CC090", bgBase: "#090B0A" },
  },
  {
    name: "Nord",
    slots: { accent: "#88C0D0", xp: "#EBCB8B", streak: "#BF616A", success: "#A3BE8C", bgBase: "#0A0C10" },
  },
  {
    name: "Cherry Blossom",
    slots: { accent: "#F0A0B8", xp: "#D8A848", streak: "#D06050", success: "#68B080", bgBase: "#0C0A0B" },
  },
  {
    name: "Monochrome",
    slots: { accent: "#C8C8C8", xp: "#A0A0A0", streak: "#888888", success: "#B0B0B0", bgBase: "#0A0A0A" },
  },
  {
    name: "Solar Flare",
    slots: { accent: "#FFC107", xp: "#FF9800", streak: "#F44336", success: "#8BC34A", bgBase: "#0C0A06" },
  },
];

const SLOT_META: { key: keyof ThemeSlots; label: string }[] = [
  { key: "accent", label: "Acento" },
  { key: "xp", label: "Color XP" },
  { key: "streak", label: "Racha" },
  { key: "success", label: "Exito" },
  { key: "bgBase", label: "Fondo" },
];

interface ThemeCustomizerProps {
  isPremium: boolean;
}

type Tab = "presets" | "custom";

export function ThemeCustomizer({ isPremium }: ThemeCustomizerProps) {
  const { slots, setSlots, setSlot, resetToDefaults, isDefault } = useTheme();
  const [activeSlot, setActiveSlot] = useState<keyof ThemeSlots | null>(null);
  const [tab, setTab] = useState<Tab>("presets");

  if (!isPremium) {
    return (
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: 24,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Blurred preview behind */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginBottom: 20,
            filter: "blur(6px)",
            opacity: 0.3,
            pointerEvents: "none",
            flexWrap: "wrap",
          }}
        >
          {PRESETS.slice(0, 6).map((p) => (
            <div key={p.name} style={{ display: "flex", gap: 2 }}>
              {Object.values(p.slots).map((c, i) => (
                <div
                  key={i}
                  style={{ width: 14, height: 14, borderRadius: "50%", background: c }}
                />
              ))}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-lo)" }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--xp)",
              background: "var(--xp-lo)",
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
            }}
          >
            PREMIUM
          </span>
        </div>

        <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-lo)", lineHeight: 1.5, margin: 0 }}>
          Personaliza los colores de toda la app con Premium
        </p>
      </div>
    );
  }

  /* ─── Check if current slots match a preset ─── */
  const activePreset = PRESETS.find(
    (p) =>
      p.slots.accent === slots.accent &&
      p.slots.xp === slots.xp &&
      p.slots.streak === slots.streak &&
      p.slots.success === slots.success &&
      p.slots.bgBase === slots.bgBase
  );

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 20,
      }}
    >
      {/* Tabs: Presets | Custom */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 18,
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
          border: "1px solid var(--border)",
        }}
      >
        {(["presets", "custom"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setActiveSlot(null); }}
            style={{
              flex: 1,
              padding: "8px 0",
              background: tab === t ? "var(--bg-hover)" : "transparent",
              border: "none",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: tab === t ? "var(--text-hi)" : "var(--text-lo)",
              cursor: "pointer",
              transition: "all 0.2s",
              borderRight: t === "presets" ? "1px solid var(--border)" : "none",
            }}
          >
            {t === "presets" ? "Paletas" : "Personalizado"}
          </button>
        ))}
      </div>

      {/* ── Presets Tab ── */}
      {tab === "presets" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: 8,
          }}
        >
          {PRESETS.map((preset) => {
            const isActive = activePreset?.name === preset.name;
            return (
              <button
                key={preset.name}
                onClick={() => setSlots(preset.slots)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 8px",
                  background: isActive ? "var(--bg-hover)" : "transparent",
                  border: isActive ? "1px solid var(--accent)" : "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.borderColor = "var(--border-mid)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                {/* Color dots */}
                <div style={{ display: "flex", gap: 4 }}>
                  {SLOT_META.map(({ key }) => (
                    <div
                      key={key}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: preset.slots[key],
                        border: "1.5px solid rgba(255,255,255,0.1)",
                        transition: "transform 0.2s",
                      }}
                    />
                  ))}
                </div>
                {/* Name */}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: isActive ? "var(--text-hi)" : "var(--text-lo)",
                    textAlign: "center",
                    lineHeight: 1.3,
                    transition: "color 0.2s",
                  }}
                >
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Custom Tab ── */}
      {tab === "custom" && (
        <>
          {/* Slot swatches row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {SLOT_META.map(({ key, label }) => {
              const isActive = activeSlot === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveSlot(isActive ? null : key)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    background: isActive ? "var(--bg-hover)" : "transparent",
                    border: isActive ? "1px solid var(--border-hi)" : "1px solid transparent",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 14px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: slots[key],
                      border: "2px solid var(--border-mid)",
                      boxShadow: isActive ? `0 0 12px ${slots[key]}44` : "none",
                      transition: "all 0.2s",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      color: isActive ? "var(--text-hi)" : "var(--text-lo)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      transition: "color 0.2s",
                    }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active color wheel */}
          {activeSlot && (
            <div
              style={{
                marginTop: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                animation: "fadeIn 0.25s ease-out",
              }}
            >
              <ColorWheel
                value={slots[activeSlot]}
                onChange={(hex) => setSlot(activeSlot, hex)}
                size={170}
              />

              {/* Hex display */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    background: slots[activeSlot],
                    border: "1px solid var(--border-mid)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--text-mid)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {slots[activeSlot].toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Reset button */}
      {!isDefault && (
        <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
          <button
            onClick={resetToDefaults}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "6px 14px",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-lo)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-mid)";
              e.currentTarget.style.borderColor = "var(--border-mid)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-lo)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            Restablecer colores
          </button>
        </div>
      )}
    </div>
  );
}
