import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, serverError, checkRateLimit } from "@/src/lib/api-utils";

const ALLOWED_EMOJIS = ["👍", "🔥", "💡", "❤️", "🎯"];
const MAX_CONTENT_LENGTH = 500;

/** GET /api/community/posts?category=X&cursor=Y
 *  Returns posts from users who share at least one goal category with the current user.
 *  If category param provided, filter to that category.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return unauthorized();
    const limited = await checkRateLimit(userId);
    if (limited) return limited;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? undefined;
    const cursor = searchParams.get("cursor") ?? undefined;
    const take = 20;

    // Get current user's goal categories
    const userGoals = await prisma.goal.findMany({
      where: { userId },
      select: { category: true },
    });
    const myCategories = [...new Set(userGoals.map((g) => g.category))];

    // Posts visible to this user = posts in their goal categories (or all if no goals)
    const categoryFilter = category
      ? [category]
      : myCategories.length > 0
      ? myCategories
      : undefined;

    const posts = await prisma.communityPost.findMany({
      where: categoryFilter
        ? { goalCategory: { in: categoryFilter } }
        : {},
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, image: true } },
        reactions: {
          select: { userId: true, emoji: true },
        },
      },
    });

    const hasMore = posts.length > take;
    const page = posts.slice(0, take);

    // Aggregate reactions per post
    const data = page.map((post) => {
      const reactionMap: Record<string, { count: number; reacted: boolean }> = {};
      for (const emoji of ALLOWED_EMOJIS) {
        reactionMap[emoji] = { count: 0, reacted: false };
      }
      for (const r of post.reactions) {
        if (reactionMap[r.emoji]) {
          reactionMap[r.emoji].count++;
          if (r.userId === userId) reactionMap[r.emoji].reacted = true;
        }
      }
      return {
        id: post.id,
        content: post.content,
        goalCategory: post.goalCategory,
        createdAt: post.createdAt,
        author: post.author,
        reactions: reactionMap,
      };
    });

    return NextResponse.json({
      posts: data,
      nextCursor: hasMore ? page[page.length - 1].id : null,
      myCategories,
    });
  } catch (e) {
    console.error("[GET /api/community/posts]", e);
    return serverError();
  }
}

/** POST /api/community/posts — create a post */
export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return unauthorized();
    const limited = await checkRateLimit(userId);
    if (limited) return limited;

    const { content, goalCategory } = (await req.json()) as {
      content: string;
      goalCategory: string;
    };

    if (!content?.trim() || !goalCategory?.trim()) {
      return NextResponse.json({ error: "content and goalCategory required" }, { status: 400 });
    }

    const sanitized = content.trim().slice(0, MAX_CONTENT_LENGTH);

    // Basic content moderation: block obvious spam/harmful patterns
    const blocked = [/\b(spam|http|www\.|\.com|t\.me|whatsapp)\b/i];
    if (blocked.some((re) => re.test(sanitized))) {
      return NextResponse.json({ error: "CONTENT_BLOCKED" }, { status: 400 });
    }

    const post = await prisma.communityPost.create({
      data: {
        authorId: userId,
        content: sanitized,
        goalCategory,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/community/posts]", e);
    return serverError();
  }
}
