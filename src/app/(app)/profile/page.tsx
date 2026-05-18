"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { signOut } from "next-auth/react";
import { XPRing } from "@/src/components/ui/xp-ring";
import { Icon } from "@/src/components/ui/icons";
import { Modal } from "@/src/components/ui/modal";
import { useIsMobile } from "@/src/hooks/use-mobile";

interface RankInfo {
  name: string;
  discount: number;
}

interface UserStats {
  habitsCompleted: number;
  tasksDone: number;
  journalEntries: number;
  goalsCompleted: number;
}

interface XpLog {
  action: string;
  xp: number;
  createdAt: string;
}

interface UserProfile {
  email: string;
  name: string | null;
  image: string | null;
  plan: "FREE" | "PREMIUM";
  totalXp: number;
  level: number;
  currentLevelXP: number;
  xpToNextLevel: number;
  rank: RankInfo;
  stats: UserStats;
  recentXpLogs: XpLog[];
  createdAt: string;
}

const ACTION_ICONS: Record<string, string> = {
  habit: "repeat",
  task: "check-square",
  goal: "target",
  journal: "book",
  streak7: "award",
  streak30: "award",
};

const ACTION_LABELS: Record<string, string> = {
  habit: "Habito completado",
  task: "Tarea completada",
  goal: "Meta lograda",
  journal: "Entrada de journal",
  streak7: "Racha 7 dias",
  streak30: "Racha 30 dias",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

/** Resize image to max 256x256 and return base64 data URL */
function resizeImage(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxSize) { h = (h * maxSize) / w; w = maxSize; }
        } else {
          if (h > maxSize) { w = (w * maxSize) / h; h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No canvas context"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/webp", 0.8));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [equippedBadges, setEquippedBadges] = useState<Array<{ skillId: string; tier: string; skillName: string }>>([]);

  /* edit modal state */
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* dev code state */
  const [codeOpen, setCodeOpen] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [redeemingCode, setRedeemingCode] = useState(false);

  const loadProfile = useCallback(() => {
    Promise.all([
      fetch("/api/user/me").then((r) => r.json()),
      fetch("/api/achievements").then((r) => r.json()).catch(() => ({ equippedBadges: [] })),
    ])
      .then(([userData, achData]) => {
        setProfile(userData);
        setEquippedBadges(achData?.equippedBadges ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /* Re-fetch when window regains focus so XP/level updates are reflected */
  useEffect(() => {
    const onFocus = () => loadProfile();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadProfile]);

  const openEdit = useCallback(() => {
    if (!profile) return;
    setEditName(profile.name ?? "");
    setEditImage(profile.image ?? null);
    setEditOpen(true);
  }, [profile]);

  const handleImagePick = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file);
      setEditImage(dataUrl);
    } catch {
      /* ignore */
    }
  }, []);

  const redeemCode = useCallback(async () => {
    if (!devCode.trim()) return;
    setCodeError("");
    setRedeemingCode(true);
    try {
      const res = await fetch("/api/user/redeem-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: devCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCodeError(data.error || "Error al canjear el codigo");
        return;
      }
      setProfile((prev) => prev ? { ...prev, plan: "PREMIUM" } : prev);
      setCodeOpen(false);
      setDevCode("");
    } catch {
      setCodeError("Error de conexion");
    } finally {
      setRedeemingCode(false);
    }
  }, [devCode]);

  const saveProfile = useCallback(async () => {
    if (!profile) return;
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim() || undefined,
          image: editImage ?? undefined,
        }),
      });
      if (res.ok) {
        setEditOpen(false);
        /* Full re-fetch to ensure all data (image, XP, stats) is current */
        loadProfile();
      }
    } finally {
      setSavingProfile(false);
    }
  }, [profile, editName, editImage, loadProfile]);

  if (loading) {
    return (
      <div className="section-inner" style={{ alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-lo)" }}>
          Cargando perfil...
        </span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="section-inner" style={{ alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-lo)" }}>
          Error al cargar perfil
        </span>
      </div>
    );
  }

  const xpProgress = profile.xpToNextLevel > 0 ? profile.currentLevelXP / profile.xpToNextLevel : 0;

  const statCards = [
    { label: "XP Total", value: profile.totalXp.toLocaleString() },
    { label: "Nivel", value: profile.level },
    { label: "Rango", value: profile.rank.name },
    { label: "Habitos", value: profile.stats.habitsCompleted },
    { label: "Tareas", value: profile.stats.tasksDone },
  ];

  return (
    <div className="section-inner">
      {/* Header with Avatar & XP Ring */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          paddingBottom: 8,
        }}
      >
        {/* Avatar */}
        <div style={{ position: "relative" }}>
          {profile.image ? (
            <img
              src={profile.image}
              alt="Avatar"
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid var(--border)",
              }}
            />
          ) : (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                border: "2px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="user" size={32} color="var(--text-lo)" />
            </div>
          )}
          <div
            style={{
              position: "absolute",
              bottom: -4,
              right: -4,
            }}
          >
            <XPRing level={profile.level} progress={xpProgress} size={36} />
          </div>
        </div>

        {/* Equipped badges row */}
        {equippedBadges.length > 0 && (
          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            {equippedBadges.map((b) => (
              <div
                key={`${b.skillId}-${b.tier}`}
                title={`${b.skillName} — ${b.tier === "gold" ? "Oro" : "Plata"}`}
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: b.tier === "gold" ? "var(--xp-lo)" : "rgba(170,170,170,0.1)",
                  border: `2px solid ${b.tier === "gold" ? "var(--xp)" : "#aaa"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, color: b.tier === "gold" ? "var(--xp)" : "#ccc",
                }}
              >
                {b.tier === "gold" ? "★" : "⬡"}
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text-hi)",
              letterSpacing: "-0.02em",
            }}
          >
            {profile.name || "Usuario"}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-lo)",
              marginTop: 4,
            }}
          >
            {profile.email}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
            <span className="badge badge-white">{profile.rank.name}</span>
            <span
              className="badge"
              style={{
                background: profile.plan === "PREMIUM"
                  ? "rgba(255,215,0,0.15)"
                  : "rgba(255,255,255,0.05)",
                color: profile.plan === "PREMIUM" ? "#FFD700" : "var(--text-lo)",
                border: profile.plan === "PREMIUM" ? "1px solid rgba(255,215,0,0.3)" : "1px solid var(--border)",
              }}
            >
              {profile.plan === "PREMIUM" ? "Premium" : "Free"}
            </span>
            <span className="badge badge-dim">
              Miembro desde {formatDate(profile.createdAt)}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 11 }}
              onClick={openEdit}
            >
              <Icon name="edit" size={12} />
              Editar perfil
            </button>
            {profile.plan !== "PREMIUM" && (
              <button
                className="btn btn-ghost"
                style={{ fontSize: 11 }}
                onClick={() => { setCodeOpen(true); setCodeError(""); setDevCode(""); }}
              >
                <Icon name="key" size={12} />
                Canjear codigo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div
        className="card"
        style={{ padding: isMobile ? 16 : 20 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <span className="t-label">Progreso de nivel</span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-mid)",
            }}
          >
            {profile.currentLevelXP} / {profile.xpToNextLevel} XP
          </span>
        </div>
        <div className="progress-bar" style={{ height: 6 }}>
          <div
            className="progress-fill"
            style={{ width: `${Math.min(xpProgress * 100, 100)}%` }}
          />
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-lo)",
            marginTop: 8,
            textAlign: "right",
          }}
        >
          {Math.round(xpProgress * 100)}% al nivel {profile.level + 1}
        </div>
      </div>

      {/* Stats Cards */}
      <div>
        <span className="t-label" style={{ marginBottom: 12, display: "block" }}>
          Estadisticas
        </span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)",
            gap: 10,
          }}
        >
          {statCards.map((s) => (
            <div
              key={s.label}
              className="card"
              style={{
                padding: isMobile ? "14px 12px" : "16px 14px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--text-hi)",
                  letterSpacing: "-0.02em",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-lo)",
                  marginTop: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* XP History */}
      <div>
        <span className="t-label" style={{ marginBottom: 12, display: "block" }}>
          Historial de XP
        </span>
        <div className="card" style={{ overflow: "hidden" }}>
          {(profile.recentXpLogs ?? []).length === 0 ? (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-lo)",
              }}
            >
              Sin actividad reciente
            </div>
          ) : (
            (profile.recentXpLogs ?? []).map((log, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: isMobile ? "12px 14px" : "12px 18px",
                  borderBottom:
                    i < (profile.recentXpLogs ?? []).length - 1
                      ? "1px solid var(--border)"
                      : "none",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    name={ACTION_ICONS[log.action] || "award"}
                    size={14}
                    color="var(--text-mid)"
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--text-hi)",
                    }}
                  >
                    {ACTION_LABELS[log.action] || log.action}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--text-lo)",
                      marginTop: 2,
                    }}
                  >
                    {formatTimestamp(log.createdAt)}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--accent)",
                    flexShrink: 0,
                  }}
                >
                  +{log.xp} XP
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sign Out */}
      <div style={{ paddingTop: 8, paddingBottom: isMobile ? 80 : 16 }}>
        <button
          className="btn btn-ghost"
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{ width: "100%" }}
        >
          Cerrar sesion
        </button>
      </div>

      {/* Edit Profile Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar perfil">
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          {/* Avatar preview */}
          <div
            style={{ cursor: "pointer", position: "relative" }}
            onClick={() => fileRef.current?.click()}
          >
            {editImage ? (
              <img
                src={editImage}
                alt="Preview"
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid var(--border)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                  border: "2px dashed var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <Icon name="plus" size={20} color="var(--text-lo)" />
                <span style={{ fontSize: 9, color: "var(--text-lo)", fontFamily: "var(--font-mono)" }}>
                  Subir foto
                </span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImagePick}
              style={{ display: "none" }}
            />
          </div>

          {/* Name input */}
          <div style={{ width: "100%" }}>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>
              Nombre de usuario
            </label>
            <input
              className="input"
              placeholder="Tu nombre"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, width: "100%", justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setEditOpen(false)}>
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={saveProfile}
              disabled={savingProfile || !editName.trim()}
              style={{ opacity: savingProfile || !editName.trim() ? 0.5 : 1 }}
            >
              {savingProfile ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Redeem Code Modal */}
      <Modal open={codeOpen} onClose={() => setCodeOpen(false)} title="Canjear codigo">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>
              Codigo de desarrollador
            </label>
            <input
              className="input"
              placeholder="LUMIO-DEV-XXXXX"
              value={devCode}
              onChange={(e) => setDevCode(e.target.value.toUpperCase())}
              maxLength={30}
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}
            />
          </div>

          {codeError && (
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "#EF9A9A",
              padding: "8px 12px",
              background: "rgba(244,67,54,0.1)",
              borderRadius: "var(--radius-sm)",
            }}>
              {codeError}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setCodeOpen(false)}>
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={redeemCode}
              disabled={redeemingCode || !devCode.trim()}
              style={{ opacity: redeemingCode || !devCode.trim() ? 0.5 : 1 }}
            >
              {redeemingCode ? "Canjeando..." : "Canjear"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
