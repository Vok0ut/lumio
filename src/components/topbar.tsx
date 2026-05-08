"use client";

import { XPRing } from "@/src/components/ui/xp-ring";
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
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            fontSize: 10,
            color: "var(--text-lo)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {totalXp.toLocaleString()} XP
        </span>
        {isMobile && <XPRing level={level} progress={xpProgress} size={28} />}
      </div>
    </div>
  );
}
