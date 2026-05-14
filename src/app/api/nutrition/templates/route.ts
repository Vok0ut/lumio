import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest } from "@/src/lib/api-utils";
import { z } from "zod";

const CreateTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  meal: z.enum(["desayuno", "almuerzo", "cena", "snack"]),
  foods: z.array(
    z.object({
      name: z.string(),
      grams: z.number(),
      kcal: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
    })
  ),
});

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const templates = await prisma.mealTemplate.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    templates: templates.map((t) => ({
      ...t,
      foods: JSON.parse(t.foods),
    })),
  });
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const parsed = CreateTemplateSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const template = await prisma.mealTemplate.create({
    data: {
      userId,
      name: parsed.data.name,
      meal: parsed.data.meal,
      foods: JSON.stringify(parsed.data.foods),
    },
  });

  return NextResponse.json({
    template: { ...template, foods: parsed.data.foods },
  });
}

export async function DELETE(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const { id } = await req.json();
  if (!id) return badRequest("ID requerido");

  const tmpl = await prisma.mealTemplate.findUnique({ where: { id } });
  if (!tmpl || tmpl.userId !== userId) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.mealTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
