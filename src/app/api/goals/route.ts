import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest, isPremium, premiumRequired, serverError, checkRateLimit } from "@/src/lib/api-utils";
import { CreateGoalSchema } from "@/src/lib/validations";

export async function GET() {
  try {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const limited = await checkRateLimit(userId);
  if (limited) return limited;
  if (!(await isPremium(userId))) return premiumRequired();

  const goals = await prisma.goal.findMany({
    where: { userId },
    include: { milestones: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(goals);
  } catch (e) { console.error("[GET /api/goals]", e); return serverError(); }
}

export async function POST(req: NextRequest) {
  try {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const limited = await checkRateLimit(userId);
  if (limited) return limited;

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
  } catch (e) { console.error("[POST /api/goals]", e); return serverError(); }
}
