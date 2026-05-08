"use client";

import { useEffect, useState } from "react";
import {
  RANKS,
  PRICING,
  getDiscountedPrice,
  getLevelFromXP,
  getRankForLevel,
} from "@/src/lib/gamification";
import { useIsMobile } from "@/src/hooks/use-mobile";

const FEATURES = [
  "Dashboard completo",
  "Habitos ilimitados",
  "Kanban de tareas",
  "Journal + estadisticas",
  "Arbol de habilidades",
  "Informes IA",
];

export default function PricingPage() {
  const isMobile = useIsMobile();
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        const info = getLevelFromXP(data.totalXp ?? 0);
        setLevel(info.level);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const rank = getRankForLevel(level);
  const monthly = getDiscountedPrice(PRICING.monthly, level);
  const annual = getDiscountedPrice(PRICING.annual, level);

  if (loading) {
    return (
      <div className="section-inner" style={{ alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-lo)" }}>
          Cargando...
        </span>
      </div>
    );
  }

  return (
    <div className="section-inner">
      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <h1 className="t-title" style={{ marginBottom: 8 }}>
          Pricing
        </h1>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--text-mid)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          Tu rango actual:
          <span className="badge badge-white">{rank.name}</span>
          {rank.discount > 0 && (
            <span className="badge badge-dim">{rank.discount}% dto.</span>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 16,
          maxWidth: 640,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Monthly */}
        <div className="card" style={{ padding: isMobile ? 20 : 28 }}>
          <span className="t-label" style={{ marginBottom: 16, display: "block" }}>
            Mensual
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 36,
                fontWeight: 700,
                color: "var(--text-hi)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              ${monthly.price.toFixed(2)}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-lo)",
              }}
            >
              /mes
            </span>
          </div>
          {monthly.discount > 0 && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-lo)",
                marginBottom: 16,
              }}
            >
              <span style={{ textDecoration: "line-through" }}>
                ${PRICING.monthly.toFixed(2)}
              </span>{" "}
              <span style={{ color: "var(--accent)" }}>-{monthly.discount}%</span>
            </div>
          )}
          {monthly.discount === 0 && <div style={{ height: 16, marginBottom: 16 }} />}
          <button className="btn btn-ghost" style={{ width: "100%" }}>
            Elegir plan
          </button>
        </div>

        {/* Annual (recommended) */}
        <div
          className="card"
          style={{
            padding: isMobile ? 20 : 28,
            position: "relative",
            overflow: "visible",
          }}
        >
          {/* Glowing animated border */}
          <div
            style={{
              position: "absolute",
              inset: -1,
              borderRadius: "var(--radius-lg)",
              background:
                "conic-gradient(from var(--glow-angle, 0deg), var(--accent), rgba(232,230,223,0.15), var(--accent), rgba(232,230,223,0.15), var(--accent))",
              zIndex: -1,
              animation: "glowSpin 4s linear infinite",
              opacity: 0.6,
            }}
          />
          <style>{`
            @property --glow-angle {
              syntax: '<angle>';
              initial-value: 0deg;
              inherits: false;
            }
            @keyframes glowSpin {
              to { --glow-angle: 360deg; }
            }
          `}</style>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span className="t-label">Anual</span>
            <span
              className="badge badge-white"
              style={{ fontSize: 8 }}
            >
              Recomendado
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 36,
                fontWeight: 700,
                color: "var(--text-hi)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              ${annual.price.toFixed(2)}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-lo)",
              }}
            >
              /mes
            </span>
          </div>
          {annual.discount > 0 && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-lo)",
                marginBottom: 16,
              }}
            >
              <span style={{ textDecoration: "line-through" }}>
                ${PRICING.annual.toFixed(2)}
              </span>{" "}
              <span style={{ color: "var(--accent)" }}>-{annual.discount}%</span>
            </div>
          )}
          {annual.discount === 0 && <div style={{ height: 16, marginBottom: 16 }} />}
          <button className="btn btn-primary" style={{ width: "100%" }}>
            Elegir plan
          </button>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 640, margin: "0 auto", width: "100%" }}>
        <span className="t-label" style={{ marginBottom: 12, display: "block" }}>
          Incluye
        </span>
        <div className="card" style={{ overflow: "hidden" }}>
          {FEATURES.map((feat, i) => (
            <div
              key={feat}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 18px",
                borderBottom: i < FEATURES.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 3,
                  background: "rgba(232,230,223,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: "var(--accent)",
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--text-hi)",
                }}
              >
                {feat}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rank Table */}
      <div style={{ maxWidth: 640, margin: "0 auto", width: "100%" }}>
        <span className="t-label" style={{ marginBottom: 12, display: "block" }}>
          Rangos y descuentos
        </span>
        <div className="card" style={{ overflow: "hidden" }}>
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              padding: "10px 18px",
              borderBottom: "1px solid var(--border-mid)",
            }}
          >
            <span className="t-label" style={{ color: "var(--text-lo)" }}>Rango</span>
            <span className="t-label" style={{ color: "var(--text-lo)", textAlign: "center" }}>
              Niveles
            </span>
            <span className="t-label" style={{ color: "var(--text-lo)", textAlign: "right" }}>
              Descuento
            </span>
          </div>
          {/* Rows */}
          {RANKS.map((r, i) => {
            const isCurrent = rank.name === r.name;
            return (
              <div
                key={r.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  padding: "10px 18px",
                  borderBottom: i < RANKS.length - 1 ? "1px solid var(--border)" : "none",
                  background: isCurrent ? "rgba(232,230,223,0.06)" : "transparent",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: isCurrent ? "var(--accent)" : "var(--text-hi)",
                      fontWeight: isCurrent ? 700 : 400,
                    }}
                  >
                    {r.name}
                  </span>
                  {isCurrent && (
                    <span className="badge badge-white" style={{ fontSize: 8 }}>
                      Tu
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--text-mid)",
                    textAlign: "center",
                  }}
                >
                  {r.minLevel}–{r.maxLevel}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: r.discount > 0 ? "var(--accent)" : "var(--text-lo)",
                    textAlign: "right",
                    fontWeight: r.discount > 0 ? 600 : 400,
                  }}
                >
                  {r.discount > 0 ? `${r.discount}%` : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom spacer for mobile */}
      {isMobile && <div style={{ height: 64 }} />}
    </div>
  );
}
