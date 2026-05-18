import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest, serverError, checkRateLimit } from "@/src/lib/api-utils";
import { UpdateThemeSchema } from "@/src/lib/validations";

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return unauthorized();
    const limited = await checkRateLimit(userId);
    if (limited) return limited;

    // Premium gate
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, email: true },
    });
    if (!user) return unauthorized();

    const DEVELOPER_EMAIL = "enolpm2008@gmail.com";
    const isDev = user.email === DEVELOPER_EMAIL;
    const isDevPremium = user.plan === "PREMIUM" && !isDev
      ? !!(await prisma.devCode.findFirst({ where: { usedBy: user.email } }))
      : false;

    if (user.plan !== "PREMIUM" && !isDev && !isDevPremium) {
      return NextResponse.json({ error: "Se requiere Premium" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = UpdateThemeSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues[0].message);

    await prisma.user.update({
      where: { id: userId },
      data: { themeColors: JSON.stringify(parsed.data) },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[PATCH /api/user/theme]", e);
    return serverError();
  }
}
