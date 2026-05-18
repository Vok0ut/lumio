import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, serverError, checkRateLimit } from "@/src/lib/api-utils";

const ALLOWED_EMOJIS = new Set(["👍", "🔥", "💡", "❤️", "🎯"]);

/** POST /api/community/posts/[id]/react — toggle a reaction */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return unauthorized();
    const limited = await checkRateLimit(userId);
    if (limited) return limited;

    const { id: postId } = await params;
    const { emoji } = (await req.json()) as { emoji: string };

    if (!ALLOWED_EMOJIS.has(emoji)) {
      return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
    }

    // Check post exists
    const post = await prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Toggle: upsert or delete
    const existing = await prisma.postReaction.findUnique({
      where: { postId_userId_emoji: { postId, userId, emoji } },
    });

    if (existing) {
      await prisma.postReaction.delete({
        where: { postId_userId_emoji: { postId, userId, emoji } },
      });
      return NextResponse.json({ reacted: false, emoji });
    } else {
      await prisma.postReaction.create({ data: { postId, userId, emoji } });
      return NextResponse.json({ reacted: true, emoji });
    }
  } catch (e) {
    console.error("[POST /api/community/posts/[id]/react]", e);
    return serverError();
  }
}
