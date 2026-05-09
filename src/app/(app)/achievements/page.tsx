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

const TABS: { key: Tab; label: string }[] = [
  { key: "tree", label: "Skill Tree" },
  { key: "badges", label: "Badges" },
  { key: "rewards", label: "Recompensas" },
];

const DEFAULT_BADGES: Badge[] = [
  { id: "streak7", name: "Racha de 7 dias", description: "Completa 7 dias seguidos", unlocked: false },
  { id: "first-goal", name: "Primera meta", description: "Completa tu primera meta", unlocked: false },
  { id: "habits100", name: "100 habitos", description: "Completa 100 habitos", unlocked: false },
  { id: "level10", name: "Nivel 10", description: "Alcanza el nivel 10", unlocked: false },
  { id: "streak30", name: "Racha de 30 dias", description: "Completa 30 dias seguidos", unlocked: false },
  { id: "tasks50", name: "50 tareas", description: "Completa 50 tareas", unlocked: false },
];

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

/* ─── Skill Tree SVG ─── */

function SkillTreeView({
  skills,
  isMobile,
  onSelectNode,
}: {
  skills: SkillProgress[];
  isMobile: boolean;
  onSelectNode: (node: SkillNode) => void;
}) {
  const svgW = 600;
  const svgH = 500;

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      style={{ width: "100%", maxWidth: isMobile ? "100%" : 600, height: "auto" }}
    >
      {/* Lines */}
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
          />
        );
      })}

      {/* Nodes */}
      {SKILL_TREE.map((node) => {
        const progress = getSkillLevel(skills, node.id);
        const level = progress?.level ?? 0;
        const cx = (node.x / 100) * svgW;
        const cy = (node.y / 100) * svgH;
        const r = isMobile ? 22 : 26;

        return (
          <g
            key={node.id}
            style={{ cursor: "pointer" }}
            onClick={() => onSelectNode(node)}
          >
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="var(--accent)"
              opacity={nodeBgOpacity(level)}
              stroke={nodeColor(level)}
              strokeWidth="1.5"
            />
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={nodeColor(level)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: isMobile ? 7 : 8,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {node.name}
            </text>
            <text
              x={cx}
              y={cy + 9}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={nodeColor(level)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: isMobile ? 7 : 8,
                opacity: 0.6,
              }}
            >
              Lv.{level}
            </text>
          </g>
        );
      })}
    </svg>
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
    <div
      className="card"
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 16,
            fontWeight: 700,
            color: "var(--text-hi)",
          }}
        >
          {node.name}
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-lo)",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
          }}
        >
          Cerrar
        </button>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <span className="badge badge-white">Nivel {level}</span>
        <span className="badge badge-dim">{node.xpSource}</span>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span className="t-label">XP actual</span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-mid)",
            }}
          >
            {currentXp} / {xpNext}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${xpNext > 0 ? (currentXp / xpNext) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div
        style={{
          padding: 12,
          borderRadius: "var(--radius-sm)",
          background: "var(--bg-raised)",
          border: "1px solid var(--border)",
        }}
      >
        <span className="t-label">Recompensa en Lv.5</span>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: 600,
            color: level >= 5 ? "var(--accent)" : "var(--text-lo)",
            marginTop: 4,
          }}
        >
          {level >= 5 ? "Desbloqueado" : ""} {node.rewardLabel}
        </div>
      </div>
    </div>
  );
}

/* ─── Badges Tab ─── */

function BadgesView({ badges }: { badges: Badge[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 12,
      }}
    >
      {badges.map((b) => (
        <TiltCard
          key={b.id}
          style={{
            padding: 16,
            opacity: b.unlocked ? 1 : 0.45,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
          max={12}
          scale={1.04}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: b.unlocked ? "var(--accent)" : "var(--bg-raised)",
              border: `1.5px solid ${b.unlocked ? "var(--accent)" : "var(--border-mid)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            {b.unlocked ? "★" : "?"}
          </div>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 600,
              color: b.unlocked ? "var(--text-hi)" : "var(--text-lo)",
            }}
          >
            {b.name}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-lo)",
              lineHeight: 1.5,
            }}
          >
            {b.description}
          </span>
          <span className={`badge ${b.unlocked ? "badge-white" : "badge-dim"}`}>
            {b.unlocked ? "Desbloqueado" : "Bloqueado"}
          </span>
        </TiltCard>
      ))}
    </div>
  );
}

/* ─── Rewards Tab ─── */

function RewardsView({ rewards }: { rewards: Reward[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rewards.map((r) => (
        <div
          key={r.skillId}
          className="card"
          style={{
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            opacity: r.unlocked ? 1 : 0.5,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                fontWeight: 600,
                color: r.unlocked ? "var(--text-hi)" : "var(--text-lo)",
              }}
            >
              {r.rewardLabel}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-lo)",
              }}
            >
              {r.skillName} &middot; Lv.5
            </span>
          </div>
          <span className={`badge ${r.unlocked ? "badge-white" : "badge-dim"}`}>
            {r.unlocked ? "Desbloqueado" : "Bloqueado"}
          </span>
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

  // API returns { skillTree: [...], badges: [...] } — map to expected shapes
  const skillTreeData = data?.skillTree ?? [];
  const skills: SkillProgress[] = (data?.skills ?? skillTreeData).map((s) => ({
    id: s.id,
    level: s.level,
    currentXp: s.currentXp,
  }));

  const badges: Badge[] = (data?.badges ?? DEFAULT_BADGES).map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description ?? (b as { desc?: string }).desc ?? "",
    unlocked: b.unlocked,
  }));

  const rewards: Reward[] =
    data?.rewards ??
    (skillTreeData.length > 0
      ? skillTreeData.map((s) => ({
          skillId: s.id,
          skillName: s.name ?? s.id,
          rewardLabel: s.rewardLabel ?? "",
          unlocked: s.unlocked ?? false,
        }))
      : SKILL_TREE.map((n) => ({
          skillId: n.id,
          skillName: n.name,
          rewardLabel: n.rewardLabel,
          unlocked: false,
        })));

  return (
    <div className="section-inner">
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--border)",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setSelectedNode(null);
            }}
            style={{
              background: "none",
              border: "none",
              borderBottom: tab === t.key ? "2px solid var(--accent)" : "2px solid transparent",
              padding: isMobile ? "10px 12px" : "10px 20px",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: tab === t.key ? "var(--text-hi)" : "var(--text-lo)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Skill Tree tab */}
      {tab === "tree" && (
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 16,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <SkillTreeView
              skills={skills}
              isMobile={isMobile}
              onSelectNode={setSelectedNode}
            />
          </div>
          {selectedNode && (
            <div style={{ width: isMobile ? "100%" : 280, flexShrink: 0 }}>
              <NodeDetail
                node={selectedNode}
                skills={skills}
                onClose={() => setSelectedNode(null)}
              />
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
