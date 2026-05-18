"use client";

import { useEffect, useState, useCallback } from "react";
import { SKILL_TREE, type SkillNode } from "@/src/lib/gamification";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { TiltCard } from "@/src/components/ui/tilt-card";
import { usePlan } from "@/src/hooks/use-plan";
import { PremiumWall } from "@/src/components/ui/premium-wall";

type Tab = "tree" | "badges" | "rewards" | "skillbadges";

const MAX_LEVEL = 10;
const XP_PER_LEVEL = 200;

interface SkillProgress {
  id: string;
  level: number;
  currentXp: number;
  xpToNext: number;
  unlocked: boolean;
  badges: {
    silver: { equipped: boolean } | null;
    gold: { equipped: boolean } | null;
  };
}

interface AchievementBadge {
  id: string;
  name: string;
  desc: string;
  unlocked: boolean;
}

interface EquippedBadge {
  skillId: string;
  tier: string;
  skillName: string;
}

interface ApiResponse {
  skillTree: SkillProgress[];
  badges: AchievementBadge[];
  equippedBadges: EquippedBadge[];
}

const TABS: { key: Tab; label: string }[] = [
  { key: "tree",        label: "Skill Tree" },
  { key: "skillbadges", label: "Insignias" },
  { key: "badges",      label: "Logros" },
  { key: "rewards",     label: "Rewards" },
];

const BADGE_ICONS = ["★", "✦", "◆", "⬡", "✧", "↯", "⟐", "⬟"];

/* ── helpers ─────────────────────────────────── */

function nodeColor(level: number): string {
  if (level === 0) return "var(--text-lo)";
  if (level < 5)   return "var(--text-mid)";
  if (level < 10)  return "var(--xp)";
  return "#fff";
}

function nodeFill(level: number): string {
  if (level === 0)  return "rgba(255,255,255,0.04)";
  if (level < 5)   return "rgba(255,255,255,0.10)";
  if (level < 10)  return "var(--xp-lo)";
  return "rgba(196,145,58,0.22)";
}

function nodeStroke(level: number, selected: boolean): string {
  if (selected)    return "var(--xp)";
  if (level === 0) return "var(--border)";
  if (level < 5)   return "var(--border-mid)";
  if (level < 10)  return "var(--xp-mid)";
  return "var(--xp)";
}

/* ── Starfield ─────────────────────────────── */

