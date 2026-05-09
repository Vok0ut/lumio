"use client";

import { useMagnetic } from "@/src/hooks/use-magnetic";
import { useIsMobile } from "@/src/hooks/use-mobile";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number;
  glow?: boolean;
}

export function MagneticButton({
  children,
  className = "",
  strength = 0.3,
  glow = true,
  style,
  ...props
}: MagneticButtonProps) {
  const isMobile = useIsMobile();
  const { ref, magneticStyle, onMouseMove, onMouseLeave } = useMagnetic({ strength });

  if (isMobile) {
    return (
      <button className={`${className} ${glow ? "btn-glow" : ""}`} style={style} {...props}>
        {children}
      </button>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      className={`${className} ${glow ? "btn-glow" : ""}`}
      style={{ ...style, ...magneticStyle }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
}
