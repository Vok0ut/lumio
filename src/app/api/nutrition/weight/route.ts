import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest, serverError, checkRateLimit } from "@/src/lib/api-utils";
import { z } from "zod";

const LogWeightSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weight: z.number().min(30).max(300),
});

export async function GET() {
  try {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const limited = await checkRateLimit(userId);
  if (limited) return limited;

  const logs = await prisma.weightLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 90,
  });

  return NextResponse.json({ logs });
  } catch (e) { console.error("[GET /api/nutrition/weight]", e); return serverError(); }
}

export async function POST(req: NextRequest) {
  try {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const limited = await checkRateLimit(userId);
  if (limited) return limited;

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
  } catch (e) { console.error("[POST /api/nutrition/weight]", e); return serverError(); }
}
