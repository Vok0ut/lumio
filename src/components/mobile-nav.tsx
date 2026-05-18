"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/src/components/ui/icons";
import { useIsMobile } from "@/src/hooks/use-mobile";

/* Primary slots — always visible in bottom bar */
const PRIMARY = [
  { key: "dashboard",  label: "Inicio",    icon: "grid" },
  { key: "habits",     label: "Habitos",   icon: "repeat" },
  { key: "tasks",      label: "Tareas",    icon: "check-square" },
  { key: "nutrition",  label: "Nutricion", icon: "heart" },
] as const;

/* Secondary items — shown in the "Más" drawer */
const SECONDARY = [
  { key: "goals",        label: "Metas",      icon: "target" },
  { key: "journal",      label: "Journal",    icon: "book" },
  { key: "calendar",     label: "Calendario", icon: "calendar" },
  { key: "stats",        label: "Stats",      icon: "bar-chart" },
  { key: "achievements", label: "Logros",     icon: "award" },
  { key: "community",   label: "Comunidad",  icon: "users" },
  { key: "pricing",      label: "Pricing",    icon: "tag" },
  { key: "profile",      label: "Perfil",     icon: "user" },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!isMobile) return null;

  const isSecondaryActive = SECONDARY.some(
    (item) => pathname === `/${item.key}`
  );

  const navigate = (key: string) => {
    router.push(`/${key}`);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* ── Backdrop ── */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 48,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* ── "Más" Drawer ── */}
      <div
        style={{
          position: "fixed",
          left: 0, right: 0,
          bottom: drawerOpen ? 64 : "-100%",
          zIndex: 49,
          background: "#0C0C0B",
          border: "1px solid var(--border-mid)",
          borderBottom: "none",
          borderRadius: "16px 16px 0 0",
          padding: "20px 20px 8px",
          transition: "bottom 0.32s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: "var(--border-hi)", margin: "0 auto 20px",
        }} />

        {/* Grid of secondary pages */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 4,
        }}>
          {SECONDARY.map((item) => {
            const active = pathname === `/${item.key}`;
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                style={{
                  background: active ? "var(--xp-lo)" : "transparent",
                  border: `1px solid ${active ? "var(--xp-mid)" : "var(--border)"}`,
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "14px 8px",
                  cursor: "pointer",
                  color: active ? "var(--xp)" : "var(--text-mid)",
                  transition: "all 0.15s",
                }}
              >
                <Icon name={item.icon} size={20} />
                <span style={{
                  fontSize: 9,
                  fontFamily: "var(--font-mono)",
                  fontWeight: active ? 600 : 400,
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <nav
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          height: 64,
          background: "rgba(10,10,9,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          zIndex: 50,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {PRIMARY.map((item) => {
          const active = pathname === `/${item.key}`;
          return (
            <button
              key={item.key}
              onClick={() => { navigate(item.key); setDrawerOpen(false); }}
              style={{
                background: "none", border: "none",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 4,
                cursor: "pointer",
                color: active ? "var(--xp)" : "var(--text-lo)",
                transition: "color 0.15s",
                padding: "6px 12px",
                flex: 1,
              }}
            >
              <Icon name={item.icon} size={20} />
              <span style={{
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                fontWeight: active ? 600 : 400,
                letterSpacing: "0.04em",
              }}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* "Más" button */}
        <button
          onClick={() => setDrawerOpen((o) => !o)}
          style={{
            background: "none", border: "none",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 4,
            cursor: "pointer",
            color: isSecondaryActive || drawerOpen ? "var(--xp)" : "var(--text-lo)",
            transition: "color 0.15s",
            padding: "6px 12px",
            flex: 1,
          }}
        >
          {/* Animated hamburger → X */}
          <div style={{ width: 20, height: 20, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {drawerOpen ? (
              <span style={{ fontSize: 18, lineHeight: 1, color: "inherit", fontWeight: 300 }}>✕</span>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: i === 1 ? 12 : 16,
                    height: 1.5,
                    background: "currentColor",
                    borderRadius: 1,
                  }} />
                ))}
              </div>
            )}
          </div>
          <span style={{
            fontSize: 9,
            fontFamily: "var(--font-mono)",
            fontWeight: isSecondaryActive || drawerOpen ? 600 : 400,
            letterSpacing: "0.04em",
          }}>
            Más
          </span>
        </button>
      </nav>
    </>
  );
}
