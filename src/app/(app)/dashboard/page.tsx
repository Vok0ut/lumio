"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { TiltCard } from "@/src/components/ui/tilt-card";
import { Icon } from "@/src/components/ui/icons";
import { getLevelFromXP, getRankForLevel } from "@/src/lib/gamification";
import { getTodayTip } from "@/src/lib/tips";

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
  priority: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
}

interface Goal {
  id: string;
  title: string;
  progress: number;
  category: string;
  milestones?: { done: boolean }[];
}

interface CalEvent {
  id: string;
  title: string;
  date: string;
  time: string;
}

interface UserProfile {
  totalXp: number;
  name: string | null;
  email: string;
}

/* ── helpers ───────────────────────────────────── */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Buenas noches";
  if (h < 13) return "Buenos dias";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function getWeekNumber(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

/* ── Skeleton ───────────────────────────────────── */

function Skeleton({ width, height }: { width: string | number; height: number }) {
  return (
    <div style={{ width, height, borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,0.05)", animation: "pulse 1.4s ease infinite" }} />
  );
}

/* ── XP Ring ───────────────────────────────────── */

function XpRing({ value, max, size = 56, stroke = 4, color = "var(--xp)" }: { value: number; max: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={`${c * pct} ${c}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 5px ${color})`, transition: "stroke-dasharray 0.5s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em",
        color,
      }}>
        {Math.round(pct * 100)}<span style={{ fontSize: 8, color: "var(--text-lo)", fontFamily: "var(--font-mono)", marginLeft: 1 }}>%</span>
      </div>
    </div>
  );
}

/* ── Spark with area fill ─────────────────────── */

function Spark({
  data,
  color = "rgba(255,255,255,0.35)",
  gradId = "sg-def",
  w = 100,
  h = 36,
}: {
  data: number[];
  color?: string;
  gradId?: string;
  w?: number;
  h?: number;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const dx = w / (data.length - 1);
  const points = data.map((v, i) => [i * dx, h - 4 - ((v - min) / range) * (h - 8)] as [number, number]);
  const linePath = points.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const areaPath = linePath + ` L${w} ${h} L0 ${h} Z`;
  const last = points[points.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: w, height: h, overflow: "visible" }}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} opacity={0.7} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

/* ── Daily Tip ───────────────────────────────── */

const CATEGORY_COLORS: Record<string, string> = {
  nutricion: "#F48FB1",
  mente: "#81D4FA",
  entrenamiento: "#FFB74D",
  descanso: "#A5D6A7",
  motivacion: "#FFD54F",
};

const CATEGORY_LABELS: Record<string, string> = {
  nutricion: "Nutrición",
  mente: "Mente",
  entrenamiento: "Entrenamiento",
  descanso: "Descanso",
  motivacion: "Motivación",
};

function DailyTip() {
  const tip = getTodayTip();
  const color = CATEGORY_COLORS[tip.category] ?? "#E8E6DF";
  const label = CATEGORY_LABELS[tip.category] ?? tip.category;

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
      border: "1px solid var(--border)",
      borderLeft: `3px solid ${color}`,
      borderRadius: "var(--radius)",
      padding: "14px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em",
          color: "var(--text-lo)", textTransform: "uppercase" as const,
        }}>
          Consejo del dia
        </span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em",
          color, background: `${color}18`, border: `1px solid ${color}40`,
          borderRadius: 4, padding: "2px 7px", textTransform: "uppercase" as const,
        }}>
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flexShrink: 0, marginTop: 1 }}>
          <Icon name={tip.icon} size={14} color={color} />
        </div>
        <p style={{
          fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 400,
          color: "var(--text-hi)", lineHeight: 1.55, margin: 0,
          letterSpacing: "-0.01em",
        }}>
          {tip.text}
        </p>
      </div>
    </div>
  );
}

/* ── Hero Strip ──────────────────────────────── */

