"use client";

import { Icon } from "@/src/components/ui/icons";
import { useRouter } from "next/navigation";

interface PremiumWallProps {
  feature: string;
}

export function PremiumWall({ feature }: PremiumWallProps) {
  const router = useRouter();

  return (
    <div
      className="section-inner"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        minHeight: 300,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="lock" size={24} color="var(--text-lo)" />
      </div>

      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text-hi)",
            marginBottom: 6,
          }}
        >
          {feature}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--text-lo)",
            maxWidth: 280,
            lineHeight: 1.5,
          }}
        >
          Esta funcion esta disponible en el plan Premium.
          Actualiza para desbloquear todas las funciones.
        </div>
      </div>

      <button
        className="btn btn-primary"
        style={{ marginTop: 8, padding: "10px 24px" }}
        onClick={() => router.push("/pricing")}
      >
        Ver planes
      </button>
    </div>
  );
}
