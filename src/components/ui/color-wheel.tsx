"use client";

import { useRef, useEffect, useCallback, useState } from "react";

/* ─── HSL / RGB helpers ─── */

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * Math.max(0, Math.min(1, c)))
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hue = 0;
  if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) hue = ((b - r) / d + 2) * 60;
  else hue = ((r - g) / d + 4) * 60;
  return [hue, s, l];
}

/* ─── Component ─── */

interface ColorWheelProps {
  value: string;
  onChange: (hex: string) => void;
  size?: number;
}

export function ColorWheel({ value, onChange, size = 180 }: ColorWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hsl, setHsl] = useState<[number, number, number]>(() => hexToHsl(value));
  const [dragging, setDragging] = useState<"ring" | "box" | null>(null);
  const ringW = size * 0.12;
  const innerR = size / 2 - ringW - 4;

  // Sync external value changes
  useEffect(() => {
    setHsl(hexToHsl(value));
  }, [value]);

  /* ── Draw ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cx = size / 2,
      cy = size / 2,
      outerR = size / 2 - 1;

    ctx.clearRect(0, 0, size, size);

    // Hue ring
    for (let angle = 0; angle < 360; angle += 1) {
      const rad1 = ((angle - 0.5) * Math.PI) / 180;
      const rad2 = ((angle + 1.5) * Math.PI) / 180;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, rad1, rad2);
      ctx.arc(cx, cy, outerR - ringW, rad2, rad1, true);
      ctx.closePath();
      ctx.fillStyle = hslToHex(angle, 1, 0.5);
      ctx.fill();
    }

    // Inner SL box
    const boxSize = innerR * Math.SQRT2;
    const boxX = cx - boxSize / 2;
    const boxY = cy - boxSize / 2;

    // Draw saturation/lightness gradient
    const imgData = ctx.createImageData(Math.ceil(boxSize), Math.ceil(boxSize));
    for (let y = 0; y < Math.ceil(boxSize); y++) {
      for (let x = 0; x < Math.ceil(boxSize); x++) {
        const s = x / boxSize;
        const l = 1 - y / boxSize;
        const hex = hslToHex(hsl[0], s, l);
        const hr = hex.replace("#", "");
        const idx = (y * Math.ceil(boxSize) + x) * 4;
        imgData.data[idx] = parseInt(hr.substring(0, 2), 16);
        imgData.data[idx + 1] = parseInt(hr.substring(2, 4), 16);
        imgData.data[idx + 2] = parseInt(hr.substring(4, 6), 16);
        imgData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, boxX, boxY);

    // Ring indicator
    const hueRad = (hsl[0] * Math.PI) / 180;
    const indicatorR = outerR - ringW / 2;
    const ix = cx + indicatorR * Math.cos(hueRad);
    const iy = cy + indicatorR * Math.sin(hueRad);
    ctx.beginPath();
    ctx.arc(ix, iy, ringW / 2 - 1, 0, Math.PI * 2);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Box indicator
    const bx = boxX + hsl[1] * boxSize;
    const by = boxY + (1 - hsl[2]) * boxSize;
    ctx.beginPath();
    ctx.arc(bx, by, 6, 0, Math.PI * 2);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(bx, by, 4, 0, Math.PI * 2);
    ctx.fillStyle = value;
    ctx.fill();
  }, [hsl, size, ringW, innerR, value]);

  /* ── Pointer handling ── */
  const getPos = useCallback(
    (e: PointerEvent | React.PointerEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const { x, y } = getPos(e);
      const cx = size / 2,
        cy = size / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const outerR = size / 2 - 1;

      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      if (dist > outerR - ringW && dist < outerR + 2) {
        setDragging("ring");
        const angle = (Math.atan2(y - cy, x - cx) * 180) / Math.PI;
        const hue = (angle + 360) % 360;
        const newHsl: [number, number, number] = [hue, hsl[1], hsl[2]];
        setHsl(newHsl);
        onChange(hslToHex(newHsl[0], newHsl[1], newHsl[2]));
      } else if (dist < innerR * Math.SQRT2 / 2 + 4) {
        setDragging("box");
        const boxSize = innerR * Math.SQRT2;
        const boxX = cx - boxSize / 2;
        const boxY = cy - boxSize / 2;
        const s = Math.max(0, Math.min(1, (x - boxX) / boxSize));
        const l = Math.max(0, Math.min(1, 1 - (y - boxY) / boxSize));
        const newHsl: [number, number, number] = [hsl[0], s, l];
        setHsl(newHsl);
        onChange(hslToHex(newHsl[0], newHsl[1], newHsl[2]));
      }
    },
    [getPos, size, ringW, innerR, hsl, onChange]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const { x, y } = getPos(e);
      const cx = size / 2,
        cy = size / 2;

      if (dragging === "ring") {
        const angle = (Math.atan2(y - cy, x - cx) * 180) / Math.PI;
        const hue = (angle + 360) % 360;
        const newHsl: [number, number, number] = [hue, hsl[1], hsl[2]];
        setHsl(newHsl);
        onChange(hslToHex(newHsl[0], newHsl[1], newHsl[2]));
      } else if (dragging === "box") {
        const boxSize = innerR * Math.SQRT2;
        const boxX = cx - boxSize / 2;
        const boxY = cy - boxSize / 2;
        const s = Math.max(0, Math.min(1, (x - boxX) / boxSize));
        const l = Math.max(0, Math.min(1, 1 - (y - boxY) / boxSize));
        const newHsl: [number, number, number] = [hsl[0], s, l];
        setHsl(newHsl);
        onChange(hslToHex(newHsl[0], newHsl[1], newHsl[2]));
      }
    },
    [dragging, getPos, size, innerR, hsl, onChange]
  );

  const handlePointerUp = useCallback(() => setDragging(null), []);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ touchAction: "none", cursor: "crosshair", borderRadius: "50%" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
}
