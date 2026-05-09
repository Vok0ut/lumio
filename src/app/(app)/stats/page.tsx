"use client";

import { useEffect, useState } from "react";
import { SparkLine, MiniBar } from "@/src/components/ui/sparkline";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { TiltCard } from "@/src/components/ui/tilt-card";

interface StatsData {
  habitRate: number;
  tasksCompleted: number;
  weeklyXp: number;
  currentStreak: number;
  dailyHabits: number[];
  dailyXp: number[];
  monthlyActivity: number[];
}

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

const ACTIVITY_LEVELS = [
  { label: "Nada", opacity: 0.08 },
  { label: "Bajo", opacity: 0.25 },
  { label: "Medio", opacity: 0.5 },
  { label: "Alto", opacity: 0.75 },
  { label: "Maximo", opacity: 1 },
];

function activityOpacity(value: number, max: number): number {
  if (max === 0) return 0.08;
  const ratio = value / max;
  if (ratio === 0) return 0.08;
  if (ratio < 0.25) return 0.25;
  if (ratio < 0.5) return 0.5;
  if (ratio < 0.75) return 0.75;
  return 1;
}

export default function StatsPage() {
  const isMobile = useIsMobile();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="section-inner">
        <span className="t-label" style={{ textAlign: "center", paddingTop: 48 }}>
          Cargando estadisticas...
        </span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="section-inner">
        <span className="t-label" style={{ textAlign: "center", paddingTop: 48 }}>
          No se pudieron cargar las estadisticas
        </span>
      </div>
    );
  }

  const maxActivity = Math.max(...data.monthlyActivity, 1);

  const kpis: { label: string; value: string; sparkData: number[] }[] = [
    {
      label: "Tasa de habitos",
      value: `${data.habitRate}%`,
      sparkData: data.dailyHabits,
    },
    {
      label: "Tareas completadas",
      value: String(data.tasksCompleted),
      sparkData: data.dailyXp,
    },
    {
      label: "XP esta semana",
      value: String(data.weeklyXp),
      sparkData: data.dailyXp,
    },
    {
      label: "Racha actual",
      value: `${data.currentStreak} dias`,
      sparkData: data.dailyHabits,
    },
  ];

  return (
    <div className="section-inner">
      {/* Header */}
      <h2 className="t-title">Estadisticas</h2>

      {/* KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: isMobile ? 10 : 14,
        }}
      >
        {kpis.map((kpi) => (
          <TiltCard
            key={kpi.label}
            style={{ padding: isMobile ? 14 : 18 }}
            max={10}
            scale={1.03}
          >
            <span className="t-label">{kpi.label}</span>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: isMobile ? 20 : 26,
                  fontWeight: 700,
                  color: "var(--text-hi)",
                  letterSpacing: "-0.02em",
                }}
              >
                {kpi.value}
              </span>
              <SparkLine data={kpi.sparkData} width={isMobile ? 56 : 80} height={22} />
            </div>
          </TiltCard>
        ))}
      </div>

      {/* Weekly bar charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 14,
        }}
      >
        {/* Habits per day */}
        <TiltCard style={{ padding: isMobile ? 14 : 20 }} max={5} scale={1.01}>
          <span className="t-label">Habitos / dia</span>
          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "flex-end",
              gap: 6,
            }}
          >
            <MiniBar
              data={data.dailyHabits}
              width={isMobile ? 220 : 280}
              height={isMobile ? 48 : 64}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
              paddingRight: 2,
            }}
          >
            {DAY_LABELS.map((d) => (
              <span
                key={d}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: "var(--text-lo)",
                  width: isMobile ? 30 : 38,
                  textAlign: "center",
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </TiltCard>

        {/* XP per day */}
        <TiltCard style={{ padding: isMobile ? 14 : 20 }} max={5} scale={1.01}>
          <span className="t-label">XP / dia</span>
          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "flex-end",
              gap: 6,
            }}
          >
            <MiniBar
              data={data.dailyXp}
              width={isMobile ? 220 : 280}
              height={isMobile ? 48 : 64}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
              paddingRight: 2,
            }}
          >
            {DAY_LABELS.map((d) => (
              <span
                key={d}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: "var(--text-lo)",
                  width: isMobile ? 30 : 38,
                  textAlign: "center",
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </TiltCard>
      </div>

      {/* Monthly activity heatmap */}
      <TiltCard style={{ padding: isMobile ? 14 : 20 }} max={4} scale={1.01}>
        <span className="t-label">Actividad mensual</span>
        <div
          style={{
            marginTop: 14,
            display: "flex",
            flexWrap: "wrap",
            gap: isMobile ? 3 : 4,
          }}
        >
          {data.monthlyActivity.map((val, i) => (
            <div
              key={i}
              title={`Dia ${i + 1}: ${val} actividades`}
              style={{
                width: isMobile ? 14 : 18,
                height: isMobile ? 14 : 18,
                borderRadius: 3,
                background: "var(--accent)",
                opacity: activityOpacity(val, maxActivity),
                transition: "opacity 0.2s",
                cursor: "default",
              }}
            />
          ))}
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 14,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--text-lo)",
            }}
          >
            Menos
          </span>
          {ACTIVITY_LEVELS.map((lvl) => (
            <div
              key={lvl.label}
              title={lvl.label}
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: "var(--accent)",
                opacity: lvl.opacity,
              }}
            />
          ))}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--text-lo)",
            }}
          >
            Mas
          </span>
        </div>
      </TiltCard>
    </div>
  );
}
