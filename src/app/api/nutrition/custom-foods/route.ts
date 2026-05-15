import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest } from "@/src/lib/api-utils";
import { z } from "zod";

const CreateCustomFoodSchema = z.object({
  name: z.string().min(1).max(200),
  kcal: z.number().min(0).max(2000),
  protein: z.number().min(0).default(0),
  carbs: z.number().min(0).default(0),
  fat: z.number().min(0).default(0),
  fiber: z.number().min(0).default(0),
  labelPhoto: z.string().max(500000).optional(),
});

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

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
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

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
}

export async function DELETE(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const { id } = await req.json();
  if (!id) return badRequest("ID requerido");

  const food = await prisma.customFood.findUnique({ where: { id } });
  if (!food || food.userId !== userId) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.customFood.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
