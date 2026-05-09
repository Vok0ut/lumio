"use client";

import { useEffect, useRef, useCallback } from "react";
import { useIsMobile } from "@/src/hooks/use-mobile";

export function ClickRipple() {
  const isMobile = useIsMobile();
  const layerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: MouseEvent) => {
    const layer = layerRef.current;
    if (!layer) return;

    const ripple = document.createElement("div");
    ripple.className = "ripple";
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    layer.appendChild(ripple);

    ripple.addEventListener("animationend", () => ripple.remove());
  }, []);

  useEffect(() => {
    if (isMobile) return;
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [isMobile, handleClick]);

  if (isMobile) return null;

  return <div ref={layerRef} className="ripple-layer" />;
}