function HeroStrip({ profile, isMobile }: { profile: UserProfile | null; isMobile: boolean }) {
  const totalXp = profile?.totalXp ?? 0;
  const { level, currentLevelXP, xpToNextLevel } = getLevelFromXP(totalXp);
  const rank = getRankForLevel(level);
  const pct = xpToNextLevel > 0 ? Math.round((currentLevelXP / xpToNextLevel) * 100) : 0;

  return (
    <div className="card" style={{
      padding: isMobile ? "16px 18px" : "20px 24px",
      background: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent)",
      position: "relative", overflow: "hidden",
    }}>
      {/* subtle glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(600px 200px at 0% 50%, rgba(232,230,223,0.04), transparent 70%)",
      }} />

      <div style={{
        display: "flex", alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between", gap: 20, position: "relative",
        flexDirection: isMobile ? "column" : "row",
      }}>
        {/* Left: level + rank */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 16, width: isMobile ? "100%" : "auto" }}>
          <div style={{
            width: isMobile ? 44 : 52, height: isMobile ? 44 : 52, borderRadius: 12,
            background: "var(--xp-lo)", border: "1px solid var(--xp-mid)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: isMobile ? 15 : 18,
            color: "var(--xp)", flexShrink: 0,
            boxShadow: "0 0 20px var(--xp-lo), inset 0 0 20px rgba(196,145,58,0.05)",
          }}>
            {String(level).padStart(2, "0")}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", color: "var(--text-lo)", textTransform: "uppercase" as const, marginBottom: 4 }}>
              Nivel actual
            </div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: isMobile ? 14 : 17, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-hi)", marginBottom: 8 }}>
              {rank.name}
            </div>
            <div style={{ width: isMobile ? "100%" : 280 }}>
              <div className="progress-bar" style={{ height: 6 }}>
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-lo)", flexWrap: "wrap" as const, gap: 4 }}>
                <span style={{ color: "var(--xp)" }}>{currentLevelXP}</span>
                <span>/ {xpToNextLevel} XP · LVL {String(level + 1).padStart(2, "0")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: XP stats */}
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ textAlign: "right" as const }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", color: "var(--text-lo)", textTransform: "uppercase" as const }}>
              Total
            </div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.03em", marginTop: 2, color: "var(--xp)" }}>
              {totalXp >= 1000 ? `${(totalXp / 1000).toFixed(1)}k` : String(totalXp)}
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-lo)", marginLeft: 3 }}>xp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Focus / Pomodoro ────────────────────────── */

function FocusTimer({ isMobile }: { isMobile: boolean }) {
  const [sec, setSec] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSec((s) => {
        if (s <= 1) {
          setRunning(false);
          setSessions((p) => p + 1);
          return 25 * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");

  return (
    <TiltCard style={{ padding: isMobile ? 16 : 20, display: "flex", flexDirection: "column", gap: 14 }} max={3} scale={1.005}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="t-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {running && <span style={{
            width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block",
            animation: "pulse 2s infinite",
          }} />}
          Sesion de foco
        </span>
        <span className="badge badge-dim">POMO · 25/5</span>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{
          fontFamily: "var(--font-sans)", fontWeight: 300,
          fontSize: isMobile ? 40 : 48, letterSpacing: "-0.04em", lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}>
          {mm}<span style={{ color: "var(--text-lo)" }}>:</span>{ss}
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-lo)",
          letterSpacing: "0.18em", textTransform: "uppercase" as const, marginTop: 10,
        }}>
          {running ? "concentrado" : "listo para empezar"}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 10 }}
          onClick={() => { setSec(25 * 60); setRunning(false); }}>
          <Icon name="repeat" size={11} /> Reset
        </button>
        <button className="btn btn-primary" style={{ padding: "6px 16px", fontSize: 10 }}
          onClick={() => setRunning((r) => !r)}>
          {running ? "Pausar" : "Empezar"}
        </button>
        <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 10 }}
          onClick={() => setSec((s) => s + 5 * 60)}>
          +5
        </button>
      </div>

      <div style={{
        display: "flex", justifyContent: "space-between",
        paddingTop: 10, borderTop: "1px solid var(--border)",
        fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-lo)",
      }}>
        <span>hoy <b style={{ color: "var(--text-hi)" }}>{sessions}</b> pomos</span>
        <span>meta <b style={{ color: "var(--text-hi)" }}>4</b></span>
      </div>
    </TiltCard>
  );
}

