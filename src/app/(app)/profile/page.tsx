"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { XPRing } from "@/src/components/ui/xp-ring";
import { Icon } from "@/src/components/ui/icons";
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

export default function ProfilePage() {
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
      {/* Header with XP Ring */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          paddingBottom: 8,
        }}
      >
        <XPRing level={profile.level} progress={xpProgress} size={80} />

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
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10 }}>
            <span className="badge badge-white">{profile.rank.name}</span>
            <span className="badge badge-dim">
              Miembro desde {formatDate(profile.createdAt)}
            </span>
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
    </div>
  );
}
