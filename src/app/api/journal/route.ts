import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest, grantXp } from "@/src/lib/api-utils";
import { CreateJournalSchema } from "@/src/lib/validations";

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = 20;
  const skip = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.journalEntry.count({ where: { userId } }),
  ]);

  return NextResponse.json({
    entries,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const parsed = CreateJournalSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const entry = await prisma.journalEntry.create({
    data: {
      userId,
      title: parsed.data.title,
      body: parsed.data.body,
      mood: parsed.data.mood,
      tags: parsed.data.tags,
    },
  });

  await grantXp(userId, "journal");

  return NextResponse.json(entry, { status: 201 });
}
