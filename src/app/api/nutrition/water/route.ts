import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest, serverError, checkRateLimit } from "@/src/lib/api-utils";
import { z } from "zod";

const PostSchema = z.object({
  ml: z.number().int().min(1).max(5000),
});

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** GET — returns today's water total */
export async function GET() {
  try {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const limited = await checkRateLimit(userId);
  if (limited) return limited;

  const date = todayDateKey();
  const log = await prisma.waterLog.findUnique({
    where: { userId_date: { userId, date } },
  });

  return NextResponse.json({ ml: log?.ml ?? 0, date });
  } catch (e) { console.error("[GET /api/nutrition/water]", e); return serverError(); }
}

/** POST — adds ml to today's total (upsert) */
export async function POST(req: NextRequest) {
  try {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const limited = await checkRateLimit(userId);
  if (limited) return limited;

  const body = await req.json();
  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const date = todayDateKey();
  const { ml } = parsed.data;

  const log = await prisma.waterLog.upsert({
    where: { userId_date: { userId, date } },
    update: { ml: { increment: ml } },
    create: { userId, date, ml },
  });

  return NextResponse.json({ ml: log.ml, date });
  } catch (e) { console.error("[POST /api/nutrition/water]", e); return serverError(); }
}
