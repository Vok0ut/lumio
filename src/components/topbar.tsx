"use client";

import { XPRing } from "@/src/components/ui/xp-ring";
import { LumioLogo } from "@/src/components/ui/lumio-logo";
import { useIsMobile } from "@/src/hooks/use-mobile";

interface TopbarProps {
  title: string;
  level: number;
  xpProgress: number;
  totalXp: number;
}

export function Topbar({ title, level, xpProgress, totalXp }: TopbarProps) {
  const isMobile = useIsMobile();

  return (
    <div className="main-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {isMobile && <LumioLogo size={18} />}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--text-mid)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600,
            color: "var(--xp)", letterSpacing: "0.04em",
          }}>
            {totalXp.toLocaleString()}
          </span>
          <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--text-lo)", letterSpacing: "0.1em" }}>
            XP
          </span>
        </div>
        {isMobile && <XPRing level={level} progress={xpProgress} size={28} />}
      </div>
    </div>
  );
}
