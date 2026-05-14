import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest } from "@/src/lib/api-utils";
import { CreateHabitSchema } from "@/src/lib/validations";
import { FREE_LIMITS } from "@/src/lib/plans";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const twentyEightDaysAgo = new Date();
  twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      logs: {
        where: { date: { gte: twentyEightDaysAgo } },
        orderBy: { date: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = habits.map((habit) => {
    const completedDates = habit.logs
      .filter((l) => l.completed)
      .map((l) => l.date.toISOString().split("T")[0]);

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      if (completedDates.includes(key)) {
        streak++;
      } else {
        break;
      }
    }

    return {
      id: habit.id,
      name: habit.name,
      target: habit.target,
      category: habit.category,
      streak,
      completedDates,
      todayCompleted: completedDates.includes(
        new Date().toISOString().split("T")[0]
      ),
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const parsed = CreateHabitSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  // Límite FREE
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
  if (user?.plan !== "PREMIUM") {
    const count = await prisma.habit.count({ where: { userId } });
    if (count >= FREE_LIMITS.maxHabits) {
      return NextResponse.json(
        { error: `El plan gratuito permite maximo ${FREE_LIMITS.maxHabits} habitos. Actualiza a Premium para crear mas.` },
        { status: 403 }
      );
    }
  }

  const habit = await prisma.habit.create({
    data: {
      userId,
      name: parsed.data.name,
      target: parsed.data.target,
      category: parsed.data.category,
    },
  });

  return NextResponse.json(habit, { status: 201 });
}
