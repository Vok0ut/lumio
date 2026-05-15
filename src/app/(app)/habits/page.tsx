"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "@/src/components/ui/modal";
import { Icon } from "@/src/components/ui/icons";
import { HABIT_CATEGORIES, type HabitCategory } from "@/src/lib/gamification";
import { TiltCard } from "@/src/components/ui/tilt-card";

/* ── types ─────────────────────────────────────── */

interface Habit {
  id: string;
  name: string;
  target: string;
  category: HabitCategory;
  streak: number;
  completedDates: string[];
  todayCompleted: boolean;
  completedToday: boolean; // normalized client-side from todayCompleted
}

/* ── helpers ───────────────────────────────────── */

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Build an array of 28 booleans for the last 28 days (oldest first). */
function buildHistory(completedDates: string[]): boolean[] {
  const set = new Set(
    (completedDates ?? []).map((d) => d.slice(0, 10))
  );
  const out: boolean[] = [];
  const now = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    out.push(set.has(d.toISOString().slice(0, 10)));
  }
  return out;
}

const CATEGORY_LABELS: Record<HabitCategory, string> = {
  mente: "Mente",
  cuerpo: "Cuerpo",
  nutricion: "Nutricion",
  descanso: "Descanso",
  otro: "Otro",
};

/* ── skeleton ──────────────────────────────────── */

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

/* ── micro bar chart (28 days) ─────────────────── */

function MicroHistory({ history }: { history: boolean[] }) {
  const barW = 3;
  const gap = 1.5;
  const h = 16;
  const totalW = history.length * (barW + gap) - gap;

  return (
    <svg
      width={totalW}
      height={h}
      viewBox={`0 0 ${totalW} ${h}`}
      style={{ flexShrink: 1, maxWidth: totalW, overflow: "hidden" }}
    >
      {history.map((done, i) => (
        <rect
          key={i}
          x={i * (barW + gap)}
          y={done ? 0 : h * 0.6}
          width={barW}
          height={done ? h : h * 0.4}
          rx={1}
          fill={done ? "var(--accent)" : "rgba(255,255,255,0.08)"}
          opacity={done ? 1 : 0.6}
        />
      ))}
    </svg>
  );
}

/* ── main page ─────────────────────────────────── */

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formTarget, setFormTarget] = useState("");
  const [formCategory, setFormCategory] = useState<HabitCategory>("mente");
  const [submitting, setSubmitting] = useState(false);

  /* ── fetch habits ── */
  const loadHabits = useCallback(() => {
    fetch("/api/habits")
      .then((r) => r.json())
      .then((data: Array<Record<string, unknown>>) =>
        setHabits(
          (data ?? []).map((h) => ({
            ...h,
            completedToday: Boolean((h as { todayCompleted?: boolean }).todayCompleted ?? (h as { completedToday?: boolean }).completedToday ?? false),
          })) as Habit[]
        )
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  /* ── toggle today ── */
  const toggleToday = useCallback(
    (id: string, current: boolean) => {
      if (!habits || current) return;
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

  /* ── create habit ── */
  const handleCreate = useCallback(async () => {
    if (!formName.trim() || !formTarget.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          target: formTarget.trim(),
          category: formCategory,
        }),
      });
      if (res.ok) {
        setFormName("");
        setFormTarget("");
        setFormCategory("mente");
        setShowModal(false);
        loadHabits();
      }
    } finally {
      setSubmitting(false);
    }
  }, [formName, formTarget, formCategory, loadHabits]);

  /* ── delete habit ── */
  const deleteHabit = useCallback(
    (id: string) => {
      setHabits((prev) => (prev ? prev.filter((h) => h.id !== id) : prev));
      fetch(`/api/habits/${id}`, { method: "DELETE" }).catch(() => {
        loadHabits();
      });
    },
    [loadHabits]
  );

  return (
    <div className="section-inner">
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1
          className="t-title"
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--text-hi)",
          }}
        >
          Habitos
        </h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <Icon name="plus" size={14} color="#090909" />
          Nuevo Habito
        </button>
      </div>

      {/* ── Habit list ── */}
      {!habits ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <div className="card" key={i} style={{ padding: 20 }}>
              <Skeleton width="50%" height={14} />
              <div style={{ height: 8 }} />
              <Skeleton width="100%" height={16} />
            </div>
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 40,
            textAlign: "center",
          }}
        >
          <Icon name="repeat" size={28} color="var(--text-lo)" />
          <p
            style={{
              fontSize: 12,
              color: "var(--text-lo)",
              fontFamily: "var(--font-mono)",
              marginTop: 12,
            }}
          >
            Aun no tienes habitos. Crea el primero para comenzar.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {habits.map((h) => {
            const history = buildHistory(h.completedDates ?? []);
            return (
              <TiltCard
                key={h.id}
                style={{ padding: "16px 20px" }}
                max={3}
                scale={1.005}
              >
                {/* top row: check, name, category, delete */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <button
                    className={`check ${h.completedToday ? "checked" : ""}`}
                    onClick={() => toggleToday(h.id, h.completedToday)}
                    aria-label={`Marcar ${h.name}`}
                    style={h.completedToday ? { cursor: "default", opacity: 0.7 } : undefined}
                  >
                    {h.completedToday ? "✓" : ""}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 13,
                          fontWeight: 600,
                          color: h.completedToday
                            ? "var(--text-lo)"
                            : "var(--text-hi)",
                          textDecoration: h.completedToday
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {h.name}
                      </span>
                      <span className="badge badge-dim">
                        {CATEGORY_LABELS[h.category] ?? h.category}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--text-lo)",
                        fontFamily: "var(--font-mono)",
                        marginTop: 2,
                        display: "block",
                      }}
                    >
                      {h.target}
                    </span>
                  </div>

                  {/* streak */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--accent)",
                      }}
                    >
                      {h.streak}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        color: "var(--text-lo)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      dias
                    </span>
                  </div>

                  {/* delete */}
                  <button
                    onClick={() => deleteHabit(h.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-lo)",
                      padding: 4,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label={`Eliminar ${h.name}`}
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>

                {/* 28-day micro bars */}
                <div style={{ marginTop: 12, paddingLeft: 28 }}>
                  <MicroHistory history={history} />
                </div>
              </TiltCard>
            );
          })}
        </div>
      )}

      {/* ── Create Modal ── */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Nuevo Habito"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              className="t-label"
              style={{ display: "block", marginBottom: 6 }}
            >
              Nombre
            </label>
            <input
              className="input"
              placeholder="Ej: Leer 20 minutos"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div>
            <label
              className="t-label"
              style={{ display: "block", marginBottom: 6 }}
            >
              Objetivo
            </label>
            <input
              className="input"
              placeholder="Ej: Cada dia por la manana"
              value={formTarget}
              onChange={(e) => setFormTarget(e.target.value)}
              maxLength={60}
            />
          </div>

          <div>
            <label
              className="t-label"
              style={{ display: "block", marginBottom: 6 }}
            >
              Categoria
            </label>
            <select
              className="input"
              value={formCategory}
              onChange={(e) =>
                setFormCategory(e.target.value as HabitCategory)
              }
              style={{ cursor: "pointer" }}
            >
              {HABIT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 8,
              justifyContent: "flex-end",
            }}
          >
            <button
              className="btn btn-ghost"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={submitting || !formName.trim() || !formTarget.trim()}
              style={{
                opacity:
                  submitting || !formName.trim() || !formTarget.trim()
                    ? 0.5
                    : 1,
              }}
            >
              {submitting ? "Creando..." : "Crear Habito"}
            </button>
          </div>
        </div>
      </Modal>

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