function Starfield() {
  const stars = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: `${(i * 37.3) % 100}%`,
    top: `${(i * 53.7) % 100}%`,
    delay: `${(i * 0.4) % 3}s`,
    size: 1 + (i % 3) * 0.5,
  }));
  return (
    <div className="starfield" style={{ borderRadius: "var(--radius-lg)" }}>
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

/* ── Skill Tree SVG ─────────────────────────── */

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
  const svgW = 900;
  const svgH = 720;
  const R = isMobile ? 34 : 42;

  const getSkill = (id: string) => skills.find((s) => s.id === id);

  return (
    <div style={{
      position: "relative",
      overflowX: "auto",
      overflowY: "auto",
      maxHeight: isMobile ? 400 : 560,
      borderRadius: "var(--radius-lg)",
      border: "1px solid var(--border)",
      background: "rgba(255,255,255,0.015)",
    }}>
      <Starfield />
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{
          width: isMobile ? 680 : "100%",
          minWidth: isMobile ? 680 : undefined,
          height: "auto",
          display: "block",
        }}
      >
        {/* Edge lines */}
        {SKILL_TREE.filter((n) => n.parent).map((node) => {
          const parent = SKILL_TREE.find((p) => p.id === node.parent)!;
          const skill = getSkill(node.id);
          const parentSkill = getSkill(parent.id);
          const lit = (skill?.level ?? 0) > 0 && (parentSkill?.level ?? 0) > 0;
          return (
            <line
              key={`${node.parent}-${node.id}`}
              x1={(parent.x / 100) * svgW}
              y1={(parent.y / 100) * svgH}
              x2={(node.x / 100) * svgW}
              y2={(node.y / 100) * svgH}
              stroke={lit ? "var(--xp-mid)" : "var(--border)"}
              strokeWidth={lit ? 2 : 1.5}
              strokeDasharray={lit ? "none" : "10 8"}
              opacity={lit ? 0.7 : 0.4}
            />
          );
        })}

        {/* Nodes */}
        {SKILL_TREE.map((node) => {
          const skill = getSkill(node.id);
          const level = skill?.level ?? 0;
          const currentXp = skill?.currentXp ?? 0;
          const xpToNext = skill?.xpToNext ?? XP_PER_LEVEL;
          const cx = (node.x / 100) * svgW;
          const cy = (node.y / 100) * svgH;
          const isSelected = selectedId === node.id;
          const hasSilver = skill?.badges?.silver != null;
          const hasGold = skill?.badges?.gold != null;

          // XP ring arc
          const pct = xpToNext > 0 ? currentXp / xpToNext : (level >= MAX_LEVEL ? 1 : 0);
          const arcR = R + 7;
          const circ = 2 * Math.PI * arcR;
          const dash = pct * circ;

          return (
            <g
              key={node.id}
              style={{ cursor: "pointer" }}
              onClick={() => onSelectNode(node)}
            >
              {/* Glow for selected */}
              {isSelected && (
                <circle cx={cx} cy={cy} r={R + 14}
                  fill="var(--xp-lo)" stroke="var(--xp-mid)" strokeWidth="1" opacity="0.6" />
              )}

              {/* XP progress ring */}
              {level > 0 && level < MAX_LEVEL && (
                <>
                  <circle cx={cx} cy={cy} r={arcR} fill="none"
                    stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle cx={cx} cy={cy} r={arcR} fill="none"
                    stroke="var(--xp)" strokeWidth="3"
                    strokeDasharray={`${dash} ${circ - dash}`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${cx} ${cy})`}
                    opacity="0.8"
                  />
                </>
              )}

              {/* Completed glow ring */}
              {level >= MAX_LEVEL && (
                <circle cx={cx} cy={cy} r={R + 8} fill="none"
                  stroke="var(--xp)" strokeWidth="1.5" opacity="0.4"
                  className="avail-ring" />
              )}

              {/* Main circle */}
              <circle
                cx={cx} cy={cy} r={R}
                fill={nodeFill(level)}
                stroke={nodeStroke(level, isSelected)}
                strokeWidth={isSelected ? 2.5 : 1.5}
              />

              {/* Level number */}
              <text
                x={cx} y={cy - (isMobile ? 5 : 6)}
                textAnchor="middle" dominantBaseline="middle"
                fill={nodeColor(level)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: isMobile ? 8 : 9,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {node.name}
              </text>
              <text
                x={cx} y={cy + (isMobile ? 8 : 10)}
                textAnchor="middle" dominantBaseline="middle"
                fill={nodeColor(level)}
                style={{ fontFamily: "var(--font-mono)", fontSize: isMobile ? 8 : 10, opacity: 0.75 }}
              >
                {level >= MAX_LEVEL ? "MAX" : `Lv.${level}`}
              </text>

              {/* Badge indicators */}
              {(hasSilver || hasGold) && (
                <g>
                  {hasSilver && (
                    <circle cx={cx + R - 6} cy={cy - R + 6} r={8}
                      fill="#aaa" stroke="#fff" strokeWidth="1" opacity="0.9" />
                  )}
                  {hasGold && (
                    <circle cx={cx + R - (hasSilver ? 18 : 6)} cy={cy - R + 6} r={8}
                      fill="var(--xp)" stroke="#fff" strokeWidth="1" opacity="0.9" />
                  )}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Node Detail Panel ──────────────────────── */

function NodeDetail({
  node,
  skill,
  onClose,
  onEquipToggle,
  equippedCount,
}: {
  node: SkillNode;
  skill: SkillProgress | undefined;
  onClose: () => void;
  onEquipToggle: (skillId: string, tier: "silver" | "gold", equipped: boolean) => void;
  equippedCount: number;
}) {
  const level = skill?.level ?? 0;
  const currentXp = skill?.currentXp ?? 0;
  const xpToNext = skill?.xpToNext ?? XP_PER_LEVEL;
  const hasSilver = skill?.badges?.silver != null;
  const hasGold = skill?.badges?.gold != null;
  const silverEquipped = skill?.badges?.silver?.equipped ?? false;
  const goldEquipped = skill?.badges?.gold?.equipped ?? false;

  return (
    <div className="skill-drawer open" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="drawer-head">
        <div>
          <span className="t-label">{node.xpSource}</span>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 18, fontWeight: 600, color: "var(--text-hi)", marginTop: 2 }}>
            {node.name}
          </div>
        </div>
        <button className="drawer-close" onClick={onClose} style={{
          background: "none", border: "none", color: "var(--text-lo)", fontSize: 20,
          cursor: "pointer", padding: 4, lineHeight: 1,
        }}>✕</button>
      </div>

      {/* Level display */}
      <div style={{ display: "flex", gap: 12 }}>
        <div className="dg-item" style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
          <span className="t-label">Nivel</span>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 24, fontWeight: 700, color: level >= MAX_LEVEL ? "var(--xp)" : "var(--text-hi)", marginTop: 2 }}>
            {level >= MAX_LEVEL ? "MAX" : level}
            <span style={{ fontSize: 12, color: "var(--text-lo)", fontFamily: "var(--font-mono)", marginLeft: 4 }}>/ {MAX_LEVEL}</span>
          </div>
        </div>
        <div className="dg-item" style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
          <span className="t-label">XP acumulada</span>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 24, fontWeight: 700, color: "var(--text-hi)", marginTop: 2 }}>
            {currentXp}
          </div>
        </div>
      </div>

      {/* XP progress */}
      {level < MAX_LEVEL && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span className="t-label">Progreso al nivel {level + 1}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mid)" }}>
              {currentXp} / {xpToNext} XP
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${xpToNext > 0 ? (currentXp / xpToNext) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      {/* Badge milestones */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="t-label">Insignias de habilidad</span>

        {/* Silver */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          background: hasSilver ? "rgba(170,170,170,0.08)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${hasSilver ? "rgba(170,170,170,0.3)" : "var(--border)"}`,
          borderRadius: "var(--radius-md)", padding: "10px 14px",
          opacity: hasSilver ? 1 : 0.5,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: hasSilver ? "#aaa" : "rgba(255,255,255,0.05)",
            border: "2px solid",
            borderColor: hasSilver ? "#ccc" : "var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, flexShrink: 0,
          }}>
            {hasSilver ? "⬡" : "?"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: hasSilver ? "#ccc" : "var(--text-lo)", fontFamily: "var(--font-sans)" }}>
              Insignia Plata
            </div>
            <div style={{ fontSize: 10, color: "var(--text-lo)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
              {hasSilver ? "Desbloqueada en Lv.5" : `Requiere Lv.5 (${Math.max(0, 5 - level)} niveles)`}
            </div>
          </div>
          {hasSilver && (
            <button
              onClick={() => onEquipToggle(node.id, "silver", !silverEquipped)}
              disabled={!silverEquipped && equippedCount >= 3}
              style={{
                padding: "5px 12px",
                background: silverEquipped ? "rgba(170,170,170,0.2)" : "transparent",
                border: `1px solid ${silverEquipped ? "#aaa" : "var(--border-mid)"}`,
                borderRadius: "var(--radius-sm)",
                color: silverEquipped ? "#ccc" : "var(--text-mid)",
                fontSize: 10, fontFamily: "var(--font-mono)", cursor: "pointer",
                opacity: !silverEquipped && equippedCount >= 3 ? 0.4 : 1,
              }}
            >
              {silverEquipped ? "Equipada" : "Equipar"}
            </button>
          )}
        </div>

        {/* Gold */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          background: hasGold ? "var(--xp-lo)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${hasGold ? "var(--xp-mid)" : "var(--border)"}`,
          borderRadius: "var(--radius-md)", padding: "10px 14px",
          opacity: hasGold ? 1 : 0.5,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: hasGold ? "var(--xp-lo)" : "rgba(255,255,255,0.05)",
            border: "2px solid",
            borderColor: hasGold ? "var(--xp)" : "var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, flexShrink: 0, color: hasGold ? "var(--xp)" : "var(--text-lo)",
          }}>
            {hasGold ? "★" : "?"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: hasGold ? "var(--xp)" : "var(--text-lo)", fontFamily: "var(--font-sans)" }}>
              Insignia Oro
            </div>
            <div style={{ fontSize: 10, color: "var(--text-lo)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
              {hasGold ? "Desbloqueada en Lv.10" : `Requiere Lv.10 (${Math.max(0, 10 - level)} niveles)`}
            </div>
          </div>
          {hasGold && (
            <button
              onClick={() => onEquipToggle(node.id, "gold", !goldEquipped)}
              disabled={!goldEquipped && equippedCount >= 3}
              style={{
                padding: "5px 12px",
                background: goldEquipped ? "var(--xp-lo)" : "transparent",
                border: `1px solid ${goldEquipped ? "var(--xp)" : "var(--border-mid)"}`,
                borderRadius: "var(--radius-sm)",
                color: goldEquipped ? "var(--xp)" : "var(--text-mid)",
                fontSize: 10, fontFamily: "var(--font-mono)", cursor: "pointer",
                opacity: !goldEquipped && equippedCount >= 3 ? 0.4 : 1,
              }}
            >
              {goldEquipped ? "Equipada" : "Equipar"}
            </button>
          )}
        </div>
      </div>

      {/* Reward */}
      <div style={{
        background: level >= MAX_LEVEL ? "rgba(196,145,58,0.06)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${level >= MAX_LEVEL ? "var(--xp-mid)" : "var(--border)"}`,
        borderRadius: "var(--radius-md)", padding: "12px 16px",
      }}>
        <span className="t-label">Recompensa en Lv.{MAX_LEVEL}</span>
        <div style={{
          fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
          color: level >= MAX_LEVEL ? "var(--xp)" : "var(--text-lo)", marginTop: 6,
        }}>
          {level >= MAX_LEVEL ? "✓ " : "🔒 "}{node.rewardLabel}
        </div>
      </div>
    </div>
  );
}

/* ── Skill Badges Tab ───────────────────────── */

function SkillBadgesView({
  skills,
  equippedBadges,
  onEquipToggle,
}: {
  skills: SkillProgress[];
  equippedBadges: EquippedBadge[];
  onEquipToggle: (skillId: string, tier: "silver" | "gold", equipped: boolean) => void;
}) {
  const equippedCount = equippedBadges.length;
  const earnedBadges: Array<{ skillId: string; skillName: string; tier: "silver" | "gold"; equipped: boolean }> = [];

  for (const skill of skills) {
    const node = SKILL_TREE.find((n) => n.id === skill.id);
    if (!node) continue;
    if (skill.badges.silver) {
      earnedBadges.push({ skillId: skill.id, skillName: node.name, tier: "silver", equipped: skill.badges.silver.equipped });
    }
    if (skill.badges.gold) {
      earnedBadges.push({ skillId: skill.id, skillName: node.name, tier: "gold", equipped: skill.badges.gold.equipped });
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Equipped slots */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span className="t-label">Insignias equipadas</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-lo)" }}>
            {equippedCount}/3 slots
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {[0, 1, 2].map((i) => {
            const b = equippedBadges[i];
            return (
              <div key={i} style={{
                flex: 1, minHeight: 72, borderRadius: "var(--radius-md)",
                border: `1px solid ${b ? (b.tier === "gold" ? "var(--xp-mid)" : "rgba(170,170,170,0.3)") : "var(--border)"}`,
                background: b ? (b.tier === "gold" ? "var(--xp-lo)" : "rgba(170,170,170,0.06)") : "rgba(255,255,255,0.02)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                padding: 8,
              }}>
                {b ? (
                  <>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: b.tier === "gold" ? "var(--xp-lo)" : "rgba(170,170,170,0.15)",
                      border: `2px solid ${b.tier === "gold" ? "var(--xp)" : "#aaa"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, color: b.tier === "gold" ? "var(--xp)" : "#ccc",
                    }}>
                      {b.tier === "gold" ? "★" : "⬡"}
                    </div>
                    <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--text-lo)", textAlign: "center", lineHeight: 1.3 }}>
                      {b.skillName}
                    </span>
                    <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: b.tier === "gold" ? "var(--xp)" : "#aaa" }}>
                      {b.tier === "gold" ? "ORO" : "PLATA"}
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: 10, color: "var(--text-lo)", fontFamily: "var(--font-mono)" }}>vacío</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* All earned badges */}
      {earnedBadges.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-lo)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
          Sube habilidades al Lv.5 o Lv.10 para ganar insignias
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="t-label" style={{ marginBottom: 4 }}>Todas las insignias ({earnedBadges.length})</span>
          {earnedBadges.map((b) => (
            <div key={`${b.skillId}-${b.tier}`} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: b.equipped
                ? (b.tier === "gold" ? "var(--xp-lo)" : "rgba(170,170,170,0.06)")
                : "rgba(255,255,255,0.02)",
              border: `1px solid ${b.equipped
                ? (b.tier === "gold" ? "var(--xp-mid)" : "rgba(170,170,170,0.3)")
                : "var(--border)"}`,
              borderRadius: "var(--radius-md)", padding: "10px 14px",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: b.tier === "gold" ? "var(--xp-lo)" : "rgba(170,170,170,0.1)",
                border: `2px solid ${b.tier === "gold" ? "var(--xp)" : "#aaa"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, color: b.tier === "gold" ? "var(--xp)" : "#ccc",
              }}>
                {b.tier === "gold" ? "★" : "⬡"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 12, fontWeight: 600,
                  color: b.tier === "gold" ? "var(--xp)" : "#ccc",
                  fontFamily: "var(--font-sans)",
                }}>
                  Insignia {b.tier === "gold" ? "Oro" : "Plata"} — {b.skillName}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-lo)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                  {b.tier === "gold" ? "Maestra completa (Lv.10)" : "Experto (Lv.5)"}
                </div>
              </div>
              <button
                onClick={() => onEquipToggle(b.skillId, b.tier as "silver" | "gold", !b.equipped)}
                disabled={!b.equipped && equippedCount >= 3}
                style={{
                  padding: "5px 12px",
                  background: b.equipped
                    ? (b.tier === "gold" ? "var(--xp-lo)" : "rgba(170,170,170,0.15)")
                    : "transparent",
                  border: `1px solid ${b.equipped
                    ? (b.tier === "gold" ? "var(--xp)" : "#aaa")
                    : "var(--border-mid)"}`,
                  borderRadius: "var(--radius-sm)", fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  color: b.equipped ? (b.tier === "gold" ? "var(--xp)" : "#ccc") : "var(--text-mid)",
                  cursor: "pointer",
                  opacity: !b.equipped && equippedCount >= 3 ? 0.4 : 1,
                  flexShrink: 0,
                }}
              >
                {b.equipped ? "Quitar" : "Equipar"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Achievement Badges Tab ─────────────────── */

function BadgesView({ badges }: { badges: AchievementBadge[] }) {
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
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-lo)", lineHeight: 1.5 }}>
              {b.desc}
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

/* ── Rewards Tab ─────────────────────────────── */

function RewardsView({ skills }: { skills: SkillProgress[] }) {
  return (
    <div className="rewards-list">
      {SKILL_TREE.map((node) => {
        const skill = skills.find((s) => s.id === node.id);
        const unlocked = (skill?.level ?? 0) >= MAX_LEVEL;
        return (
          <div key={node.id} className={`reward ${unlocked ? "owned" : ""}`}>
            <div className="reward-icon">{unlocked ? "★" : "?"}</div>
            <div style={{ flex: 1 }}>
              <div className="reward-name">{node.rewardLabel}</div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-lo)" }}>
                {node.name} · Lv.{MAX_LEVEL}
              </span>
            </div>
            <span className={`badge ${unlocked ? "badge-xp" : "badge-dim"}`}>
              {unlocked ? "Desbloqueado" : `Lv.${skill?.level ?? 0}/${MAX_LEVEL}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main Page ───────────────────────────────── */

export default function AchievementsPage() {
  const isMobile = useIsMobile();
  const { isPremium, loading: planLoading } = usePlan();
  const [tab, setTab] = useState<Tab>("tree");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

  const loadData = useCallback(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((d: ApiResponse) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleEquipToggle = useCallback(async (skillId: string, tier: "silver" | "gold", equipped: boolean) => {
    // Optimistic update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        skillTree: prev.skillTree.map((s) => {
          if (s.id !== skillId) return s;
          return {
            ...s,
            badges: {
              ...s.badges,
              [tier]: s.badges[tier] ? { ...s.badges[tier], equipped } : null,
            },
          };
        }),
        equippedBadges: equipped
          ? [...prev.equippedBadges, { skillId, tier, skillName: SKILL_TREE.find((n) => n.id === skillId)?.name ?? skillId }]
          : prev.equippedBadges.filter((b) => !(b.skillId === skillId && b.tier === tier)),
      };
    });

    const res = await fetch("/api/achievements/badges", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillId, tier, equipped }),
    });

    if (!res.ok) {
      // Revert on error
      loadData();
    }
  }, [loadData]);

  if (loading) {
    return (
      <div className="section-inner">
        <span className="t-label" style={{ textAlign: "center", paddingTop: 48 }}>Cargando logros...</span>
      </div>
    );
  }

  if (!planLoading && !isPremium) {
    return <PremiumWall feature="Logros y Arbol de Habilidades" />;
  }

  const skills = data?.skillTree ?? [];
  const badges = data?.badges ?? [];
  const equippedBadges = data?.equippedBadges ?? [];
  const equippedCount = equippedBadges.length;

  const badgeCount = badges.filter((b) => b.unlocked).length;
  const skillBadgeCount = skills.reduce((n, s) =>
    n + (s.badges.silver ? 1 : 0) + (s.badges.gold ? 1 : 0), 0);

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
          <span className="badge badge-xp">{equippedCount}/3 equipadas</span>
          <span className="badge badge-dim">{badgeCount}/{badges.length} logros</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="skill-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`stab ${tab === t.key ? "on" : ""}`}
            onClick={() => { setTab(t.key); setSelectedNode(null); }}
          >
            {t.label}
            {t.key === "skillbadges" && skillBadgeCount > 0 && (
              <span className="stab-count">{skillBadgeCount}</span>
            )}
            {t.key === "badges" && (
              <span className="stab-count">{badgeCount}/{badges.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Skill Tree */}
      {tab === "tree" && (
        <div className="skill-stage" style={isMobile ? { gridTemplateColumns: "1fr", minHeight: "auto" } : undefined}>
          <SkillTreeView
            skills={skills}
            isMobile={isMobile}
            onSelectNode={setSelectedNode}
            selectedId={selectedNode?.id ?? null}
          />
          {selectedNode ? (
            <NodeDetail
              node={selectedNode}
              skill={skills.find((s) => s.id === selectedNode.id)}
              onClose={() => setSelectedNode(null)}
              onEquipToggle={handleEquipToggle}
              equippedCount={equippedCount}
            />
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

      {tab === "skillbadges" && (
        <SkillBadgesView
          skills={skills}
          equippedBadges={equippedBadges}
          onEquipToggle={handleEquipToggle}
        />
      )}

      {tab === "badges" && <BadgesView badges={badges} />}
      {tab === "rewards" && <RewardsView skills={skills} />}
    </div>
  );
}
