import React, { CSSProperties } from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  style?: CSSProperties;
  className?: string;
}

/** Single skeleton block with shimmer animation */
export function Skeleton({ width = "100%", height = 16, radius, style, className }: SkeletonProps) {
  return (
    <div
      className={`skeleton${className ? ` ${className}` : ""}`}
      style={{
        width,
        height,
        borderRadius: radius ?? "var(--radius-sm)",
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

/** Circle skeleton (avatar, donut, ring) */
export function SkeletonCircle({ size = 48, style }: { size?: number; style?: CSSProperties }) {
  return (
    <Skeleton width={size} height={size} radius="50%" style={style} />
  );
}

/** Card wrapper for skeleton sections */
export function SkeletonCard({
  children,
  style,
  padding = "20px",
}: {
  children: React.ReactNode;
  style?: CSSProperties;
  padding?: string;
}) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Utility: flex row of skeletons with gap */
export function SkeletonRow({
  children,
  gap = 12,
  style,
}: {
  children: React.ReactNode;
  gap?: number;
  style?: CSSProperties;
}) {
  return (
    <div style={{ display: "flex", gap, alignItems: "center", ...style }}>
      {children}
    </div>
  );
}
