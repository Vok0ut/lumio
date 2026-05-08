import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest } from "@/src/lib/api-utils";
import { CreateTaskSchema } from "@/src/lib/validations";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const grouped = {
    TODO: tasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: tasks.filter((t) => t.status === "DONE"),
  };

  return NextResponse.json(grouped);
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const parsed = CreateTaskSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const task = await prisma.task.create({
    data: {
      userId,
      title: parsed.data.title,
      priority: parsed.data.priority,
      tags: parsed.data.tags,
      estimate: parsed.data.estimate,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
