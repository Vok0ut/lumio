"use client";

import { useCallback, useRef } from "react";

interface TiltOptions {
  max?: number;
  scale?: number;
  speed?: number;
}

export function useTilt({ max = 8, scale = 1.02, speed = 400 }: TiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * max;
      const rotateY = (x - 0.5) * max;
      el.style.setProperty("--lx", `${rotateX.toFixed(2)}`);
      el.style.setProperty("--ly", `${rotateY.toFixed(2)}`);
      el.style.setProperty("--lon", "1");
    },
    [max]
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--lx", "0");
    el.style.setProperty("--ly", "0");
    el.style.setProperty("--lon", "0");
  }, []);

  const tiltStyle: React.CSSProperties = {
    transform: `perspective(600px) rotateX(calc(var(--lx, 0) * 1deg)) rotateY(calc(var(--ly, 0) * 1deg)) scale(calc(1 + var(--lon, 0) * ${scale - 1}))`,
    transition: `transform ${speed}ms var(--ease-out-expo)`,
    willChange: "transform",
  };

  return { ref, tiltStyle, onMouseMove, onMouseLeave };
}
