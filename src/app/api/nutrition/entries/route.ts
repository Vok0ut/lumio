import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest } from "@/src/lib/api-utils";
import { estimateNutrition } from "@/src/lib/nutrition";
import { z } from "zod";

const CreateEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meal: z.enum(["desayuno", "almuerzo", "cena", "snack"]),
  name: z.string().min(1).max(200),
  grams: z.number().min(1).max(10000),
  kcal: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  photoUrl: z.string().max(500000).optional(),
});

const DeleteEntrySchema = z.object({
  id: z.string().min(1),
});

/** GET — fetch entries for a date (or date range) */
export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let where: Record<string, unknown> = { userId };

  if (date) {
    const dateOnly = new Date(date + "T00:00:00.000Z");
    where = { ...where, date: dateOnly };
  } else if (from && to) {
    where = {
      ...where,
      date: {
        gte: new Date(from + "T00:00:00.000Z"),
        lte: new Date(to + "T00:00:00.000Z"),
      },
    };
  }

  const entries = await prisma.foodEntry.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ entries });
}

/** POST — create a food entry */
export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const parsed = CreateEntrySchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const { date, meal, name, grams, photoUrl } = parsed.data;
  const dateOnly = new Date(date + "T00:00:00.000Z");

  // Use provided macros or auto-estimate from food DB
  let kcal = parsed.data.kcal;
  let protein = parsed.data.protein;
  let carbs = parsed.data.carbs;
  let fat = parsed.data.fat;

  if (kcal === undefined) {
    const est = estimateNutrition(name, grams);
    kcal = est.kcal;
    protein = est.protein;
    carbs = est.carbs;
    fat = est.fat;
  }

  const entry = await prisma.foodEntry.create({
    data: {
      userId,
      date: dateOnly,
      meal,
      name,
      grams,
      kcal: kcal ?? 0,
      protein: protein ?? 0,
      carbs: carbs ?? 0,
      fat: fat ?? 0,
      photoUrl: photoUrl ?? null,
    },
  });

  return NextResponse.json({ entry });
}

/** DELETE — remove a food entry */
export async function DELETE(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const parsed = DeleteEntrySchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const entry = await prisma.foodEntry.findUnique({ where: { id: parsed.data.id } });
  if (!entry || entry.userId !== userId) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.foodEntry.delete({ where: { id: parsed.data.id } });

  return NextResponse.json({ ok: true });
}