/* ── Agenda ───────────────────────────────────── */

function AgendaPanel({ events, isMobile }: { events: CalEvent[]; isMobile: boolean }) {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <TiltCard style={{ padding: isMobile ? 16 : 20 }} max={3} scale={1.005}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span className="t-label">Agenda · hoy</span>
        <span className="badge badge-dim">{events.length} bloques</span>
      </div>

      {events.length === 0 ? (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-lo)" }}>
          Sin eventos hoy
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {events.map((ev) => {
            const state = ev.time < currentTime ? "past" : ev.time <= currentTime ? "now" : "future";
            return (
              <div key={ev.id} style={{
                display: "grid", gridTemplateColumns: "50px 8px 1fr",
                gap: 10, alignItems: "center", padding: "8px 0",
                borderBottom: "1px solid var(--border)",
              }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: state === "now" ? "var(--accent)" : "var(--text-lo)",
                }}>
                  {ev.time}
                </span>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: state === "now" ? "var(--accent)" : "var(--border-mid)",
                  boxShadow: state === "now" ? "0 0 0 3px rgba(232,230,223,0.1)" : "none",
                }} />
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  color: state === "past" ? "var(--text-lo)" : "var(--text-hi)",
                  textDecoration: state === "past" ? "line-through" : "none",
                }}>
                  {ev.title}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </TiltCard>
  );
}

/* ── Heatmap ──────────────────────────────────── */

