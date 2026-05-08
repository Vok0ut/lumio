import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized } from "@/src/lib/api-utils";
import { getLevelFromXP, getRankForLevel } from "@/src/lib/gamification";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      totalXp: true,
      createdAt: true,
    },
  });

  if (!user) return unauthorized();

  const { level, currentLevelXP, xpToNextLevel } = getLevelFromXP(user.totalXp);
  const rank = getRankForLevel(level);

  const [habitsCompleted, tasksDone, journalEntries, goalsCompleted, recentXpLogs] =
    await Promise.all([
      prisma.habitLog.count({
        where: { habit: { userId }, completed: true },
      }),
      prisma.task.count({ where: { userId, status: "DONE" } }),
      prisma.journalEntry.count({ where: { userId } }),
      prisma.goal.count({ where: { userId, progress: 100 } }),
      prisma.xpLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { action: true, xp: true, createdAt: true },
      }),
    ]);

  return NextResponse.json({
    email: user.email,
    name: user.name,
    totalXp: user.totalXp,
    level,
    currentLevelXP,
    xpToNextLevel,
    rank: { name: rank.name, discount: rank.discount },
    stats: {
      habitsCompleted,
      tasksDone,
      journalEntries,
      goalsCompleted,
    },
    recentXpLogs,
    createdAt: user.createdAt,
  });
}
