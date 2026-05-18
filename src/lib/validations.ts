import { z } from "zod";

export const CreateHabitSchema = z.object({
  name: z.string().min(1).max(100),
  target: z.string().min(1).max(60),
  category: z.enum(["mente", "cuerpo", "nutricion", "descanso", "otro"]),
});

export const LogHabitSchema = z.object({
  completed: z.boolean(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  priority: z.enum(["alta", "media", "baja"]),
  tags: z.array(z.string().max(50)).max(10).default([]),
  estimate: z.string().max(20).optional(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  priority: z.enum(["alta", "media", "baja"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  estimate: z.string().max(20).optional(),
});

export const CreateGoalSchema = z.object({
  title: z.string().min(1).max(200),
  deadline: z.string().datetime(),
  category: z.string().min(1).max(50),
  milestones: z
    .array(
      z.object({
        label: z.string().min(1).max(200),
        order: z.number().int().min(0),
      })
    )
    .default([]),
});

export const UpdateGoalSchema = z.object({
  progress: z.number().int().min(0).max(100).optional(),
  milestones: z
    .array(
      z.object({
        id: z.string().optional(),
        label: z.string().min(1).max(200),
        done: z.boolean().default(false),
        order: z.number().int().min(0),
      })
    )
    .optional(),
});

export const CreateJournalSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
  mood: z.number().int().min(1).max(5),
  tags: z.array(z.string().max(50)).max(10).default([]),
});

export const CreateCalendarEventSchema = z.object({
  date: z.string().datetime(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  title: z.string().min(1).max(200),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(50).optional(),
  image: z.string().max(500000).optional(), // base64 data URL (up to ~375KB)
});

export const RedeemCodeSchema = z.object({
  code: z.string().min(1, "El codigo es obligatorio").max(30),
});

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color hex invalido");

export const UpdateThemeSchema = z.object({
  accent: hexColor,
  xp: hexColor,
  streak: hexColor,
  success: hexColor,
  bgBase: hexColor,
});

export const SendOtpSchema = z.object({
  email: z.string().email(),
});

export const VerifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});
