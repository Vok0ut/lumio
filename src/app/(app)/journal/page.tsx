"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "@/src/components/ui/modal";
import { Icon } from "@/src/components/ui/icons";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { usePlan } from "@/src/hooks/use-plan";
import { PremiumWall } from "@/src/components/ui/premium-wall";

/* ---------- types ---------- */

interface JournalEntry {
  id: string;
  title: string;
  body: string;
  mood: number;
  tags: string[];
  date: string;
  createdAt?: string; // may not exist — use `date` as primary
}

interface JournalResponse {
  entries: JournalEntry[];
  page: number;
  total: number;
  totalPages: number;
  hasMore?: boolean; // computed client-side from page/totalPages
}

interface NewEntryPayload {
  title: string;
  body: string;
  mood: number;
  tags: string[];
}

/* ---------- helpers ---------- */

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MoodDots({ value }: { value: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background:
              n <= value ? "var(--accent)" : "rgba(255,255,255,0.1)",
            transition: "background 0.15s",
          }}
        />
      ))}
    </span>
  );
}

/* ---------- mood selector ---------- */

function MoodSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border:
              n === value
                ? "2px solid var(--accent)"
                : "1px solid var(--border-mid)",
            background:
              n === value ? "var(--accent)" : "transparent",
            color: n === value ? "#090909" : "var(--text-mid)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.15s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

/* ---------- entry card ---------- */

function EntryCard({ entry }: { entry: JournalEntry }) {
  const [expanded, setExpanded] = useState(false);

  const preview =
    entry.body.length > 120
      ? entry.body.slice(0, 120) + "..."
      : entry.body;

  return (
    <div
      className="card"
      onClick={() => setExpanded((p) => !p)}
      style={{
        padding: "16px 18px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* top row: date + mood */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          className="t-label"
          style={{ fontSize: 10, letterSpacing: "0.08em" }}
        >
          {formatDate(entry.date ?? entry.createdAt ?? "")}
        </span>
        <MoodDots value={entry.mood} />
      </div>

      {/* title */}
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          fontWeight: 700,
          color: "var(--text-hi)",
          letterSpacing: "-0.01em",
        }}
      >
        {entry.title}
      </span>

      {/* tags */}
      {(entry.tags ?? []).length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {entry.tags.map((tag) => (
            <span key={tag} className="badge badge-dim">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* body */}
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          lineHeight: 1.7,
          color: "var(--text-mid)",
          whiteSpace: expanded ? "pre-wrap" : undefined,
        }}
      >
        {expanded ? entry.body : preview}
      </p>

      {entry.body.length > 120 && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-lo)",
            letterSpacing: "0.04em",
          }}
        >
          {expanded ? "Click para contraer" : "Click para expandir"}
        </span>
      )}
    </div>
  );
}

/* ---------- page ---------- */

export default function JournalPage() {
  const isMobile = useIsMobile();
  const { isPremium, loading: planLoading } = usePlan();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  /* modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newMood, setNewMood] = useState(3);
  const [newTags, setNewTags] = useState("");
  const [saving, setSaving] = useState(false);

  /* fetch entries */
  const fetchEntries = useCallback(async (p: number) => {
    const res = await fetch(`/api/journal?page=${p}`);
    const data: JournalResponse = await res.json();
    // API returns { entries, total, page, totalPages } — derive hasMore
    const hasMore = (data.page ?? p) < (data.totalPages ?? 1);
    return { ...data, entries: data.entries ?? [], hasMore };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchEntries(1)
      .then((data) => {
        setEntries(data.entries);
        setPage(data.page);
        setHasMore(data.hasMore);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [fetchEntries]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await fetchEntries(nextPage);
      setEntries((prev) => [...prev, ...data.entries]);
      setPage(data.page);
      setHasMore(data.hasMore);
    } catch {
      /* swallow */
    }
    setLoadingMore(false);
  };

  const [journalError, setJournalError] = useState("");

  /* create entry */
  const handleCreate = async () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    setSaving(true);
    setJournalError("");

    const payload: NewEntryPayload = {
      title: newTitle.trim(),
      body: newBody.trim(),
      mood: newMood,
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al crear entrada");
      }
      const created: JournalEntry = await res.json();
      setEntries((prev) => [created, ...prev]);
      resetModal();
    } catch (err) {
      setJournalError(err instanceof Error ? err.message : "Error inesperado");
    }
    setSaving(false);
  };

  const resetModal = () => {
    setModalOpen(false);
    setNewTitle("");
    setNewBody("");
    setNewMood(3);
    setNewTags("");
  };

  /* ---------- render ---------- */

  if (!planLoading && !isPremium) {
    return <PremiumWall feature="Journal" />;
  }

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
          <Icon name="book" size={isMobile ? 18 : 20} color="var(--accent)" />
          Journal
        </h1>

        <button
          className="btn btn-primary"
          onClick={() => setModalOpen(true)}
        >
          <Icon name="plus" size={14} color="#090909" />
          Nueva Entrada
        </button>
      </div>

      {/* list */}
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
      ) : entries.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 40,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Icon name="book" size={28} color="var(--text-lo)" />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-lo)",
            }}
          >
            No hay entradas todavia. Crea tu primera entrada.
          </span>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* load more */}
      {hasMore && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            className="btn btn-ghost"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Cargando..." : "Cargar mas"}
          </button>
        </div>
      )}

      {/* new entry modal */}
      <Modal
        open={modalOpen}
        onClose={resetModal}
        title="Nueva Entrada"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {journalError && (
            <div style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "var(--radius-sm)", padding: "10px 14px",
              fontFamily: "var(--font-mono)", fontSize: 12, color: "#ef4444", textAlign: "center",
            }}>
              {journalError}
            </div>
          )}
          {/* title */}
          <div>
            <label className="t-label" style={{ marginBottom: 6, display: "block" }}>
              Titulo
            </label>
            <input
              className="input"
              type="text"
              placeholder="Titulo de la entrada..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          {/* body */}
          <div>
            <label className="t-label" style={{ marginBottom: 6, display: "block" }}>
              Contenido
            </label>
            <textarea
              className="input"
              placeholder="Escribe aqui..."
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              rows={5}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* mood */}
          <div>
            <label className="t-label" style={{ marginBottom: 8, display: "block" }}>
              Estado de animo
            </label>
            <MoodSelector value={newMood} onChange={setNewMood} />
          </div>

          {/* tags */}
          <div>
            <label className="t-label" style={{ marginBottom: 6, display: "block" }}>
              Tags (separados por coma)
            </label>
            <input
              className="input"
              type="text"
              placeholder="productividad, reflexion, ..."
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
            />
          </div>

          {/* submit */}
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={saving || !newTitle.trim() || !newBody.trim()}
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: 4,
              opacity: saving || !newTitle.trim() || !newBody.trim() ? 0.5 : 1,
            }}
          >
            {saving ? "Guardando..." : "Guardar Entrada"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
