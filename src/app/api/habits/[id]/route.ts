import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, serverError, checkRateLimit } from "@/src/lib/api-utils";

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

  const habit = await prisma.habit.findUnique({ where: { id } });
  if (!habit || habit.userId !== userId) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.habit.delete({ where: { id } });
  return NextResponse.json({ ok: true });
  } catch (e) { console.error("[DELETE /api/habits/[id]]", e); return serverError(); }
}
