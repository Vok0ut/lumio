export const XP_REWARDS = {
  habit: 15,
  task: 25,
  goal: 500,
  streak7: 100,
  streak30: 400,
  journal: 10,
} as const;

export type XpAction = keyof typeof XP_REWARDS;

export function xpForLevel(level: number): number {
  return 200 + Math.floor((level - 1) ** 2 * 8);
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) total += xpForLevel(i);
  return total;
}

export function getLevelFromXP(totalXP: number): {
  level: number;
  currentLevelXP: number;
  xpToNextLevel: number;
} {
  let level = 1;
  let accumulated = 0;
  while (level < 100) {
    const needed = xpForLevel(level);
    if (accumulated + needed > totalXP) break;
    accumulated += needed;
    level++;
  }
  return {
    level,
    currentLevelXP: totalXP - accumulated,
    xpToNextLevel: xpForLevel(level),
  };
}

export interface Rank {
  name: string;
  minLevel: number;
  maxLevel: number;
  discount: number;
}

export const RANKS: Rank[] = [
  { name: "Novato", minLevel: 1, maxLevel: 10, discount: 0 },
  { name: "Aprendiz", minLevel: 11, maxLevel: 20, discount: 0 },
  { name: "Explorador", minLevel: 21, maxLevel: 30, discount: 0 },
  { name: "Guerrero", minLevel: 31, maxLevel: 40, discount: 5 },
  { name: "Estratega", minLevel: 41, maxLevel: 50, discount: 10 },
  { name: "Maestro", minLevel: 51, maxLevel: 60, discount: 20 },
  { name: "Sabio", minLevel: 61, maxLevel: 70, discount: 30 },
  { name: "Leyenda", minLevel: 71, maxLevel: 80, discount: 40 },
  { name: "Titan", minLevel: 81, maxLevel: 90, discount: 45 },
  { name: "Iluminado", minLevel: 91, maxLevel: 100, discount: 50 },
];

export function getRankForLevel(level: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (level >= RANKS[i].minLevel) return RANKS[i];
  }
  return RANKS[0];
}

export const PRICING = {
  monthly: 12.99,
  annual: 9.99,
} as const;

export function getDiscountedPrice(
  base: number,
  level: number
): { price: number; discount: number } {
  const rank = getRankForLevel(level);
  return {
    price: Math.round(base * (1 - rank.discount / 100) * 100) / 100,
    discount: rank.discount,
  };
}

export interface SkillNode {
  id: string;
  name: string;
  x: number;
  y: number;
  rewardLabel: string;
  xpSource: XpAction;
  parent: string | null;
}

export const SKILL_TREE: SkillNode[] = [
  { id: "constancia", name: "Constancia", x: 50, y: 10, rewardLabel: "Modo Noche Profunda", xpSource: "habit", parent: null },
  { id: "enfoque", name: "Enfoque", x: 25, y: 30, rewardLabel: "Modo Focus", xpSource: "task", parent: "constancia" },
  { id: "disciplina", name: "Disciplina", x: 75, y: 30, rewardLabel: "Cadenas de Habitos", xpSource: "habit", parent: "constancia" },
  { id: "flujo", name: "Flujo", x: 15, y: 55, rewardLabel: "Dashboard Libre", xpSource: "task", parent: "enfoque" },
  { id: "resiliencia", name: "Resiliencia", x: 40, y: 55, rewardLabel: "Informe IA Semanal", xpSource: "habit", parent: "enfoque" },
  { id: "maestria", name: "Maestria", x: 60, y: 55, rewardLabel: "Titulo Personalizado", xpSource: "goal", parent: "disciplina" },
  { id: "zen", name: "Zen", x: 35, y: 80, rewardLabel: "Tema Zen", xpSource: "journal", parent: "resiliencia" },
  { id: "liderazgo", name: "Liderazgo", x: 65, y: 80, rewardLabel: "Modo Equipo", xpSource: "goal", parent: "maestria" },
];

export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "grid" },
  { key: "habits", label: "Habitos", icon: "repeat" },
  { key: "tasks", label: "Tareas", icon: "check-square" },
  { key: "goals", label: "Metas", icon: "target" },
  { key: "calendar", label: "Calendario", icon: "calendar" },
  { key: "journal", label: "Journal", icon: "book" },
  { key: "stats", label: "Stats", icon: "bar-chart" },
  { key: "achievements", label: "Logros", icon: "award" },
  { key: "pricing", label: "Pricing", icon: "tag" },
  { key: "profile", label: "Perfil", icon: "user" },
] as const;

export const MOBILE_NAV_ITEMS = [
  { key: "dashboard", label: "Inicio", icon: "grid" },
  { key: "habits", label: "Habitos", icon: "repeat" },
  { key: "tasks", label: "Tareas", icon: "check-square" },
  { key: "journal", label: "Journal", icon: "book" },
  { key: "profile", label: "Perfil", icon: "user" },
] as const;

export const HABIT_CATEGORIES = [
  "mente",
  "cuerpo",
  "nutricion",
  "descanso",
  "otro",
] as const;

export type HabitCategory = (typeof HABIT_CATEGORIES)[number];
