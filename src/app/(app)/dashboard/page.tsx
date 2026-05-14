"use client";

import { useState, useEffect, useCallback } from "react";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { SparkLine } from "@/src/components/ui/sparkline";
import { TiltCard } from "@/src/components/ui/tilt-card";


/* ── types ─────────────────────────────────────── */

interface Stats {
  totalHabits: number;
  tasksCompleted: number;
  weeklyXp: number;
  currentStreak: number;
  habitRate: number;
  dailyHabits: number[];
  dailyXp: number[];
  monthlyActivity: number[];
}

interface Habit {
  id: string;
  name: string;
  category: string;
  completedToday: boolean;
}

interface Task {
  id: string;
  title: string;
  priority: "alta" | "media" | "baja";
  status: "TODO" | "IN_PROGRESS" | "DONE";
}

interface Goal {
  id: string;
  title: string;
  progress: number;
  category: string;
}

/* ── helpers ───────────────────────────────────── */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos dias";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ── skeleton block ────────────────────────────── */

function Skeleton({ width, height }: { width: string | number; height: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: "var(--radius-sm)",
        background: "rgba(255,255,255,0.05)",
        animation: "pulse 1.4s ease infinite",
      }}
    />
  );
}

/* ── main page ─────────────────────────────────── */

export default function DashboardPage() {
  const isMobile = useIsMobile();

  const [stats, setStats] = useState<Stats | null>(null);
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [goals, setGoals] = useState<Goal[] | null>(null);

  /* fetch all data on mount */
  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});

    fetch("/api/habits")
      .then((r) => r.json())
      .then((data: Array<Habit & { todayCompleted?: boolean }>) =>
        setHabits((data ?? []).map((h) => ({ ...h, completedToday: h.todayCompleted ?? h.completedToday ?? false })))
      )
      .catch(() => {});

    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data: { TODO: Task[]; IN_PROGRESS: Task[]; DONE: Task[] }) =>
        setTasks([...(data?.TODO ?? []), ...(data?.IN_PROGRESS ?? []), ...(data?.DONE ?? [])])
      )
      .catch(() => {});

    fetch("/api/goals")
      .then((r) => r.json())
      .then((data: Goal[]) => setGoals(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  /* toggle habit for today */
  const toggleHabit = useCallback(
    (id: string, current: boolean) => {
      if (!habits) return;
      setHabits((prev) =>
        prev
          ? prev.map((h) =>
              h.id === id ? { ...h, completedToday: !current } : h
            )
          : prev
      );
      fetch(`/api/habits/${id}/log`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !current, date: todayISO() }),
      }).catch(() => {
        /* revert on error */
        setHabits((prev) =>
          prev
            ? prev.map((h) =>
                h.id === id ? { ...h, completedToday: current } : h
              )
            : prev
        );
      });
    },
    [habits]
  );

  /* toggle task status */
  const toggleTask = useCallback(
    (id: string, current: string) => {
      if (!tasks) return;
      const next = current === "DONE" ? "TODO" : "DONE";
      setTasks((prev) =>
        prev
          ? prev.map((t) => (t.id === id ? { ...t, status: next as Task["status"] } : t))
          : prev
      );
      fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      }).catch(() => {
        setTasks((prev) =>
          prev
            ? prev.map((t) =>
                t.id === id ? { ...t, status: current as Task["status"] } : t
              )
            : prev
        );
      });
    },
    [tasks]
  );

  /* ── KPI data ── */
  const kpis: { label: string; value: string; sparkData: number[] }[] = stats
    ? [
        { label: "Habitos", value: String(stats.totalHabits), sparkData: stats.dailyHabits ?? [] },
        { label: "Tareas", value: String(stats.tasksCompleted), sparkData: stats.dailyXp ?? [] },
        { label: "XP Semanal", value: `${stats.weeklyXp}`, sparkData: stats.dailyXp ?? [] },
        { label: "Racha", value: `${stats.currentStreak}d`, sparkData: [] },
      ]
    : [];

  const gridCols = isMobile ? "1fr 1fr" : "repeat(4, 1fr)";

  return (
    <div className="section-inner">
      {/* ── Greeting ── */}
      <div style={{ marginBottom: 4 }}>
        <h1
          className="t-title"
          style={{
            fontSize: isMobile ? 20 : 26,
            fontFamily: "var(--font-sans)",
            color: "var(--text-hi)",
            letterSpacing: "-0.02em",
          }}
        >
          {getGreeting()}
        </h1>
        <p
          style={{
            fontSize: 11,
            color: "var(--text-lo)",
            fontFamily: "var(--font-mono)",
            marginTop: 4,
          }}
        >
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* ── KPI Cards ── */}
      {!stats ? (
        <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <div className="card" key={i} style={{ padding: 20 }}>
              <Skeleton width={48} height={10} />
              <div style={{ height: 6 }} />
              <Skeleton width={60} height={24} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 12 }}>
          {kpis.map((kpi) => (
            <TiltCard key={kpi.label} style={{ padding: 20 }} max={10} scale={1.03}>
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
                    fontSize: 28,
                    fontWeight: 700,
                    color: "var(--text-hi)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {kpi.value}
                </span>
                {kpi.sparkData.length >= 2 && (
                  <SparkLine data={kpi.sparkData} width={64} height={20} />
                )}
              </div>
            </TiltCard>
          ))}
        </div>
      )}

      {/* ── Habits + Tasks side by side ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 16,
        }}
      >
        {/* Today's Habits */}
        <TiltCard style={{ padding: 20 }} max={3} scale={1.005}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <span className="t-label">Habitos de hoy</span>
            <span className="badge badge-dim">
              {habits
                ? `${habits.filter((h) => h.completedToday).length}/${habits.length}`
                : "..."}
            </span>
          </div>

          {!habits ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} width="100%" height={18} />
              ))}
            </div>
          ) : habits.length === 0 ? (
            <p
              style={{
                fontSize: 11,
                color: "var(--text-lo)",
                fontFamily: "var(--font-mono)",
              }}
            >
              No hay habitos todavia.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {habits.map((h) => (
                <div
                  key={h.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <button
                    className={`check ${h.completedToday ? "checked" : ""}`}
                    onClick={() => toggleHabit(h.id, h.completedToday)}
                    aria-label={`Marcar ${h.name}`}
                  >
                    {h.completedToday ? "✓" : ""}
                  </button>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                      color: h.completedToday
                        ? "var(--text-lo)"
                        : "var(--text-hi)",
                      textDecoration: h.completedToday
                        ? "line-through"
                        : "none",
                      flex: 1,
                    }}
                  >
                    {h.name}
                  </span>
                  <span className="badge badge-dim">{h.category}</span>
                </div>
              ))}
            </div>
          )}
        </TiltCard>

        {/* Pending Tasks */}
        <TiltCard style={{ padding: 20 }} max={3} scale={1.005}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <span className="t-label">Tareas pendientes</span>
            <span className="badge badge-dim">
              {tasks
                ? `${tasks.filter((t) => t.status === "DONE").length}/${tasks.length}`
                : "..."}
            </span>
          </div>

          {!tasks ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} width="100%" height={18} />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <p
              style={{
                fontSize: 11,
                color: "var(--text-lo)",
                fontFamily: "var(--font-mono)",
              }}
            >
              No hay tareas pendientes.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tasks.slice(0, 8).map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <button
                    className={`check ${t.status === "DONE" ? "checked" : ""}`}
                    onClick={() => toggleTask(t.id, t.status)}
                    aria-label={`Marcar ${t.title}`}
                  >
                    {t.status === "DONE" ? "✓" : ""}
                  </button>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                      color:
                        t.status === "DONE"
                          ? "var(--text-lo)"
                          : "var(--text-hi)",
                      textDecoration:
                        t.status === "DONE" ? "line-through" : "none",
                      flex: 1,
                    }}
                  >
                    {t.title}
                  </span>
                  <span
                    className={`badge ${
                      t.priority === "alta" ? "badge-white" : "badge-dim"
                    }`}
                  >
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TiltCard>
      </div>

      {/* ── Goals / Missions ── */}
      <div>
        <span
          className="t-label"
          style={{ display: "block", marginBottom: 12 }}
        >
          Misiones activas
        </span>

        {!goals ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[0, 1].map((i) => (
              <div className="card" key={i} style={{ padding: 18 }}>
                <Skeleton width="60%" height={14} />
                <div style={{ height: 10 }} />
                <Skeleton width="100%" height={3} />
              </div>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div
            className="card"
            style={{
              padding: 24,
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "var(--text-lo)",
                fontFamily: "var(--font-mono)",
              }}
            >
              No tienes misiones activas. Crea una meta para empezar.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: 12,
            }}
          >
            {goals.map((g) => (
              <TiltCard key={g.id} style={{ padding: 18 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-hi)",
                    }}
                  >
                    {g.title}
                  </span>
                  <span className="badge badge-white">{g.category}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${g.progress}%` }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--text-lo)",
                    fontFamily: "var(--font-mono)",
                    marginTop: 6,
                    display: "block",
                  }}
                >
                  {g.progress}% completado
                </span>
              </TiltCard>
            ))}
          </div>
        )}
      </div>

      {/* pulse animation for skeleton */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
