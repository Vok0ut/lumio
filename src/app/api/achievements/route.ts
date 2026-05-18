import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, serverError, checkRateLimit } from "@/src/lib/api-utils";
import { SKILL_TREE } from "@/src/lib/gamification";

const XP_PER_SKILL_LEVEL = 200;
const MAX_SKILL_LEVEL = 10;

export async function GET() {
  try {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const limited = await checkRateLimit(userId);
  if (limited) return limited;

  const xpLogs = await prisma.xpLog.findMany({
    where: { userId },
    select: { action: true, xp: true },
  });

  const xpByAction: Record<string, number> = {};
  for (const log of xpLogs) {
    xpByAction[log.action] = (xpByAction[log.action] ?? 0) + log.xp;
  }

  // Existing skill badges (UserBadge table)
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: { skillId: true, tier: true, equipped: true, earnedAt: true },
  });
  const badgeMap = new Map<string, { tiers: Set<string>; equipped: { silver: boolean; gold: boolean } }>();
  for (const b of userBadges) {
    if (!badgeMap.has(b.skillId)) {
      badgeMap.set(b.skillId, { tiers: new Set(), equipped: { silver: false, gold: false } });
    }
    badgeMap.get(b.skillId)!.tiers.add(b.tier);
    if (b.equipped) badgeMap.get(b.skillId)!.equipped[b.tier as "silver" | "gold"] = true;
  }

  // Compute skill levels + auto-award new badges
  const newBadgesToCreate: Array<{ userId: string; skillId: string; tier: string }> = [];

  const skillTree = SKILL_TREE.map((node) => {
    const totalXp = xpByAction[node.xpSource] ?? 0;
    const level = Math.min(MAX_SKILL_LEVEL, Math.floor(totalXp / XP_PER_SKILL_LEVEL));
    const currentXp = totalXp % XP_PER_SKILL_LEVEL;
    const xpToNext = level < MAX_SKILL_LEVEL ? XP_PER_SKILL_LEVEL : 0;

    const existing = badgeMap.get(node.id);

    // Queue badge grants if earned but not yet in DB
    if (level >= 5 && !existing?.tiers.has("silver")) {
      newBadgesToCreate.push({ userId, skillId: node.id, tier: "silver" });
    }
    if (level >= 10 && !existing?.tiers.has("gold")) {
      newBadgesToCreate.push({ userId, skillId: node.id, tier: "gold" });
    }

    return {
      ...node,
      level,
      currentXp: level < MAX_SKILL_LEVEL ? currentXp : XP_PER_SKILL_LEVEL,
      xpToNext,
      unlocked: level >= MAX_SKILL_LEVEL,
      badges: {
        silver: (existing?.tiers.has("silver") || level >= 5) ? {
          equipped: existing?.equipped.silver ?? false,
        } : null,
        gold: (existing?.tiers.has("gold") || level >= 10) ? {
          equipped: existing?.equipped.gold ?? false,
        } : null,
      },
    };
  });

  // Persist newly earned badges
  if (newBadgesToCreate.length > 0) {
    await prisma.userBadge.createMany({
      data: newBadgesToCreate,
      skipDuplicates: true,
    });
  }

  const [habitsCompleted, tasksDone, goalsCompleted, streakDays, journalCount] =
    await Promise.all([
      prisma.habitLog.count({ where: { habit: { userId }, completed: true } }),
      prisma.task.count({ where: { userId, status: "DONE" } }),
      prisma.goal.count({ where: { userId, progress: 100 } }),
      prisma.habitLog
        .findMany({
          where: { habit: { userId }, completed: true },
          orderBy: { date: "desc" },
          select: { date: true },
          distinct: ["date"],
        })
        .then((logs) => {
          let streak = 0;
          const today = new Date();
          const dates = logs.map((l) => l.date.toISOString().split("T")[0]);
          for (let i = 0; i < dates.length; i++) {
            const expected = new Date(today);
            expected.setDate(today.getDate() - i);
            if (dates[i] === expected.toISOString().split("T")[0]) streak++;
            else break;
          }
          return streak;
        }),
      prisma.journalEntry.count({ where: { userId } }),
    ]);

  const achievementBadges = [
    { id: "streak7",    name: "Racha de 7 dias",   desc: "Completa habitos 7 dias seguidos",    unlocked: streakDays >= 7 },
    { id: "streak30",   name: "Racha de 30 dias",  desc: "Completa habitos 30 dias seguidos",   unlocked: streakDays >= 30 },
    { id: "first-goal", name: "Primera meta",      desc: "Completa tu primera meta",            unlocked: goalsCompleted >= 1 },
    { id: "habits-100", name: "100 habitos",        desc: "Completa 100 habitos",                unlocked: habitsCompleted >= 100 },
    { id: "tasks-50",   name: "50 tareas",          desc: "Completa 50 tareas",                  unlocked: tasksDone >= 50 },
    { id: "journal-30", name: "30 entradas",        desc: "Escribe 30 entradas de journal",      unlocked: journalCount >= 30 },
    { id: "goals-5",    name: "5 metas",            desc: "Completa 5 metas",                   unlocked: goalsCompleted >= 5 },
    { id: "habits-10",  name: "10 habitos/dia",     desc: "Completa 10 habitos en un dia",       unlocked: false },
  ];

  // Equipped skill badges (for profile display)
  const equippedBadges = userBadges
    .filter((b) => b.equipped)
    .map((b) => ({
      skillId: b.skillId,
      tier: b.tier,
      skillName: SKILL_TREE.find((n) => n.id === b.skillId)?.name ?? b.skillId,
    }));

  return NextResponse.json({
    skillTree,
    badges: achievementBadges,
    equippedBadges,
  });
  } catch (e) { console.error("[GET /api/achievements]", e); return serverError(); }
}
