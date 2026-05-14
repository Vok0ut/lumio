import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest, isPremium, premiumRequired } from "@/src/lib/api-utils";
import { CreateGoalSchema } from "@/src/lib/validations";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  if (!(await isPremium(userId))) return premiumRequired();

  const goals = await prisma.goal.findMany({
    where: { userId },
    include: { milestones: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const parsed = CreateGoalSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const goal = await prisma.goal.create({
    data: {
      userId,
      title: parsed.data.title,
      deadline: new Date(parsed.data.deadline),
      category: parsed.data.category,
      milestones: {
        create: parsed.data.milestones.map((m) => ({
          label: m.label,
          order: m.order,
        })),
      },
    },
    include: { milestones: true },
  });

  return NextResponse.json(goal, { status: 201 });
}
