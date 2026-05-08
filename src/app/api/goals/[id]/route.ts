import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest, grantXp } from "@/src/lib/api-utils";
import { UpdateGoalSchema } from "@/src/lib/validations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateGoalSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const goal = await prisma.goal.findUnique({
    where: { id },
    include: { milestones: true },
  });
  if (!goal || goal.userId !== userId) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  let xpGranted = 0;

  if (parsed.data.milestones) {
    for (const m of parsed.data.milestones) {
      if (m.id) {
        await prisma.milestone.update({
          where: { id: m.id },
          data: { label: m.label, done: m.done, order: m.order },
        });
      } else {
        await prisma.milestone.create({
          data: { goalId: id, label: m.label, done: m.done, order: m.order },
        });
      }
    }

    const updatedMilestones = await prisma.milestone.findMany({
      where: { goalId: id },
    });
    const total = updatedMilestones.length;
    const done = updatedMilestones.filter((m) => m.done).length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    await prisma.goal.update({
      where: { id },
      data: { progress },
    });

    if (progress === 100 && goal.progress < 100) {
      xpGranted = await grantXp(userId, "goal");
    }
  }

  if (parsed.data.progress !== undefined) {
    await prisma.goal.update({
      where: { id },
      data: { progress: parsed.data.progress },
    });

    if (parsed.data.progress === 100 && goal.progress < 100) {
      xpGranted = await grantXp(userId, "goal");
    }
  }

  const updated = await prisma.goal.findUnique({
    where: { id },
    include: { milestones: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ ...updated, xpGranted });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const { id } = await params;

  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== userId) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
