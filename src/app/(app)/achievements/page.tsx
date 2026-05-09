"use client";

import { useEffect, useState } from "react";
import { SKILL_TREE, type SkillNode, xpForLevel } from "@/src/lib/gamification";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { TiltCard } from "@/src/components/ui/tilt-card";

type Tab = "tree" | "badges" | "rewards";

interface SkillProgress {
  id: string;
  level: number;
  currentXp: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
}

interface Reward {
  skillId: string;
  skillName: string;
  rewardLabel: string;
  unlocked: boolean;
}

interface AchievementsApiResponse {
  skillTree?: Array<SkillProgress & {
    name?: string;
    xpSource?: string;
    rewardLabel?: string;
    unlocked?: boolean;
  }>;
  skills?: SkillProgress[];
  badges?: Array<{ id: string; name: string; desc?: string; description?: string; unlocked: boolean }>;
  rewards?: Reward[];
}

const TABS: { key: Tab; label: string; count?: number }[] = [
  { key: "tree", label: "Skill Tree" },
  { key: "badges", label: "Badges" },
  { key: "rewards", label: "Rewards" },
];

const DEFAULT_BADGES: Badge[] = [
  { id: "streak7", name: "Racha de 7 dias", description: "Completa 7 dias seguidos", unlocked: false },
  { id: "first-goal", name: "Primera meta", description: "Completa tu primera meta", unlocked: false },
  { id: "habits100", name: "100 habitos", description: "Completa 100 habitos", unlocked: false },
  { id: "level10", name: "Nivel 10", description: "Alcanza el nivel 10", unlocked: false },
  { id: "streak30", name: "Racha de 30 dias", description: "Completa 30 dias seguidos", unlocked: false },
  { id: "tasks50", name: "50 tareas", description: "Completa 50 tareas", unlocked: false },
];

const BADGE_ICONS = ["★", "🔥", "◆", "⬡", "✦", "⚡"];

function getSkillLevel(skills: SkillProgress[], nodeId: string): SkillProgress | null {
  return skills.find((s) => s.id === nodeId) ?? null;
}

function nodeColor(level: number): string {
  if (level === 0) return "var(--text-lo)";
  if (level < 3) return "var(--mid)";
  if (level < 5) return "var(--accent)";
  return "var(--white)";
}

function nodeBgOpacity(level: number): number {
  if (level === 0) return 0.12;
  if (level < 3) return 0.3;
  if (level < 5) return 0.6;
  return 1;
}

/* ─── Starfield ─── */

function Starfield() {
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`,
    size: 1 + Math.random() * 1.5,
  }));

  return (
    <div className="starfield">
      {stars.map((s) => (
        <span key={s.id} style={{
          left: s.left, top: s.top,
          animationDelay: s.delay,
          width: s.size, height: s.size,
        }} />
      ))}
    </div>
  );
}

/* ─── Skill Tree SVG ─── */

function SkillTreeView({
  skills,
  isMobile,
  onSelectNode,
  selectedId,
}: {
  skills: SkillProgress[];
  isMobile: boolean;
  onSelectNode: (node: SkillNode) => void;
  selectedId: string | null;
}) {
  const svgW = 600;
  const svgH = 500;

  return (
    <div style={{ position: "relative" }}>
      <Starfield />
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="tree-svg"
        style={{ width: "100%", maxWidth: isMobile ? "100%" : 600, height: "auto" }}
      >
        {SKILL_TREE.filter((n) => n.parent).map((node) => {
          const parent = SKILL_TREE.find((p) => p.id === node.parent)!;
          return (
            <line
              key={`${node.parent}-${node.id}`}
              x1={(parent.x / 100) * svgW}
              y1={(parent.y / 100) * svgH}
              x2={(node.x / 100) * svgW}
              y2={(node.y / 100) * svgH}
              stroke="var(--border-mid)"
              strokeWidth="1.5"
              strokeDasharray="8 6"
              className="edge-flow"
            />
          );
        })}

        {SKILL_TREE.map((node) => {
          const progress = getSkillLevel(skills, node.id);
          const level = progress?.level ?? 0;
          const cx = (node.x / 100) * svgW;
          const cy = (node.y / 100) * svgH;
          const r = isMobile ? 22 : 26;
          const isSelected = selectedId === node.id;

          return (
            <g
              key={node.id}
              className={`node ${level === 0 ? "locked" : ""} ${isSelected ? "sel" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => onSelectNode(node)}
            >
              {level > 0 && level < 5 && (
                <circle cx={cx} cy={cy} r={r + 6} fill="none"
                  stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"
                  className="avail-ring" />
              )}
              <circle
                cx={cx} cy={cy} r={r}
                fill="var(--accent)" opacity={nodeBgOpacity(level)}
                stroke={nodeColor(level)} strokeWidth={isSelected ? 2 : 1.5}
              />
              <text
                x={cx} y={cy - 4}
                textAnchor="middle" dominantBaseline="middle"
                fill={nodeColor(level)}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: isMobile ? 7 : 8,
                  fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
                }}
              >
                {node.name}
              </text>
              <text
                x={cx} y={cy + 9}
                textAnchor="middle" dominantBaseline="middle"
                fill={nodeColor(level)}
                style={{ fontFamily: "var(--font-mono)", fontSize: isMobile ? 7 : 8, opacity: 0.6 }}
              >
                Lv.{level}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Node Detail Panel ─── */

