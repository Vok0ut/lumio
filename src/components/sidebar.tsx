"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/src/components/ui/icons";
import { XPRing } from "@/src/components/ui/xp-ring";
import { NAV_ITEMS } from "@/src/lib/gamification";
import { useIsMobile } from "@/src/hooks/use-mobile";

interface SidebarProps {
  level: number;
  xpProgress: number;
  rankName: string;
}

export function Sidebar({ level, xpProgress, rankName }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();

  if (isMobile) return null;

  const w = collapsed ? "var(--sidebar-w-collapsed)" : "var(--sidebar-w)";

  return (
    <nav className="sidebar" style={{ width: w }}>
      {/* Logo */}
      <div
        style={{
          height: 50,
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "0 16px" : "0 20px",
          borderBottom: "1px solid var(--border)",
          gap: 10,
          cursor: "pointer",
          flexShrink: 0,
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 16,
            fontWeight: 800,
            color: "var(--text-hi)",
            letterSpacing: "-0.02em",
          }}
        >
          {collapsed ? "L" : "lumio"}
        </span>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const href = `/${item.key === "dashboard" ? "dashboard" : item.key}`;
          const active = pathname === href;
          return (
            <button
              key={item.key}
              className={`nav-item ${active ? "active" : ""}`}
              onClick={() => router.push(href)}
              style={{
                padding: collapsed ? "10px 20px" : "10px 20px",
                gap: collapsed ? 0 : 10,
              }}
            >
              <Icon name={item.icon} size={16} />
              {!collapsed && (
                <span style={{ fontSize: 12 }}>{item.label}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* XP footer */}
      <div
        style={{
          padding: collapsed ? "12px 10px" : "16px 20px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <XPRing level={level} progress={xpProgress} size={collapsed ? 32 : 36} />
        {!collapsed && (
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "var(--font-sans)",
                color: "var(--text-hi)",
              }}
            >
              Nivel {level}
            </div>
            <div style={{ fontSize: 9, color: "var(--text-lo)" }}>
              {rankName}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
