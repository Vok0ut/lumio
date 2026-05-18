import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, serverError, checkRateLimit } from "@/src/lib/api-utils";

/** PATCH /api/achievements/badges — equip or unequip a skill badge */
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return unauthorized();
    const limited = await checkRateLimit(userId);
    if (limited) return limited;

    const { skillId, tier, equipped } = (await req.json()) as {
      skillId: string;
      tier: string;
      equipped: boolean;
    };

    if (!skillId || !tier || typeof equipped !== "boolean") {
      return NextResponse.json({ error: "skillId, tier, and equipped required" }, { status: 400 });
    }

    // If equipping, check the user doesn't already have 3 equipped badges
    if (equipped) {
      const equippedCount = await prisma.userBadge.count({
        where: { userId, equipped: true },
      });
      if (equippedCount >= 3) {
        return NextResponse.json({ error: "MAX_EQUIPPED" }, { status: 400 });
      }
    }

    const badge = await prisma.userBadge.update({
      where: { userId_skillId_tier: { userId, skillId, tier } },
      data: {
        equipped,
        equippedAt: equipped ? new Date() : null,
      },
    });

    return NextResponse.json({ badge });
  } catch (e) {
    console.error("[PATCH /api/achievements/badges]", e);
    return serverError();
  }
}
