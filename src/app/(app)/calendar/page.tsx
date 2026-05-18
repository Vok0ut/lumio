"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Modal } from "@/src/components/ui/modal";
import { Icon } from "@/src/components/ui/icons";
import { useIsMobile } from "@/src/hooks/use-mobile";

/* ---------- types ---------- */

interface CalendarEvent {
  id: string;
  title: string;
  date: string;   // YYYY-MM-DD
  time: string;    // HH:MM
}

interface NewEventPayload {
  title: string;
  date: string;
  time: string;
}

/* ---------- date helpers ---------- */

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getWeekStart(ref: Date): Date {
  const d = new Date(ref);
  const day = d.getDay(); // 0=sun
  const diff = day === 0 ? 6 : day - 1; // monday-based
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const DAY_LABELS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

function formatDayHeader(d: Date): string {
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function formatWeekRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const s = start.toLocaleDateString("es-ES", opts);
  const e = end.toLocaleDateString("es-ES", { ...opts, year: "numeric" });
  return `${s} - ${e}`;
}

/* ---------- page ---------- */

export default function CalendarPage() {
  const isMobile = useIsMobile();

  const [weekRef, setWeekRef] = useState<Date>(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  /* modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [saving, setSaving] = useState(false);

  /* computed week days */
  const weekStart = useMemo(() => getWeekStart(weekRef), [weekRef]);
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  }, [weekStart]);
  const weekEnd = weekDays[6];
  const todayStr = toYMD(new Date());

  /* fetch events for the visible week */
  const fetchEvents = useCallback(async (start: string, end: string) => {
    const res = await fetch(
      `/api/calendar?start=${start}&end=${end}`
    );
    const raw: Array<Record<string, unknown>> = await res.json();
    // API returns Prisma Date objects serialized as full ISO strings.
    // Normalize `date` to YYYY-MM-DD for grouping.
    const data: CalendarEvent[] = (raw ?? []).map((ev) => ({
      ...ev,
      date: typeof ev.date === "string" ? ev.date.slice(0, 10) : String(ev.date),
      time: String(ev.time ?? ""),
    })) as CalendarEvent[];
    return data;
  }, []);

  useEffect(() => {
    setLoading(true);
    const start = toYMD(weekStart);
    const end = toYMD(addDays(weekStart, 6));
    fetchEvents(start, end)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [weekStart, fetchEvents]);

  /* navigation */
  const goPrev = () => setWeekRef((prev) => addDays(getWeekStart(prev), -7));
  const goNext = () => setWeekRef((prev) => addDays(getWeekStart(prev), 7));
  const goToday = () => setWeekRef(new Date());

  /* group events by date */
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    // sort each day by time
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.time.localeCompare(b.time));
    }
    return map;
  }, [events]);

  const [calError, setCalError] = useState("");

  /* create event */
  const handleCreate = async () => {
    if (!newTitle.trim() || !newDate || !newTime) return;
    setSaving(true);
    setCalError("");

    const payload: NewEventPayload = {
      title: newTitle.trim(),
      date: newDate,
      time: newTime,
    };

    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al crear evento");
      }
      const created: CalendarEvent = await res.json();
      setEvents((prev) => [...prev, created]);
      resetModal();
    } catch (err) {
      setCalError(err instanceof Error ? err.message : "Error inesperado");
    }
    setSaving(false);
  };

  const resetModal = () => {
    setModalOpen(false);
    setNewTitle("");
    setNewDate("");
    setNewTime("");
  };

  /* ---------- render ---------- */

  return (
    <div className="section-inner">
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h1
          className="t-title"
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <Icon
            name="calendar"
            size={isMobile ? 18 : 20}
            color="var(--accent)"
          />
          Calendario
        </h1>

        <button
          className="btn btn-primary"
          onClick={() => setModalOpen(true)}
        >
          <Icon name="plus" size={14} color="#090909" />
          Evento
        </button>
      </div>

      {/* week nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <button className="btn btn-ghost" onClick={goPrev}>
          <Icon name="chevron-left" size={16} />
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-hi)",
            }}
          >
            {formatWeekRange(weekStart, weekEnd)}
          </span>
          <button
            className="btn btn-ghost"
            onClick={goToday}
            style={{ padding: "4px 10px", fontSize: 10 }}
          >
            Hoy
          </button>
        </div>

        <button className="btn btn-ghost" onClick={goNext}>
          <Icon name="chevron-right" size={16} />
        </button>
      </div>

      {/* week grid */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-lo)",
          }}
        >
          Cargando...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(7, 1fr)",
            gap: isMobile ? 10 : 8,
          }}
        >
          {weekDays.map((day, idx) => {
            const dayStr = toYMD(day);
            const isToday = dayStr === todayStr;
            const dayEvents = eventsByDate[dayStr] ?? [];

            return (
              <div
                key={dayStr}
                className="card"
                style={{
                  padding: "14px 12px",
                  minHeight: isMobile ? "auto" : 180,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  borderColor: isToday
                    ? "var(--accent)"
                    : undefined,
                }}
              >
                {/* day header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                  }}
                >
                  <span
                    className="t-label"
                    style={{
                      color: isToday
                        ? "var(--accent)"
                        : undefined,
                    }}
                  >
                    {DAY_LABELS[idx]}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: isToday ? 700 : 400,
                      color: isToday
                        ? "var(--accent)"
                        : "var(--text-mid)",
                    }}
                  >
                    {formatDayHeader(day)}
                  </span>
                </div>

                <div
                  className="divider"
                  style={{ margin: "2px 0" }}
                />

                {/* events */}
                {dayEvents.length === 0 ? (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--text-lo)",
                      paddingTop: 4,
                    }}
                  >
                    Sin eventos
                  </span>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                          padding: "6px 8px",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--bg-raised)",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--text-hi)",
                            lineHeight: 1.3,
                          }}
                        >
                          {ev.title}
                        </span>
                        <span className="badge badge-dim">
                          {ev.time}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* new event modal */}
      <Modal
        open={modalOpen}
        onClose={resetModal}
        title="Nuevo Evento"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {calError && (
            <div style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "var(--radius-sm)", padding: "10px 14px",
              fontFamily: "var(--font-mono)", fontSize: 12, color: "#ef4444", textAlign: "center",
            }}>
              {calError}
            </div>
          )}
          {/* title */}
          <div>
            <label
              className="t-label"
              style={{ marginBottom: 6, display: "block" }}
            >
              Titulo
            </label>
            <input
              className="input"
              type="text"
              placeholder="Nombre del evento..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          {/* date */}
          <div>
            <label
              className="t-label"
              style={{ marginBottom: 6, display: "block" }}
            >
              Fecha
            </label>
            <input
              className="input"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>

          {/* time */}
          <div>
            <label
              className="t-label"
              style={{ marginBottom: 6, display: "block" }}
            >
              Hora
            </label>
            <input
              className="input"
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />
          </div>

          {/* submit */}
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={saving || !newTitle.trim() || !newDate || !newTime}
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: 4,
              opacity:
                saving || !newTitle.trim() || !newDate || !newTime
                  ? 0.5
                  : 1,
            }}
          >
            {saving ? "Guardando..." : "Crear Evento"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
