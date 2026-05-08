"use client";

interface SparkLineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function SparkLine({
  data,
  width = 80,
  height = 24,
  color = "var(--accent)",
}: SparkLineProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface MiniBarProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function MiniBar({
  data,
  width = 100,
  height = 32,
  color = "var(--accent)",
}: MiniBarProps) {
  const max = Math.max(...data, 1);
  const gap = 2;
  const barW = (width - gap * (data.length - 1)) / data.length;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {data.map((v, i) => {
        const h = (v / max) * height;
        return (
          <rect
            key={i}
            x={i * (barW + gap)}
            y={height - h}
            width={barW}
            height={h}
            rx={1}
            fill={color}
            opacity={0.6 + (v / max) * 0.4}
          />
        );
      })}
    </svg>
  );
}
