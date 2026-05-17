import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest, grantXp, serverError, checkRateLimit } from "@/src/lib/api-utils";
import { LogHabitSchema } from "@/src/lib/validations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const limited = await checkRateLimit(userId);
  if (limited) return limited;

  const { id } = await params;
  const body = await req.json();
  const parsed = LogHabitSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const habit = await prisma.habit.findUnique({ where: { id } });
  if (!habit || habit.userId !== userId) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const dateOnly = new Date(parsed.data.date + "T00:00:00.000Z");

  const existing = await prisma.habitLog.findUnique({
    where: { habitId_date: { habitId: id, date: dateOnly } },
  });

  // Una vez completado hoy, no se puede desmarcar
  if (existing?.completed && !parsed.data.completed) {
    return NextResponse.json(
      { error: "El habito ya fue completado hoy" },
      { status: 400 }
    );
  }

  let xpGranted = 0;

  if (existing) {
    await prisma.habitLog.update({
      where: { id: existing.id },
      data: { completed: parsed.data.completed },
    });
  } else {
    await prisma.habitLog.create({
      data: {
        habitId: id,
        date: dateOnly,
        completed: parsed.data.completed,
      },
    });
  }

  if (parsed.data.completed && (!existing || !existing.completed)) {
    xpGranted = await grantXp(userId, "habit");

    const logs = await prisma.habitLog.findMany({
      where: { habit: { userId }, completed: true },
      orderBy: { date: "desc" },
      select: { date: true },
    });

    const dates = [...new Set(logs.map((l) => l.date.toISOString().split("T")[0]))].sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (dates[i] === expected.toISOString().split("T")[0]) {
        streak++;
      } else break;
    }

    if (streak === 7) await grantXp(userId, "streak7");
    if (streak === 30) await grantXp(userId, "streak30");
  }

  return NextResponse.json({ ok: true, xpGranted });
  } catch (e) { console.error("[PATCH /api/habits/[id]/log]", e); return serverError(); }
}
