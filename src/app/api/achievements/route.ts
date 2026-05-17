import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, serverError, checkRateLimit } from "@/src/lib/api-utils";
import { SKILL_TREE } from "@/src/lib/gamification";

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

  const skillLevels = SKILL_TREE.map((node) => {
    const totalXp = xpByAction[node.xpSource] ?? 0;
    const xpPerLevel = 200;
    const level = Math.min(5, Math.floor(totalXp / xpPerLevel));
    const currentXp = totalXp - level * xpPerLevel;
    const xpToNext = level < 5 ? xpPerLevel : 0;

    return {
      ...node,
      level,
      currentXp: level < 5 ? currentXp : xpPerLevel,
      xpToNext,
      unlocked: level >= 5,
    };
  });

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

  const badges = [
    { id: "streak7", name: "Racha de 7 dias", desc: "Completa habitos 7 dias seguidos", unlocked: streakDays >= 7 },
    { id: "streak30", name: "Racha de 30 dias", desc: "Completa habitos 30 dias seguidos", unlocked: streakDays >= 30 },
    { id: "first-goal", name: "Primera meta", desc: "Completa tu primera meta", unlocked: goalsCompleted >= 1 },
    { id: "habits-100", name: "100 habitos", desc: "Completa 100 habitos", unlocked: habitsCompleted >= 100 },
    { id: "tasks-50", name: "50 tareas", desc: "Completa 50 tareas", unlocked: tasksDone >= 50 },
    { id: "journal-30", name: "30 entradas", desc: "Escribe 30 entradas de journal", unlocked: journalCount >= 30 },
    { id: "goals-5", name: "5 metas", desc: "Completa 5 metas", unlocked: goalsCompleted >= 5 },
    { id: "habits-10", name: "10 habitos/dia", desc: "Completa 10 habitos en un dia", unlocked: false },
  ];

  return NextResponse.json({
    skillTree: skillLevels,
    badges,
  });
  } catch (e) { console.error("[GET /api/achievements]", e); return serverError(); }
}
