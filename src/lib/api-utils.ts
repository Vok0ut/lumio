import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { XP_REWARDS, type XpAction } from "@/src/lib/gamification";

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function grantXp(userId: string, action: XpAction): Promise<number> {
  const xp = XP_REWARDS[action];

  await prisma.$transaction([
    prisma.xpLog.create({
      data: { userId, action, xp },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { totalXp: { increment: xp } },
    }),
  ]);

  return xp;
}
