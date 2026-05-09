"use client";

import { useCallback, useRef } from "react";

interface MagneticOptions {
  strength?: number;
  radius?: number;
}

export function useMagnetic({ strength = 0.3, radius = 80 }: MagneticOptions = {}) {
  const ref = useRef<HTMLElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) {
        const pull = (1 - dist / radius) * strength;
        el.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
      }
    },
    [strength, radius]
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0, 0)";
  }, []);

  const magneticStyle: React.CSSProperties = {
    transition: "transform 0.4s var(--ease-out-expo)",
    willChange: "transform",
  };

  return { ref, magneticStyle, onMouseMove, onMouseLeave };
}
