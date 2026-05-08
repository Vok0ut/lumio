import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest } from "@/src/lib/api-utils";
import { CreateCalendarEventSchema } from "@/src/lib/validations";

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const where: Record<string, unknown> = { userId };

  if (start && end) {
    where.date = {
      gte: new Date(start),
      lte: new Date(end),
    };
  } else {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    where.date = { gte: weekStart, lte: weekEnd };
  }

  const events = await prisma.calendarEvent.findMany({
    where,
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const parsed = CreateCalendarEventSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const event = await prisma.calendarEvent.create({
    data: {
      userId,
      date: new Date(parsed.data.date),
      time: parsed.data.time,
      title: parsed.data.title,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
