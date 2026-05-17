import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest, grantXp, serverError, checkRateLimit } from "@/src/lib/api-utils";
import { UpdateTaskSchema } from "@/src/lib/validations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const limited = await checkRateLimit(userId);
  if (limited) return limited;

  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateTaskSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== userId) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  // Una vez completada, la tarea no puede cambiar de estado
  if (task.status === "DONE" && parsed.data.status) {
    return NextResponse.json(
      { error: "La tarea ya esta completada" },
      { status: 400 }
    );
  }

  let xpGranted = 0;
  const wasDone = task.status === "DONE";
  const willBeDone = parsed.data.status === "DONE";

  const updated = await prisma.task.update({
    where: { id },
    data: parsed.data,
  });

  if (willBeDone && !wasDone) {
    xpGranted = await grantXp(userId, "task");
  }

  return NextResponse.json({ ...updated, xpGranted });
  } catch (e) { console.error("[PATCH /api/tasks/[id]]", e); return serverError(); }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const limited = await checkRateLimit(userId);
  if (limited) return limited;

  const { id } = await params;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== userId) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
  } catch (e) { console.error("[DELETE /api/tasks/[id]]", e); return serverError(); }
}
