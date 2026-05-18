import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest, serverError, checkRateLimit } from "@/src/lib/api-utils";
import { getLevelFromXP, getRankForLevel } from "@/src/lib/gamification";
import { UpdateProfileSchema } from "@/src/lib/validations";

export async function GET() {
  try {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const limited = await checkRateLimit(userId);
  if (limited) return limited;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      plan: true,
      totalXp: true,
      themeColors: true,
      createdAt: true,
    },
  });

  if (!user) return unauthorized();

  const { level, currentLevelXP, xpToNextLevel } = getLevelFromXP(user.totalXp);
  const rank = getRankForLevel(level);

  // Developer / Dev Premium detection
  const DEVELOPER_EMAIL = "enolpm2008@gmail.com";
  const isDeveloper = user.email === DEVELOPER_EMAIL;
  let isDevPremium = false;
  if (user.plan === "PREMIUM" && !isDeveloper) {
    // Check if they got premium through a dev code
    const devCodeUsed = await prisma.devCode.findFirst({
      where: { usedBy: user.email },
    });
    isDevPremium = !!devCodeUsed;
  }

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
    image: user.image,
    plan: user.plan,
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
    isDeveloper,
    isDevPremium,
    themeColors: user.themeColors ? JSON.parse(user.themeColors) : null,
  });
  } catch (e) { console.error("[GET /api/user/me]", e); return serverError(); }
}

export async function PATCH(req: NextRequest) {
  try {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const limited = await checkRateLimit(userId);
  if (limited) return limited;

  const body = await req.json();
  const parsed = UpdateProfileSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const data: { name?: string; image?: string } = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.image !== undefined) data.image = parsed.data.image;

  if (Object.keys(data).length === 0) {
    return badRequest("No hay datos para actualizar");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    select: { name: true, image: true },
    data,
  });

  return NextResponse.json(updated);
  } catch (e) { console.error("[PATCH /api/user/me]", e); return serverError(); }
}
