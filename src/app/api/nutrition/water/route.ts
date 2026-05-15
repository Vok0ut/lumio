import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest } from "@/src/lib/api-utils";
import { z } from "zod";

const PostSchema = z.object({
  ml: z.number().int().min(1).max(5000),
});

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** GET — returns today's water total */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const date = todayDateKey();
  const log = await prisma.waterLog.findUnique({
    where: { userId_date: { userId, date } },
  });

  return NextResponse.json({ ml: log?.ml ?? 0, date });
}

/** POST — adds ml to today's total (upsert) */
export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

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
}
