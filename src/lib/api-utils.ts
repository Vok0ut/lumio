import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { XP_REWARDS, type XpAction } from "@/src/lib/gamification";
import { getApiByUser } from "@/src/lib/rate-limit";

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

export function serverError() {
  return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
}

export function tooManyRequests() {
  return NextResponse.json({ error: "Demasiadas solicitudes. Intenta de nuevo en un momento." }, { status: 429 });
}

export function premiumRequired() {
  return NextResponse.json(
    { error: "Esta funcion requiere el plan Premium" },
    { status: 403 }
  );
}

export async function checkRateLimit(userId: string): Promise<NextResponse | null> {
  const limiter = await getApiByUser();
  const { success } = await limiter.limit(userId);
  return success ? null : tooManyRequests();
}

export async function isPremium(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  return user?.plan === "PREMIUM";
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
