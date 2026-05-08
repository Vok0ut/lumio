import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest, grantXp } from "@/src/lib/api-utils";
import { UpdateTaskSchema } from "@/src/lib/validations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateTaskSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== userId) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
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
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const { id } = await params;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== userId) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
