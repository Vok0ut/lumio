"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@/src/components/ui/modal";
import { Icon } from "@/src/components/ui/icons";
import { useIsMobile } from "@/src/hooks/use-mobile";

/* ── Types ─────────────────────────────────── */

type Priority = "alta" | "media" | "baja";
type Status = "TODO" | "IN_PROGRESS" | "DONE";

interface Task {
  id: string;
  title: string;
  priority: Priority;
  tags: string[];
  estimate: string | null;
  status: Status;
  createdAt: string;
}

const COLUMNS: { key: Status; label: string }[] = [
  { key: "TODO", label: "Por hacer" },
  { key: "IN_PROGRESS", label: "En progreso" },
  { key: "DONE", label: "Completado" },
];

const PRIORITY_COLORS: Record<Priority, { bg: string; color: string }> = {
  alta: { bg: "rgba(244,67,54,0.25)", color: "#F48FB1" },
  media: { bg: "rgba(255,193,7,0.25)", color: "#FFE082" },
  baja: { bg: "rgba(76,175,80,0.25)", color: "#A5D6A7" },
};

/* ── Component ──────────────────────────────── */

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const view = searchParams.get("view") === "list" ? "list" : "kanban";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [xpFlash, setXpFlash] = useState<string | null>(null);

  /* form state */
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("media");
  const [tagsRaw, setTagsRaw] = useState("");
  const [estimate, setEstimate] = useState("");
  const [saving, setSaving] = useState(false);

  /* ── Fetch ─────────────────────────────────── */

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        // API returns grouped object { TODO: [], IN_PROGRESS: [], DONE: [] }
        // Flatten into a single array for local state
        if (data && !Array.isArray(data)) {
          const flat: Task[] = [
            ...(data.TODO ?? []),
            ...(data.IN_PROGRESS ?? []),
            ...(data.DONE ?? []),
          ];
          setTasks(flat);
        } else {
          setTasks(Array.isArray(data) ? data : []);
        }
      }
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /* ── Handlers ──────────────────────────────── */

  const setView = (v: "kanban" | "list") => {
    router.push(`/tasks?view=${v}`);
  };

  const moveTask = async (id: string, status: Status) => {
    const prev = tasks.find((t) => t.id === id);
    if (!prev || prev.status === status || prev.status === "DONE") return;

    /* optimistic update */
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));

    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (status === "DONE") {
        setXpFlash(id);
        setTimeout(() => setXpFlash(null), 1200);
      }
    } catch {
      /* revert */
      setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: prev.status } : t)));
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((ts) => ts.filter((t) => t.id !== id));
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    } catch {
      fetchTasks();
    }
  };

  const createTask = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const tags = tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          priority,
          tags,
          estimate: estimate.trim() || undefined,
        }),
      });
      if (res.ok) {
        const task = await res.json();
        setTasks((ts) => [task, ...ts]);
        resetForm();
        setModalOpen(false);
      }
    } catch {
      /* silently fail */
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setPriority("media");
    setTagsRaw("");
    setEstimate("");
  };

  /* ── Render helpers ────────────────────────── */

  const tasksByStatus = (status: Status) => tasks.filter((t) => t.status === status);

  const PriorityBadge = ({ p }: { p: Priority }) => (
    <span
      className="badge"
      style={{
        background: PRIORITY_COLORS[p].bg,
        color: PRIORITY_COLORS[p].color,
        border: "none",
      }}
    >
      {p}
    </span>
  );

  const MoveButtons = ({ task }: { task: Task }) => {
    // Una vez completada, no se muestran botones de movimiento
    if (task.status === "DONE") return null;

    const btns: { label: string; to: Status }[] = [];
    if (task.status !== "TODO") btns.push({ label: "Todo", to: "TODO" });
    if (task.status !== "IN_PROGRESS") btns.push({ label: "Progreso", to: "IN_PROGRESS" });
    btns.push({ label: "Done", to: "DONE" });

    return (
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {btns.map((b) => (
          <button
            key={b.to}
            className="btn btn-ghost"
            style={{ padding: "3px 8px", fontSize: 9 }}
            onClick={() => moveTask(task.id, b.to)}
          >
            {b.label}
          </button>
        ))}
      </div>
    );
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div
      className="card"
      style={{
        padding: isMobile ? 12 : 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
      }}
    >
      {xpFlash === task.id && (
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 12,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 700,
            color: "#A5D6A7",
            animation: "fadeIn 0.3s ease forwards",
          }}
        >
          +25 XP
        </span>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-hi)",
            flex: 1,
          }}
        >
          {task.title}
        </span>
        <button
          onClick={() => deleteTask(task.id)}
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

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <PriorityBadge p={task.priority as Priority} />
        {task.tags.map((tag) => (
          <span key={tag} className="badge badge-dim">
            {tag}
          </span>
        ))}
        {task.estimate && (
          <span className="badge badge-white">{task.estimate}</span>
        )}
      </div>

      <MoveButtons task={task} />
    </div>
  );

  /* ── Kanban view ───────────────────────────── */

  const KanbanView = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        gap: isMobile ? 16 : 20,
        alignItems: "start",
      }}
    >
      {COLUMNS.map((col) => {
        const colTasks = tasksByStatus(col.key);
        return (
          <div key={col.key} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <span className="t-label">{col.label}</span>
              <span
                className="badge badge-dim"
                style={{ fontSize: 9, padding: "1px 6px" }}
              >
                {colTasks.length}
              </span>
            </div>
            {colTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {colTasks.length === 0 && (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: "var(--text-lo)",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  border: "1px dashed var(--border)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                Sin tareas
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  /* ── List view ─────────────────────────────── */

  const ListView = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {COLUMNS.map((col) => {
        const colTasks = tasksByStatus(col.key);
        return (
          <div key={col.key}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <span className="t-label">{col.label}</span>
              <span className="badge badge-dim" style={{ fontSize: 9, padding: "1px 6px" }}>
                {colTasks.length}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  className="card"
                  style={{
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                    position: "relative",
                  }}
                >
                  {xpFlash === task.id && (
                    <span
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 12,
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#A5D6A7",
                        animation: "fadeIn 0.3s ease forwards",
                      }}
                    >
                      +25 XP
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-hi)",
                      flex: 1,
                      minWidth: 120,
                    }}
                  >
                    {task.title}
                  </span>
                  <PriorityBadge p={task.priority as Priority} />
                  {task.tags.map((tag) => (
                    <span key={tag} className="badge badge-dim">
                      {tag}
                    </span>
                  ))}
                  {task.estimate && (
                    <span className="badge badge-white">{task.estimate}</span>
                  )}
                  <MoveButtons task={task} />
                  <button
                    onClick={() => deleteTask(task.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-lo)",
                    }}
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              ))}
              {colTasks.length === 0 && (
                <div
                  style={{
                    padding: 16,
                    textAlign: "center",
                    color: "var(--text-lo)",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Sin tareas
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  /* ── Main render ───────────────────────────── */

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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            className={`btn ${view === "kanban" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setView("kanban")}
          >
            Kanban
          </button>
          <button
            className={`btn ${view === "list" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setView("list")}
          >
            Lista
          </button>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
        >
          <Icon name="plus" size={14} />
          Nueva Tarea
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
          Cargando tareas...
        </div>
      ) : view === "kanban" ? (
        <KanbanView />
      ) : (
        <ListView />
      )}

      {/* Create modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva Tarea"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>
              Titulo
            </label>
            <input
              className="input"
              placeholder="Nombre de la tarea"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>
              Prioridad
            </label>
            <select
              className="input"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>
              Tags (separados por coma)
            </label>
            <input
              className="input"
              placeholder="diseño, frontend, bug..."
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
            />
          </div>

          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>
              Estimado
            </label>
            <input
              className="input"
              placeholder="2h, 1d, 30min..."
              value={estimate}
              onChange={(e) => setEstimate(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
            onClick={createTask}
            disabled={saving || !title.trim()}
          >
            {saving ? "Guardando..." : "Crear Tarea"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
