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
import { TiltCard } from "@/src/components/ui/tilt-card";

type Period = "monthly" | "annual";

const FEATURES = [
  { name: "Dashboard completo", icon: "◎" },
  { name: "Habitos ilimitados", icon: "↻" },
  { name: "Kanban de tareas", icon: "☰" },
  { name: "Journal + estadisticas", icon: "✎" },
  { name: "Arbol de habilidades", icon: "⬡" },
  { name: "Informes IA", icon: "⚡" },
];

const FAQ_ITEMS = [
  { q: "¿Puedo cancelar en cualquier momento?", a: "Si, puedes cancelar tu suscripcion en cualquier momento desde tu perfil. No hay permanencia." },
  { q: "¿Como funcionan los descuentos por rango?", a: "Tu rango sube automaticamente al ganar XP. Cuanto mayor sea tu rango, mayor descuento obtienes en tu suscripcion." },
  { q: "¿Pierdo mi progreso si cancelo?", a: "No. Tu progreso, habitos y logros se mantienen. Solo pierdes acceso a las funciones premium." },
  { q: "¿Hay plan gratuito?", a: "Lumio ofrece funciones basicas gratuitas. El plan Pro desbloquea todas las funciones avanzadas." },
];

function PriceOrb() {
  return (
    <div className="price-orb">
      <svg className="po-svg" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="orb-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="80" fill="none" stroke="url(#orb-g)" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        <ellipse cx="100" cy="100" rx="80" ry="35" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        <ellipse cx="100" cy="100" rx="35" ry="80" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="4" fill="rgba(255,255,255,0.7)" />
      </svg>
      <div className="po-glow" />
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      className={`faq-item ${open ? "open" : ""}`}
      onClick={() => setOpen(!open)}
    >
      <div className="faq-row">
        <span className="faq-q">{q}</span>
        <span style={{
          fontSize: 14,
          color: "var(--text-lo)",
          transition: "transform 0.3s",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          flexShrink: 0,
        }}>+</span>
      </div>
      <div className="faq-a" style={{ maxHeight: open ? 120 : 0 }}>
        <p>{a}</p>
      </div>
    </button>
  );
}

export default function PricingPage() {
  const isMobile = useIsMobile();
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("annual");

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
  const basePrice = period === "monthly" ? PRICING.monthly : PRICING.annual;
  const { price, discount } = getDiscountedPrice(basePrice, level);

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
      <div className="pricing-wrap">
        {/* Header */}
        <div className="pricing-head">
          <span className="t-label">Pricing</span>
          <h1 className="pricing-title">
            <span style={{ fontFamily: "var(--font-sans)", color: "var(--text-hi)" }}>
              ${price.toFixed(2)}
            </span>
          </h1>

          {/* Rank capsule */}
          <div className="rank-capsule">
            <div className="rank-ring">
              <svg width="36" height="36" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--accent)"
                  strokeWidth="2" strokeDasharray={`${(level / 100) * 94} 94`}
                  strokeLinecap="round" transform="rotate(-90 18 18)" />
              </svg>
              <span className="rank-lvl">{level}</span>
            </div>
            <div className="rank-meta">
              <div className="rank-name">{rank.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-lo)", fontFamily: "var(--font-mono)" }}>
                {rank.discount > 0 ? `${rank.discount}% descuento` : "Sin descuento"}
              </div>
            </div>
          </div>

          {/* Period toggle */}
          <div className="period-toggle">
            <div className={`pt-pill ${period === "monthly" ? "left" : "right"}`} />
            <button className={`pt ${period === "monthly" ? "on" : ""}`} onClick={() => setPeriod("monthly")}>
              Mensual
            </button>
            <button className={`pt ${period === "annual" ? "on" : ""}`} onClick={() => setPeriod("annual")}>
              Anual
              <span className="pt-save">-23%</span>
            </button>
          </div>
        </div>

        {/* Hero pricing card */}
        <TiltCard className="price-hero" max={6} scale={1.01}>
          <div className="price-hero-inner">
            <div className="price-block">
              <div className="price-row">
                {discount > 0 && (
                  <span className="price-strike">${basePrice.toFixed(2)}</span>
                )}
                <span className="price-big">
                  <span className="price-currency">$</span>
                  {price.toFixed(2)}
                </span>
                <span className="price-unit">/{period === "monthly" ? "mes" : "mes"}</span>
              </div>
              <div className="price-fine">
                {period === "annual" ? (
                  <>Facturado anualmente · <strong>${(price * 12).toFixed(2)}</strong>/ano</>
                ) : (
                  <>Facturado mensualmente · Sin compromiso</>
                )}
              </div>
              <div className="price-cta-row">
                <button className="btn btn-primary" style={{ padding: "12px 24px" }}>
                  Comenzar ahora
                </button>
                {discount > 0 && (
                  <span className="badge badge-white">-{discount}% por rango</span>
                )}
              </div>
              <div className="price-trust" style={{ marginTop: 12 }}>
                <span className="badge badge-dim">Sin compromiso</span>
                <span className="badge badge-dim">Cancela cuando quieras</span>
              </div>
            </div>
            {!isMobile && <PriceOrb />}
          </div>
        </TiltCard>

        {/* Features grid */}
        <div>
          <div className="section-header">
            <span className="t-label">Que incluye</span>
            <h2 className="section-title" style={{ fontFamily: "var(--font-sans)", color: "var(--text-hi)" }}>
              Todo lo que necesitas
            </h2>
          </div>
          <div className="feat-grid" style={isMobile ? { gridTemplateColumns: "1fr 1fr" } : undefined}>
            {FEATURES.map((feat) => (
              <TiltCard key={feat.name} className="feat-tile" max={10} scale={1.03}>
                <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8, minHeight: 120 }}>
                  <div className="feat-icon">{feat.icon}</div>
                  <span className="feat-name">{feat.name}</span>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* Rank ladder */}
        <div>
          <div className="section-header">
            <span className="t-label">Rangos</span>
            <h2 className="section-title" style={{ fontFamily: "var(--font-sans)", color: "var(--text-hi)" }}>
              Sube de rango, paga menos
            </h2>
          </div>
          <div className="card" style={{ padding: isMobile ? 16 : 24, overflow: "visible" }}>
            <div className="ladder">
              <div className="ladder-rail" />
              {RANKS.map((r, i) => {
                const isCurrent = rank.name === r.name;
                return (
                  <div key={r.name} className={`step ${isCurrent ? "you" : ""}`}
                    style={{ borderBottom: i < RANKS.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div className="step-marker">
                      <div className="step-dot" />
                      {isCurrent && <div className="step-pulse" />}
                    </div>
                    <div className="step-body">
                      <div className="step-top">
                        <span className="step-name">{r.name}</span>
                        {isCurrent && <span className="step-tu">TU</span>}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-lo)", fontFamily: "var(--font-mono)" }}>
                        Nivel {r.minLevel}–{r.maxLevel}
                      </span>
                    </div>
                    <span className="step-disc">
                      {r.discount > 0 ? `${r.discount}%` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className="section-header">
            <span className="t-label">FAQ</span>
            <h2 className="section-title" style={{ fontFamily: "var(--font-sans)", color: "var(--text-hi)" }}>
              Preguntas frecuentes
            </h2>
          </div>
          <div className="faq">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </div>

      {isMobile && <div style={{ height: 64 }} />}
    </div>
  );
}
