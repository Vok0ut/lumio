"use client";

import { useTilt } from "@/src/hooks/use-tilt";
import { useIsMobile } from "@/src/hooks/use-mobile";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  max?: number;
  scale?: number;
}

export function TiltCard({ children, className = "", style, max = 4, scale = 1.01 }: TiltCardProps) {
  const isMobile = useIsMobile();
  const { ref, tiltStyle, onMouseMove, onMouseLeave } = useTilt({ max, scale });

  if (isMobile) {
    return (
      <div className={`card ${className}`} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`card tilt-card ${className}`}
      style={{ ...style, ...tiltStyle }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}
