"use client";

import { useEffect, useRef, useCallback } from "react";
import { useIsMobile } from "@/src/hooks/use-mobile";

const TRAIL_COUNT = 5;
const TRAIL_DECAY = 0.6;

export function CustomCursor() {
  const isMobile = useIsMobile();
  const dotRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pos = useRef({ x: -100, y: -100 });
  const trailPos = useRef<{ x: number; y: number }[]>(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 }))
  );
  const raf = useRef<number>(0);
  const hovering = useRef(false);

  const animate = useCallback(() => {
    const dot = dotRef.current;
    if (dot) {
      dot.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%) scale(${hovering.current ? 2.2 : 1})`;
    }

    for (let i = 0; i < TRAIL_COUNT; i++) {
      const prev = i === 0 ? pos.current : trailPos.current[i - 1];
      const lerp = 0.15 * Math.pow(TRAIL_DECAY, i);
      trailPos.current[i].x += (prev.x - trailPos.current[i].x) * lerp;
      trailPos.current[i].y += (prev.y - trailPos.current[i].y) * lerp;
      const node = trailRefs.current[i];
      if (node) {
        node.style.transform = `translate(${trailPos.current[i].x}px, ${trailPos.current[i].y}px) translate(-50%, -50%)`;
        node.style.opacity = `${0.3 - i * 0.05}`;
      }
    }
    raf.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      hovering.current = !!(
        target.closest("a, button, [role='button'], .card, .check, .nav-item, input, select, textarea")
      );
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    raf.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf.current);
    };
  }, [isMobile, animate]);

  if (isMobile) return null;

  return (
    <div className="custom-cursor-layer">
      {Array.from({ length: TRAIL_COUNT }, (_, i) => (
        <div
          key={i}
          ref={(el) => { trailRefs.current[i] = el; }}
          className="cursor-trail"
        />
      ))}
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}
