import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest } from "@/src/lib/api-utils";
import { RedeemCodeSchema } from "@/src/lib/validations";

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const parsed = RedeemCodeSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return unauthorized();

  if (user.plan === "PREMIUM") {
    return NextResponse.json(
      { error: "Ya tienes el plan Premium" },
      { status: 400 }
    );
  }

  const code = parsed.data.code.trim().toUpperCase();

  const devCode = await prisma.devCode.findUnique({ where: { code } });

  if (!devCode) {
    return NextResponse.json(
      { error: "Codigo no valido" },
      { status: 400 }
    );
  }

  if (devCode.usedBy) {
    return NextResponse.json(
      { error: "Este codigo ya ha sido utilizado" },
      { status: 400 }
    );
  }

  // Canjear: marcar código como usado y actualizar plan del usuario
  await prisma.$transaction([
    prisma.devCode.update({
      where: { id: devCode.id },
      data: { usedBy: user.email, usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { plan: "PREMIUM" },
    }),
  ]);

  return NextResponse.json({ ok: true, plan: "PREMIUM" });
}
