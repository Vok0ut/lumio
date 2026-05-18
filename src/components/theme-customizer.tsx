"use client";

import { useState } from "react";
import { useTheme } from "@/src/components/theme-provider";
import { ColorWheel } from "@/src/components/ui/color-wheel";
import { DEFAULT_THEME, type ThemeSlots } from "@/src/lib/theme";

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

export function ThemeCustomizer({ isPremium }: ThemeCustomizerProps) {
  const { slots, setSlot, resetToDefaults, isDefault } = useTheme();
  const [activeSlot, setActiveSlot] = useState<keyof ThemeSlots | null>(null);

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
            gap: 12,
            marginBottom: 20,
            filter: "blur(6px)",
            opacity: 0.3,
            pointerEvents: "none",
          }}
        >
          {SLOT_META.map(({ key }) => (
            <div
              key={key}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: DEFAULT_THEME[key],
                border: "2px solid var(--border-mid)",
              }}
            />
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

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 20,
      }}
    >
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
