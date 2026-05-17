import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest, serverError, checkRateLimit } from "@/src/lib/api-utils";
import { z } from "zod";

const CreateCustomFoodSchema = z.object({
  name: z.string().min(1).max(200),
  kcal: z.number().min(0).max(2000),
  protein: z.number().min(0).default(0),
  carbs: z.number().min(0).default(0),
  fat: z.number().min(0).default(0),
  fiber: z.number().min(0).default(0),
  labelPhoto: z.string().max(2000).optional(), // URL only — use object storage for images
});

export async function GET() {
  try {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const limited = await checkRateLimit(userId);
  if (limited) return limited;

  const foods = await prisma.customFood.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      kcal: true,
      protein: true,
      carbs: true,
      fat: true,
      fiber: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ foods });
  } catch (e) { console.error("[GET /api/nutrition/custom-foods]", e); return serverError(); }
}

export async function POST(req: NextRequest) {
  try {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const limited = await checkRateLimit(userId);
  if (limited) return limited;

  const body = await req.json();
  const parsed = CreateCustomFoodSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const food = await prisma.customFood.create({
    data: {
      userId,
      name: parsed.data.name,
      kcal: parsed.data.kcal,
      protein: parsed.data.protein,
      carbs: parsed.data.carbs,
      fat: parsed.data.fat,
      fiber: parsed.data.fiber,
      labelPhoto: parsed.data.labelPhoto ?? null,
    },
  });

  return NextResponse.json({ food });
  } catch (e) { console.error("[POST /api/nutrition/custom-foods]", e); return serverError(); }
}

export async function DELETE(req: NextRequest) {
  try {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const limited = await checkRateLimit(userId);
  if (limited) return limited;

  const { id } = await req.json();
  if (!id) return badRequest("ID requerido");

  const food = await prisma.customFood.findUnique({ where: { id } });
  if (!food || food.userId !== userId) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.customFood.delete({ where: { id } });
  return NextResponse.json({ ok: true });
  } catch (e) { console.error("[DELETE /api/nutrition/custom-foods]", e); return serverError(); }
}
