/**
 * Feature gating — define qué incluye cada plan.
 *
 * FREE  : acceso básico (dashboard, hábitos limitados, tareas limitadas, calendario, perfil)
 * PREMIUM: todo ilimitado + journal, goals, stats, achievements
 */

export type PlanType = "FREE" | "PREMIUM";

/** Límites para el plan FREE */
export const FREE_LIMITS = {
  maxHabits: 3,
  maxTasks: 5,
} as const;

/** Secciones bloqueadas en FREE (requieren PREMIUM) */
export const PREMIUM_SECTIONS = new Set([
  "journal",
  "goals",
  "stats",
  "achievements",
]);

/** Comprobar si una sección requiere premium */
export function requiresPremium(section: string): boolean {
  return PREMIUM_SECTIONS.has(section);
}

/** Comprobar si el usuario puede crear más ítems */
export function canCreate(
  plan: PlanType,
  type: "habit" | "task",
  currentCount: number
): boolean {
  if (plan === "PREMIUM") return true;
  const limit = type === "habit" ? FREE_LIMITS.maxHabits : FREE_LIMITS.maxTasks;
  return currentCount < limit;
}
