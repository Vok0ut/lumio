import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest } from "@/src/lib/api-utils";
import { z } from "zod";

const LogWeightSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weight: z.number().min(30).max(300),
});

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const logs = await prisma.weightLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 90,
  });

  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const parsed = LogWeightSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const dateOnly = new Date(parsed.data.date + "T00:00:00.000Z");

  const log = await prisma.weightLog.upsert({
    where: { userId_date: { userId, date: dateOnly } },
    create: { userId, date: dateOnly, weight: parsed.data.weight },
    update: { weight: parsed.data.weight },
  });

  // Also update nutrition profile weight
  await prisma.nutritionProfile.updateMany({
    where: { userId },
    data: { weight: parsed.data.weight },
  });

  return NextResponse.json({ log });
}
