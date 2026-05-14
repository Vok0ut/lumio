import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId, unauthorized, badRequest } from "@/src/lib/api-utils";
import {
  calcBMR,
  calcTDEE,
  calcTargetKcal,
  calcMacros,
} from "@/src/lib/nutrition";
import { z } from "zod";

const CreateProfileSchema = z.object({
  weight: z.number().min(30).max(300),
  height: z.number().min(100).max(250),
  age: z.number().int().min(12).max(100),
  goal: z.enum(["MUSCLE_GAIN", "MAINTENANCE", "FAT_LOSS"]),
  activityLevel: z.number().min(1.0).max(2.5).optional(),
});

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const profile = await prisma.nutritionProfile.findUnique({
    where: { userId },
  });

  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const parsed = CreateProfileSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const { weight, height, age, goal } = parsed.data;
  const activityLevel = parsed.data.activityLevel ?? 1.55;

  const bmr = calcBMR(weight, height, age);
  const tdee = calcTDEE(bmr, activityLevel);
  const targetKcal = calcTargetKcal(tdee, goal);
  const { protein, carbs, fat } = calcMacros(targetKcal, weight, goal);

  const profile = await prisma.nutritionProfile.upsert({
    where: { userId },
    create: {
      userId,
      weight,
      height,
      age,
      goal,
      activityLevel,
      bmr,
      tdee,
      targetKcal,
      targetProtein: protein,
      targetCarbs: carbs,
      targetFat: fat,
    },
    update: {
      weight,
      height,
      age,
      goal,
      activityLevel,
      bmr,
      tdee,
      targetKcal,
      targetProtein: protein,
      targetCarbs: carbs,
      targetFat: fat,
    },
  });

  // Also log the initial weight
  const dateOnly = new Date(new Date().toISOString().split("T")[0] + "T00:00:00.000Z");
  await prisma.weightLog.upsert({
    where: { userId_date: { userId, date: dateOnly } },
    create: { userId, date: dateOnly, weight },
    update: { weight },
  });

  return NextResponse.json({ profile });
}
