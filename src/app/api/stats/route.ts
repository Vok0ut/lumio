import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, serverError, checkRateLimit } from "@/src/lib/api-utils";

export async function GET() {
  try {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const limited = await checkRateLimit(userId);
  if (limited) return limited;

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [habits, habitLogs, tasksDone, xpLogs, allHabitLogs30] = await Promise.all([
    prisma.habit.count({ where: { userId } }),
    prisma.habitLog.findMany({
      where: {
        habit: { userId },
        date: { gte: sevenDaysAgo },
      },
      select: { date: true, completed: true },
    }),
    prisma.task.count({
      where: { userId, status: "DONE" },
    }),
    prisma.xpLog.findMany({
      where: { userId, createdAt: { gte: sevenDaysAgo } },
      select: { xp: true, createdAt: true },
    }),
    prisma.habitLog.findMany({
      where: {
        habit: { userId },
        date: { gte: thirtyDaysAgo },
        completed: true,
      },
      select: { date: true },
    }),
  ]);

  const totalLogs = habitLogs.length;
  const completedLogs = habitLogs.filter((l) => l.completed).length;
  const habitRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

  const weeklyXp = xpLogs.reduce((sum, l) => sum + l.xp, 0);

  const dailyHabits: number[] = [];
  const dailyXp: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().split("T")[0];

    dailyHabits.push(
      habitLogs.filter(
        (l) => l.completed && l.date.toISOString().split("T")[0] === key
      ).length
    );

    dailyXp.push(
      xpLogs
        .filter((l) => l.createdAt.toISOString().split("T")[0] === key)
        .reduce((s, l) => s + l.xp, 0)
    );
  }

  let currentStreak = 0;
  const uniqueDates = [
    ...new Set(
      allHabitLogs30.map((l) => l.date.toISOString().split("T")[0])
    ),
  ].sort().reverse();

  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = new Date(now);
    expected.setDate(now.getDate() - i);
    if (uniqueDates[i] === expected.toISOString().split("T")[0]) {
      currentStreak++;
    } else break;
  }

  const monthlyActivity: number[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().split("T")[0];
    monthlyActivity.push(
      allHabitLogs30.filter(
        (l) => l.date.toISOString().split("T")[0] === key
      ).length
    );
  }

  return NextResponse.json({
    habitRate,
    tasksCompleted: tasksDone,
    weeklyXp,
    currentStreak,
    dailyHabits,
    dailyXp,
    monthlyActivity,
    totalHabits: habits,
  });
  } catch (e) { console.error("[GET /api/stats]", e); return serverError(); }
}