function NodeDetail({
  node,
  skills,
  onClose,
}: {
  node: SkillNode;
  skills: SkillProgress[];
  onClose: () => void;
}) {
  const progress = getSkillLevel(skills, node.id);
  const level = progress?.level ?? 0;
  const currentXp = progress?.currentXp ?? 0;
  const xpNext = xpForLevel(level + 1);

  return (
    <div className="skill-drawer open">
      <div className="drawer-head">
        <div>
          <span className="t-label">{node.xpSource}</span>
          <div className="drawer-title" style={{ fontFamily: "var(--font-sans)", color: "var(--text-hi)" }}>
            {node.name}
          </div>
        </div>
        <button className="drawer-close" onClick={onClose}>+</button>
      </div>

      <div className="drawer-grid">
        <div className="dg-item">
          <span className="t-label">Nivel</span>
          <div className="dg-val" style={{ fontFamily: "var(--font-sans)", color: "var(--text-hi)" }}>{level}</div>
        </div>
        <div className="dg-item">
          <span className="t-label">XP</span>
          <div className="dg-val" style={{ fontFamily: "var(--font-sans)", color: "var(--text-hi)" }}>{currentXp}</div>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span className="t-label">Progreso</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mid)" }}>
            {currentXp} / {xpNext}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${xpNext > 0 ? (currentXp / xpNext) * 100 : 0}%` }} />
        </div>
      </div>

      <div className="drawer-unlock">
        <span className="t-label">Recompensa en Lv.5</span>
        <div style={{
          fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600,
          color: level >= 5 ? "var(--accent)" : "var(--text-lo)", marginTop: 6,
        }}>
          {level >= 5 ? "✓ " : ""}{node.rewardLabel}
        </div>
      </div>
    </div>
  );
}

/* ─── Badges Tab ─── */

function BadgesView({ badges }: { badges: Badge[] }) {
  return (
    <div className="badge-board">
      {badges.map((b, i) => (
        <TiltCard
          key={b.id}
          className={`badge-card ${b.unlocked ? "got" : "pending"}`}
          max={12}
          scale={1.04}
        >
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 6, minHeight: 130, alignItems: "flex-start" }}>
            <div className="bc-icon">{b.unlocked ? BADGE_ICONS[i % BADGE_ICONS.length] : "?"}</div>
            <span className="bc-name">{b.name}</span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 11,
              color: "var(--text-lo)", lineHeight: 1.5,
            }}>
              {b.description}
            </span>
            <span className={`badge ${b.unlocked ? "badge-white" : "badge-dim"}`} style={{ marginTop: "auto" }}>
              {b.unlocked ? "Desbloqueado" : "Bloqueado"}
            </span>
          </div>
        </TiltCard>
      ))}
    </div>
  );
}

/* ─── Rewards Tab ─── */

function RewardsView({ rewards }: { rewards: Reward[] }) {
  return (
    <div className="rewards-list">
      {rewards.map((r) => (
        <div key={r.skillId} className={`reward ${r.unlocked ? "owned" : ""}`}>
          <div className="reward-icon">
            {r.unlocked ? "★" : "?"}
          </div>
          <div>
            <div className="reward-name">{r.rewardLabel || r.skillName}</div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-lo)" }}>
              {r.skillName} · Lv.5
            </span>
          </div>
          <button className={`reward-btn ${r.unlocked ? "" : "on"}`}>
            {r.unlocked ? "Equipar" : "Bloqueado"}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Page ─── */

export default function AchievementsPage() {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<Tab>("tree");
  const [data, setData] = useState<AchievementsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((d: AchievementsApiResponse) => {
        setData(d ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="section-inner">
        <span className="t-label" style={{ textAlign: "center", paddingTop: 48 }}>
          Cargando logros...
        </span>
      </div>
    );
  }

  const skillTreeData = data?.skillTree ?? [];
  const skills: SkillProgress[] = (data?.skills ?? skillTreeData).map((s) => ({
    id: s.id, level: s.level, currentXp: s.currentXp,
  }));

  const badges: Badge[] = (data?.badges ?? DEFAULT_BADGES).map((b) => ({
    id: b.id, name: b.name,
    description: b.description ?? (b as { desc?: string }).desc ?? "",
    unlocked: b.unlocked,
  }));

  const rewards: Reward[] =
    data?.rewards ??
    (skillTreeData.length > 0
      ? skillTreeData.map((s) => ({
          skillId: s.id, skillName: s.name ?? s.id,
          rewardLabel: s.rewardLabel ?? "", unlocked: s.unlocked ?? false,
        }))
      : SKILL_TREE.map((n) => ({
          skillId: n.id, skillName: n.name,
          rewardLabel: n.rewardLabel, unlocked: false,
        })));

  const badgeCount = badges.filter((b) => b.unlocked).length;
  const rewardCount = rewards.filter((r) => r.unlocked).length;

  return (
    <div className="section-inner">
      {/* Header */}
      <div className="skill-head">
        <div>
          <span className="t-label">Logros</span>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--text-hi)", margin: "4px 0 0" }}>
            Skill Tree
          </h1>
        </div>
        <div className="skill-stats">
          <span className="badge badge-white">{skills.length} skills</span>
          <span className="badge badge-dim">{badgeCount} badges</span>
        </div>
      </div>

      {/* Pill tabs */}
      <div className="skill-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`stab ${tab === t.key ? "on" : ""}`}
            onClick={() => { setTab(t.key); setSelectedNode(null); }}
          >
            {t.label}
            {t.key === "badges" && <span className="stab-count">{badgeCount}/{badges.length}</span>}
            {t.key === "rewards" && <span className="stab-count">{rewardCount}</span>}
          </button>
        ))}
      </div>

      {/* Skill Tree tab */}
      {tab === "tree" && (
        <div className="skill-stage" style={isMobile ? { gridTemplateColumns: "1fr", minHeight: "auto" } : undefined}>
          <SkillTreeView
            skills={skills}
            isMobile={isMobile}
            onSelectNode={setSelectedNode}
            selectedId={selectedNode?.id ?? null}
          />
          {selectedNode ? (
            <NodeDetail node={selectedNode} skills={skills} onClose={() => setSelectedNode(null)} />
          ) : (
            <div className="skill-drawer">
              <div className="drawer-empty">
                <div className="de-orb" />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-lo)" }}>
                  Selecciona un nodo
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Badges tab */}
      {tab === "badges" && <BadgesView badges={badges} />}

      {/* Rewards tab */}
      {tab === "rewards" && <RewardsView rewards={rewards} />}
    </div>
  );
}
