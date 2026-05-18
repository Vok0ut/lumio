"use client";

import { useEffect, useState, useCallback } from "react";
import { Modal } from "@/src/components/ui/modal";
import { Icon } from "@/src/components/ui/icons";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { usePlan } from "@/src/hooks/use-plan";
import { PremiumWall } from "@/src/components/ui/premium-wall";

/* ── Types ─────────────────────────────────── */

interface Milestone {
  id?: string;
  label: string;
  done: boolean;
  order: number;
}

interface Goal {
  id: string;
  title: string;
  deadline: string;
  category: string;
  progress: number;
  milestones: Milestone[];
  createdAt: string;
}

/* ── Component ──────────────────────────────── */

export default function GoalsPage() {
  const isMobile = useIsMobile();
  const { isPremium, loading: planLoading } = usePlan();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  /* form state */
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("");
  const [milestoneInputs, setMilestoneInputs] = useState<{ label: string }[]>([
    { label: "" },
  ]);
  const [saving, setSaving] = useState(false);

  /* ── Fetch ─────────────────────────────────── */

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  /* ── Handlers ──────────────────────────────── */

  const toggleMilestone = async (goalId: string, milestoneIdx: number) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const updated = goal.milestones.map((m, i) =>
      i === milestoneIdx ? { ...m, done: !m.done } : m
    );

    const doneCount = updated.filter((m) => m.done).length;
    const progress = updated.length > 0 ? Math.round((doneCount / updated.length) * 100) : 0;

    /* optimistic update */
    setGoals((gs) =>
      gs.map((g) =>
        g.id === goalId ? { ...g, milestones: updated, progress } : g
      )
    );

    try {
      await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestones: updated.map((m) => ({
            id: m.id,
            label: m.label,
            done: m.done,
            order: m.order,
          })),
        }),
      });
    } catch {
      fetchGoals();
    }
  };

  const deleteGoal = async (id: string) => {
    setGoals((gs) => gs.filter((g) => g.id !== id));
    try {
      await fetch(`/api/goals/${id}`, { method: "DELETE" });
    } catch {
      fetchGoals();
    }
  };

  const [goalError, setGoalError] = useState("");

  const createGoal = async () => {
    if (!title.trim() || !deadline || !category.trim()) return;
    setSaving(true);
    setGoalError("");
    try {
      const milestones = milestoneInputs
        .filter((m) => m.label.trim())
        .map((m, i) => ({ label: m.label.trim(), order: i }));

      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          deadline: new Date(deadline).toISOString(),
          category: category.trim(),
          milestones,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al crear objetivo");
      }
      const goal = await res.json();
      setGoals((gs) => [goal, ...gs]);
      resetForm();
      setModalOpen(false);
      setGoalError("");
    } catch (err) {
      setGoalError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDeadline("");
    setCategory("");
    setMilestoneInputs([{ label: "" }]);
  };

  const addMilestoneInput = () => {
    setMilestoneInputs((ms) => [...ms, { label: "" }]);
  };

  const updateMilestoneInput = (idx: number, label: string) => {
    setMilestoneInputs((ms) =>
      ms.map((m, i) => (i === idx ? { label } : m))
    );
  };

  const removeMilestoneInput = (idx: number) => {
    setMilestoneInputs((ms) => ms.filter((_, i) => i !== idx));
  };

  /* ── Render helpers ────────────────────────── */

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const GoalCard = ({ goal }: { goal: Goal }) => {
    const expanded = expandedGoal === goal.id;
    const deadlineDate = new Date(goal.deadline);
    const overdue = deadlineDate < new Date() && goal.progress < 100;

    return (
      <div
        className="card"
        style={{
          padding: isMobile ? 14 : 20,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <span
              className="t-title"
              style={{ fontSize: 15, display: "block", marginBottom: 6 }}
            >
              {goal.title}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="badge badge-white">{goal.category}</span>
              <span
                className="badge badge-dim"
                style={overdue ? { background: "rgba(244,67,54,0.15)", color: "#EF9A9A", border: "none" } : {}}
              >
                {formatDate(goal.deadline)}
              </span>
            </div>
          </div>
          <button
            onClick={() => deleteGoal(goal.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-lo)",
              flexShrink: 0,
            }}
          >
            <Icon name="trash" size={14} />
          </button>
        </div>

        {/* Progress */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span className="t-label">Progreso</span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 600,
                color: goal.progress === 100 ? "#A5D6A7" : "var(--text-mid)",
              }}
            >
              {goal.progress}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>

        {/* Milestones toggle */}
        {goal.milestones.length > 0 && (
          <div>
            <button
              className="btn btn-ghost"
              style={{ padding: "4px 10px", fontSize: 10, width: "100%", justifyContent: "center" }}
              onClick={() => setExpandedGoal(expanded ? null : goal.id)}
            >
              {expanded ? "Ocultar hitos" : `Ver hitos (${goal.milestones.length})`}
            </button>

            {expanded && (
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {goal.milestones
                  .sort((a, b) => a.order - b.order)
                  .map((ms, idx) => (
                    <div
                      key={ms.id ?? idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "6px 0",
                      }}
                    >
                      <button
                        className={`check ${ms.done ? "checked" : ""}`}
                        onClick={() => toggleMilestone(goal.id, idx)}
                      >
                        {ms.done ? "✓" : ""}
                      </button>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: ms.done ? "var(--text-lo)" : "var(--text-hi)",
                          textDecoration: ms.done ? "line-through" : "none",
                        }}
                      >
                        {ms.label}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ── Main render ───────────────────────────── */

  if (!planLoading && !isPremium) {
    return <PremiumWall feature="Metas" />;
  }

  return (
    <div className="section-inner">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span className="t-label" style={{ fontSize: 11 }}>
          Metas ({goals.length})
        </span>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
        >
          <Icon name="plus" size={14} />
          Nueva Meta
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            color: "var(--text-lo)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
          }}
        >
          Cargando metas...
        </div>
      ) : goals.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "var(--text-lo)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
          }}
        >
          No hay metas todavia. Crea tu primera meta.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(340px, 1fr))",
            gap: isMobile ? 14 : 20,
            alignItems: "start",
          }}
        >
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva Meta"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {goalError && (
            <div style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "var(--radius-sm)", padding: "10px 14px",
              fontFamily: "var(--font-mono)", fontSize: 12, color: "#ef4444", textAlign: "center",
            }}>
              {goalError}
            </div>
          )}
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>
              Titulo
            </label>
            <input
              className="input"
              placeholder="Nombre de la meta"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>
              Fecha limite
            </label>
            <input
              className="input"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>
              Categoria
            </label>
            <input
              className="input"
              placeholder="Salud, Carrera, Personal..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          {/* Milestones */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <label className="t-label">Hitos</label>
              <button
                className="btn btn-ghost"
                style={{ padding: "2px 8px", fontSize: 9 }}
                onClick={addMilestoneInput}
                type="button"
              >
                <Icon name="plus" size={12} />
                Agregar
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {milestoneInputs.map((ms, idx) => (
                <div key={idx} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--text-lo)",
                      width: 18,
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}.
                  </span>
                  <input
                    className="input"
                    placeholder={`Hito ${idx + 1}`}
                    value={ms.label}
                    onChange={(e) => updateMilestoneInput(idx, e.target.value)}
                  />
                  {milestoneInputs.length > 1 && (
                    <button
                      onClick={() => removeMilestoneInput(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-lo)",
                        flexShrink: 0,
                      }}
                      type="button"
                    >
                      <Icon name="x" size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
            onClick={createGoal}
            disabled={saving || !title.trim() || !deadline || !category.trim()}
          >
            {saving ? "Guardando..." : "Crear Meta"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
