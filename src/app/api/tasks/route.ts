import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest, serverError, checkRateLimit } from "@/src/lib/api-utils";
import { CreateTaskSchema } from "@/src/lib/validations";
import { FREE_LIMITS } from "@/src/lib/plans";

export async function GET() {
  try {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const limited = await checkRateLimit(userId);
  if (limited) return limited;

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
  } catch (e) { console.error("[GET /api/tasks]", e); return serverError(); }
}

export async function POST(req: NextRequest) {
  try {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const limited = await checkRateLimit(userId);
  if (limited) return limited;

  const body = await req.json();
  const parsed = CreateTaskSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  // Límite FREE (solo tareas activas, no DONE)
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
  if (user?.plan !== "PREMIUM") {
    const count = await prisma.task.count({ where: { userId, status: { not: "DONE" } } });
    if (count >= FREE_LIMITS.maxTasks) {
      return NextResponse.json(
        { error: `El plan gratuito permite maximo ${FREE_LIMITS.maxTasks} tareas activas. Actualiza a Premium para crear mas.` },
        { status: 403 }
      );
    }
  }

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
  } catch (e) { console.error("[POST /api/tasks]", e); return serverError(); }
}
