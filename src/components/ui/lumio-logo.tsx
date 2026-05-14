"use client";

export function LumioLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="44" stroke="rgba(232,230,223,0.9)" strokeWidth="3" fill="none" />
      {/* center dot */}
      <circle cx="50" cy="50" r="4" fill="rgba(232,230,223,0.9)" />
      {/* spokes — 6 lines radiating from center */}
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x2 = 50 + Math.cos(rad) * 28;
        const y2 = 50 + Math.sin(rad) * 28;
        return (
          <line
            key={angle}
            x1="50" y1="50" x2={x2} y2={y2}
            stroke="rgba(232,230,223,0.9)" strokeWidth="3" strokeLinecap="round"
          />
        );
      })}
      {/* top extra accent — the upward petal */}
      <line x1="50" y1="50" x2="50" y2="14" stroke="rgba(232,230,223,0.9)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