function HeatmapPanel({ data, isMobile }: { data: number[]; isMobile: boolean }) {
  const max = Math.max(...data, 1);
  const activeDays = data.filter((v) => v > 0).length;
  const pct = Math.round((activeDays / data.length) * 100);

  function cellOpacity(v: number): number {
    if (v === 0) return 0.06;
    const ratio = v / max;
    if (ratio < 0.25) return 0.2;
    if (ratio < 0.5) return 0.4;
    if (ratio < 0.75) return 0.65;
    return 0.9;
  }

  return (
    <TiltCard style={{ padding: isMobile ? 16 : 20 }} max={3} scale={1.005}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span className="t-label">Constancia · 30 dias</span>
        <span className="badge badge-dim">{pct}% activo</span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${isMobile ? 10 : 15}, 1fr)`,
        gap: 3,
      }}>
        {data.map((v, i) => (
          <div key={i} title={`Dia ${i + 1}: ${v} actividades`} style={{
            aspectRatio: "1", borderRadius: 3,
            background: v > 0 ? "var(--xp)" : "rgba(255,255,255,0.05)",
            opacity: cellOpacity(v),
            transition: "opacity 0.2s",
          }} />
        ))}
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginTop: 10,
        fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-lo)",
      }}>
        <span>menos</span>
        {[0.06, 0.2, 0.4, 0.65, 0.9].map((op, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: op > 0.1 ? "var(--xp)" : "rgba(255,255,255,0.05)", opacity: op > 0.1 ? op : 1 }} />
        ))}
        <span>mas</span>
      </div>
    </TiltCard>
  );
}

/* ── Missions ─────────────────────────────────── */

function MissionsPanel({ goals, isMobile }: { goals: Goal[]; isMobile: boolean }) {
  return (
    <TiltCard style={{ padding: isMobile ? 16 : 20 }} max={3} scale={1.005}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span className="t-label">Misiones activas</span>
        <span className="badge badge-dim">{goals.length} en curso</span>
      </div>

      {goals.length === 0 ? (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-lo)" }}>
          No tienes misiones activas
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {goals.slice(0, 3).map((g) => (
            <div key={g.id} className="card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, color: "var(--text-hi)", letterSpacing: "-0.01em" }}>
                  {g.title}
                </span>
                <span className="badge badge-dim" style={{ fontSize: 8, flexShrink: 0 }}>{g.category}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-lo)" }}>
                <span>{g.progress}%</span>
                <div className="progress-bar" style={{ flex: 1, height: 5 }}>
                  <div className="progress-fill" style={{ width: `${g.progress}%`, boxShadow: "0 0 8px rgba(232,230,223,0.3)" }} />
                </div>
              </div>

              {g.milestones && g.milestones.length > 0 && (
                <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                  {g.milestones.map((m, j) => (
                    <div key={j} style={{
                      width: 12, height: 5, borderRadius: 3,
                      background: m.done ? "var(--accent)" : "rgba(255,255,255,0.08)",
                    }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </TiltCard>
  );
}

/* ── Main Page ────────────────────────────────── */

export default function DashboardPage() {
  const isMobile = useIsMobile();

  const [stats, setStats] = useState<Stats | null>(null);
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [goals, setGoals] = useState<Goal[] | null>(null);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  /* fetch all data on mount */
  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats).catch(() => {});
    fetch("/api/user/me").then((r) => r.json()).then(setProfile).catch(() => {});

    fetch("/api/habits")
      .then((r) => r.json())
      .then((data: Array<Habit & { todayCompleted?: boolean }>) =>
        setHabits((data ?? []).map((h) => ({ ...h, completedToday: h.todayCompleted ?? h.completedToday ?? false })))
      ).catch(() => {});

    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data: { TODO: Task[]; IN_PROGRESS: Task[]; DONE: Task[] }) =>
        setTasks([...(data?.TODO ?? []), ...(data?.IN_PROGRESS ?? []), ...(data?.DONE ?? [])])
      ).catch(() => {});

    fetch("/api/goals").then((r) => r.json())
      .then((data: Goal[]) => setGoals(Array.isArray(data) ? data : []))
      .catch(() => setGoals([]));

    // Today's events
    const today = todayISO();
    fetch(`/api/calendar?start=${today}&end=${today}`)
      .then((r) => r.json())
      .then((data: CalEvent[]) => {
        const evts = (data ?? []).map((ev) => ({
          ...ev,
          date: typeof ev.date === "string" ? ev.date.slice(0, 10) : String(ev.date),
          time: String(ev.time ?? ""),
        }));
        evts.sort((a, b) => a.time.localeCompare(b.time));
        setEvents(evts);
      }).catch(() => {});
  }, []);

  /* toggle habit */
  const toggleHabit = useCallback((id: string, current: boolean) => {
    if (current) return; // one-time only
    setHabits((prev) => prev ? prev.map((h) => h.id === id ? { ...h, completedToday: true } : h) : prev);
    fetch(`/api/habits/${id}/log`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true, date: todayISO() }),
    }).catch(() => {
      setHabits((prev) => prev ? prev.map((h) => h.id === id ? { ...h, completedToday: false } : h) : prev);
    });
  }, []);

  /* toggle task */
  const toggleTask = useCallback((id: string, current: string) => {
    if (current === "DONE") return; // one-time only
    setTasks((prev) => prev ? prev.map((t) => t.id === id ? { ...t, status: "DONE" as const } : t) : prev);
    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    }).catch(() => {
      setTasks((prev) => prev ? prev.map((t) => t.id === id ? { ...t, status: current as Task["status"] } : t) : prev);
    });
  }, []);

  /* computed */
  const habitsDone = habits ? habits.filter((h) => h.completedToday).length : 0;
  const habitsTotal = habits ? habits.length : 0;
  const tasksDone = tasks ? tasks.filter((t) => t.status === "DONE").length : 0;
  const tasksTotal = tasks ? tasks.length : 0;
  const dateStr = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  const weekNum = getWeekNumber();
  const userName = profile?.name ?? "Usuario";

  return (
    <div className="section-inner">
      {/* ── Greeting ── */}
      <div style={{ marginBottom: 4 }}>
        <h1 style={{
          fontFamily: "var(--font-sans)", fontSize: isMobile ? 22 : 32, fontWeight: 500,
          letterSpacing: "-0.02em", color: "var(--text-hi)", margin: 0, lineHeight: 1,
        }}>
          {getGreeting()}, {userName}
        </h1>
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-lo)",
          marginTop: 6, letterSpacing: "0.04em",
        }}>
          {dateStr.charAt(0).toUpperCase() + dateStr.slice(1)} · semana {weekNum}
        </p>
      </div>

      {/* ── Daily Tip ── */}
      <DailyTip />

      {/* ── Hero Strip ── */}
      <HeroStrip profile={profile} isMobile={isMobile} />

      {/* ── KPI Row ── */}
      {!stats ? (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <div className="card" key={i} style={{ padding: 18 }}>
              <Skeleton width={48} height={10} />
              <div style={{ height: 8 }} />
              <Skeleton width={60} height={28} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
          {/* Habits */}
          <TiltCard style={{ padding: isMobile ? 14 : 18 }} max={4} scale={1.01}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span className="t-label">Habitos</span>
              <span className={`badge ${habitsDone > 0 ? "badge-success" : "badge-dim"}`} style={{ fontSize: 9 }}>
                {habitsDone}/{habitsTotal}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
              <span style={{
                fontFamily: "var(--font-sans)", fontSize: isMobile ? 28 : 36, fontWeight: 500,
                letterSpacing: "-0.03em", lineHeight: 1,
                color: habitsDone > 0 ? "var(--success)" : "var(--text-hi)",
              }}>
                {habitsDone}<span style={{ fontSize: 14, color: "var(--text-lo)", marginLeft: 2, fontWeight: 400 }}>/{habitsTotal}</span>
              </span>
              <Spark data={stats.dailyHabits} color="var(--success)" gradId="sg-success" w={isMobile ? 60 : 90} h={32} />
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-lo)", marginTop: 10 }}>
              {habitsDone} de {habitsTotal} completados hoy
            </div>
          </TiltCard>

          {/* Tasks */}
          <TiltCard style={{ padding: isMobile ? 14 : 18 }} max={4} scale={1.01}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span className="t-label">Tareas</span>
              <span className="badge badge-dim" style={{ fontSize: 9 }}>
                {tasksTotal - tasksDone} quedan
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
              <span style={{
                fontFamily: "var(--font-sans)", fontSize: isMobile ? 28 : 36, fontWeight: 500,
                letterSpacing: "-0.03em", lineHeight: 1,
              }}>
                {tasksDone}<span style={{ fontSize: 14, color: "var(--text-lo)", marginLeft: 2, fontWeight: 400 }}>/{tasksTotal}</span>
              </span>
              <Spark data={stats.dailyXp} color="rgba(255,255,255,0.3)" gradId="sg-tasks" w={isMobile ? 60 : 90} h={32} />
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-lo)", marginTop: 10 }}>
              {tasksTotal - tasksDone} quedan para hoy
            </div>
          </TiltCard>

          {/* Weekly XP */}
          <TiltCard style={{ padding: isMobile ? 14 : 18 }} max={4} scale={1.01}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span className="t-label">XP semanal</span>
              <span className="badge badge-xp" style={{ fontSize: 9 }}>
                +{stats.weeklyXp > 0 ? Math.round((stats.dailyXp[6] / (stats.weeklyXp || 1)) * 100) : 0}% hoy
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
              <span style={{
                fontFamily: "var(--font-sans)", fontSize: isMobile ? 28 : 36, fontWeight: 500,
                letterSpacing: "-0.03em", lineHeight: 1, color: "var(--xp)",
              }}>
                {stats.weeklyXp}
              </span>
              <Spark data={stats.dailyXp} color="var(--xp)" gradId="sg-xp" w={isMobile ? 60 : 90} h={32} />
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-lo)", marginTop: 10 }}>
              objetivo semanal · 250 XP
            </div>
          </TiltCard>

          {/* Streak */}
          <TiltCard style={{ padding: isMobile ? 14 : 18 }} max={4} scale={1.01}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span className="t-label">Racha</span>
              <span className={`badge ${stats.currentStreak > 0 ? "badge-streak" : "badge-dim"}`} style={{ fontSize: 9 }}>
                {stats.currentStreak > 0 ? "hoy ✓" : "hoy ✗"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <XpRing
                value={stats.currentStreak % 7 || (stats.currentStreak > 0 ? 7 : 0)}
                max={7}
                size={isMobile ? 48 : 56}
                color="var(--streak)"
              />
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-lo)", letterSpacing: "0.1em" }}>SEMANA</div>
                <div style={{
                  fontFamily: "var(--font-sans)", fontSize: isMobile ? 20 : 26, fontWeight: 600,
                  letterSpacing: "-0.02em", marginTop: 2, color: "var(--streak)",
                }}>
                  {stats.currentStreak}<span style={{ fontSize: 12, color: "var(--text-lo)", marginLeft: 3, fontWeight: 400 }}>dias</span>
                </div>
              </div>
            </div>
          </TiltCard>
        </div>
      )}

      {/* ── Middle grid: Habits + Tasks + Focus ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr",
        gap: 14,
      }}>
        {/* Habits */}
        <TiltCard style={{ padding: isMobile ? 16 : 20 }} max={3} scale={1.005}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span className="t-label">Habitos de hoy</span>
            <span className="badge badge-dim">{habitsDone}/{habitsTotal}</span>
          </div>
          {!habits ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[0, 1, 2].map((i) => <Skeleton key={i} width="100%" height={18} />)}
            </div>
          ) : habits.length === 0 ? (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-lo)" }}>No hay habitos todavia</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {habits.map((h) => (
                <div key={h.id} style={{
                  display: "grid", gridTemplateColumns: "20px 1fr auto",
                  gap: 10, alignItems: "center", padding: "10px 2px",
                  borderTop: "1px solid var(--border)",
                  cursor: h.completedToday ? "default" : "pointer",
                }} onClick={() => toggleHabit(h.id, h.completedToday)}>
                  <button
                    className={`check ${h.completedToday ? "checked" : ""}`}
                    style={{ width: 18, height: 18, ...(h.completedToday ? { cursor: "default", opacity: 0.7 } : {}) }}
                  >
                    {h.completedToday ? "✓" : ""}
                  </button>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 12,
                    color: h.completedToday ? "var(--text-lo)" : "var(--text-hi)",
                    textDecoration: h.completedToday ? "line-through" : "none",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {h.name}
                  </span>
                  <span className="badge badge-dim" style={{ fontSize: 8 }}>{h.category}</span>
                </div>
              ))}
            </div>
          )}
        </TiltCard>

        {/* Tasks */}
        <TiltCard style={{ padding: isMobile ? 16 : 20 }} max={3} scale={1.005}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span className="t-label">Tareas pendientes</span>
            <span className="badge badge-dim">{tasksDone}/{tasksTotal}</span>
          </div>
          {!tasks ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[0, 1, 2].map((i) => <Skeleton key={i} width="100%" height={18} />)}
            </div>
          ) : tasks.length === 0 ? (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-lo)" }}>No hay tareas pendientes</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {tasks.slice(0, 6).map((t) => (
                <div key={t.id} style={{
                  display: "grid", gridTemplateColumns: "20px 1fr auto",
                  gap: 10, alignItems: "center", padding: "10px 2px",
                  borderTop: "1px solid var(--border)",
                  cursor: t.status === "DONE" ? "default" : "pointer",
                }} onClick={() => toggleTask(t.id, t.status)}>
                  <button
                    className={`check ${t.status === "DONE" ? "checked" : ""}`}
                    style={{ width: 18, height: 18, ...(t.status === "DONE" ? { cursor: "default", opacity: 0.7 } : {}) }}
                  >
                    {t.status === "DONE" ? "✓" : ""}
                  </button>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 12,
                    color: t.status === "DONE" ? "var(--text-lo)" : "var(--text-hi)",
                    textDecoration: t.status === "DONE" ? "line-through" : "none",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {t.title}
                  </span>
                  <span className={`badge ${t.priority === "alta" ? "badge-white" : "badge-dim"}`} style={{ fontSize: 8 }}>
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TiltCard>

        {/* Focus Timer */}
        <FocusTimer isMobile={isMobile} />
      </div>

      {/* ── Bottom grid: Missions + Agenda + Heatmap ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
        gap: 14,
      }}>
        <MissionsPanel goals={goals ?? []} isMobile={isMobile} />
        <AgendaPanel events={events} isMobile={isMobile} />
        {stats && <HeatmapPanel data={stats.monthlyActivity} isMobile={isMobile} />}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
