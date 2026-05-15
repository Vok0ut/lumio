/**
 * LumioNutrition — calorie & macro estimation engine
 *
 * BMR: Mifflin-St Jeor (default male; can be extended)
 * TDEE: BMR x PAL (Physical Activity Level)
 * Target macros: split by goal (muscle gain / maintenance / fat loss)
 */

export type NutritionGoalType = "MUSCLE_GAIN" | "MAINTENANCE" | "FAT_LOSS";
export type MealSlot = "desayuno" | "almuerzo" | "cena" | "snack";

export const MEAL_SLOTS: { key: MealSlot; label: string; icon: string; time: string }[] = [
  { key: "desayuno", label: "Desayuno", icon: "sunrise", time: "07:00 - 09:00" },
  { key: "almuerzo", label: "Almuerzo", icon: "sun", time: "12:00 - 14:00" },
  { key: "cena", label: "Cena", icon: "moon", time: "20:00 - 22:00" },
  { key: "snack", label: "Snack", icon: "coffee", time: "Cualquier hora" },
];

export const GOAL_LABELS: Record<NutritionGoalType, string> = {
  MUSCLE_GAIN: "Ganancia muscular",
  MAINTENANCE: "Mantenimiento",
  FAT_LOSS: "Perdida de grasa",
};

export const ACTIVITY_LEVELS = [
  { value: 1.2, label: "Sedentario", desc: "Trabajo de oficina, sin ejercicio" },
  { value: 1.375, label: "Ligero", desc: "Ejercicio 1-3 dias/semana" },
  { value: 1.55, label: "Moderado", desc: "Ejercicio 3-5 dias/semana" },
  { value: 1.725, label: "Activo", desc: "Ejercicio 6-7 dias/semana" },
  { value: 1.9, label: "Muy activo", desc: "Ejercicio intenso diario" },
];

/** Macro color scheme */
export const MACRO_COLORS = {
  protein: "#F48FB1",   // pink
  carbs: "#FFB74D",     // orange
  fat: "#FFD54F",       // yellow
  fiber: "#A5D6A7",     // green
  kcal: "#81D4FA",      // light blue
} as const;

/** Mifflin-St Jeor BMR (kcal/day). Uses male formula by default. */
export function calcBMR(weight: number, height: number, age: number): number {
  return 10 * weight + 6.25 * height - 5 * age + 5;
}

export function calcTDEE(bmr: number, activityLevel: number): number {
  return Math.round(bmr * activityLevel);
}

/** Goal-adjusted target calories */
export function calcTargetKcal(tdee: number, goal: NutritionGoalType): number {
  switch (goal) {
    case "MUSCLE_GAIN":
      return Math.round(tdee * 1.15);
    case "FAT_LOSS":
      return Math.round(tdee * 0.80);
    case "MAINTENANCE":
    default:
      return tdee;
  }
}

/** Macro split in grams based on target kcal and body weight */
export function calcMacros(
  targetKcal: number,
  weight: number,
  goal: NutritionGoalType
): { protein: number; carbs: number; fat: number; fiber: number } {
  let proteinPerKg: number;
  let fatPct: number;

  switch (goal) {
    case "MUSCLE_GAIN":
      proteinPerKg = 2.0;
      fatPct = 0.25;
      break;
    case "FAT_LOSS":
      proteinPerKg = 2.2;
      fatPct = 0.30;
      break;
    case "MAINTENANCE":
    default:
      proteinPerKg = 1.8;
      fatPct = 0.28;
      break;
  }

  const protein = Math.round(weight * proteinPerKg);
  const fat = Math.round((targetKcal * fatPct) / 9);
  const carbsCal = targetKcal - protein * 4 - fat * 9;
  const carbs = Math.round(Math.max(carbsCal / 4, 50));
  const fiber = 30; // general recommendation 25-35g

  return { protein, carbs, fat, fiber };
}

/** Built-in food database: kcal + macros per 100g */
export interface FoodItem {
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  category: string;
}

export const FOOD_DATABASE: FoodItem[] = [
  // ── Proteinas ──
  { name: "Pechuga de pollo", kcal: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, category: "proteina" },
  { name: "Pechuga de pavo", kcal: 135, protein: 30, carbs: 0, fat: 1.5, fiber: 0, category: "proteina" },
  { name: "Salmon", kcal: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, category: "proteina" },
  { name: "Atun", kcal: 130, protein: 29, carbs: 0, fat: 1, fiber: 0, category: "proteina" },
  { name: "Huevo entero", kcal: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, category: "proteina" },
  { name: "Clara de huevo", kcal: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0, category: "proteina" },
  { name: "Ternera magra", kcal: 150, protein: 26, carbs: 0, fat: 5, fiber: 0, category: "proteina" },
  { name: "Cerdo magro", kcal: 143, protein: 26, carbs: 0, fat: 4, fiber: 0, category: "proteina" },
  { name: "Merluza", kcal: 90, protein: 18, carbs: 0, fat: 2, fiber: 0, category: "proteina" },
  { name: "Gambas", kcal: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0, category: "proteina" },
  { name: "Tofu", kcal: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, category: "proteina" },
  { name: "Yogur griego", kcal: 97, protein: 9, carbs: 3.6, fat: 5, fiber: 0, category: "proteina" },
  { name: "Queso fresco", kcal: 98, protein: 11, carbs: 3.4, fat: 4, fiber: 0, category: "proteina" },
  { name: "Whey protein", kcal: 400, protein: 80, carbs: 8, fat: 6, fiber: 0, category: "proteina" },
  { name: "Sardinas", kcal: 208, protein: 25, carbs: 0, fat: 11, fiber: 0, category: "proteina" },
  { name: "Bacalao", kcal: 82, protein: 18, carbs: 0, fat: 0.7, fiber: 0, category: "proteina" },
  { name: "Pollo muslo", kcal: 209, protein: 26, carbs: 0, fat: 11, fiber: 0, category: "proteina" },
  { name: "Carne picada ternera", kcal: 254, protein: 17, carbs: 0, fat: 20, fiber: 0, category: "proteina" },
  { name: "Pechuga de pollo empanada", kcal: 220, protein: 24, carbs: 12, fat: 9, fiber: 0.5, category: "proteina" },
  { name: "Jamon serrano", kcal: 241, protein: 31, carbs: 0, fat: 13, fiber: 0, category: "proteina" },
  { name: "Jamon york", kcal: 105, protein: 18, carbs: 1, fat: 3.5, fiber: 0, category: "proteina" },
  { name: "Calamares", kcal: 92, protein: 16, carbs: 3, fat: 1.4, fiber: 0, category: "proteina" },
  { name: "Mejillones", kcal: 86, protein: 12, carbs: 3.7, fat: 2.2, fiber: 0, category: "proteina" },

  // ── Carbohidratos ──
  { name: "Arroz blanco (cocido)", kcal: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, category: "carbohidrato" },
  { name: "Arroz integral (cocido)", kcal: 123, protein: 2.7, carbs: 26, fat: 1, fiber: 1.8, category: "carbohidrato" },
  { name: "Pasta (cocida)", kcal: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, category: "carbohidrato" },
  { name: "Pasta integral (cocida)", kcal: 124, protein: 5.3, carbs: 23, fat: 1.1, fiber: 3.9, category: "carbohidrato" },
  { name: "Pan integral", kcal: 247, protein: 13, carbs: 41, fat: 3.4, fiber: 6.8, category: "carbohidrato" },
  { name: "Pan blanco", kcal: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, category: "carbohidrato" },
  { name: "Avena", kcal: 389, protein: 17, carbs: 66, fat: 7, fiber: 10.6, category: "carbohidrato" },
  { name: "Patata (cocida)", kcal: 87, protein: 1.9, carbs: 20, fat: 0.1, fiber: 1.8, category: "carbohidrato" },
  { name: "Boniato (cocido)", kcal: 90, protein: 2, carbs: 21, fat: 0.1, fiber: 3, category: "carbohidrato" },
  { name: "Quinoa (cocida)", kcal: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8, category: "carbohidrato" },
  { name: "Tortilla de maiz", kcal: 218, protein: 5.7, carbs: 44, fat: 2.8, fiber: 5.2, category: "carbohidrato" },
  { name: "Cuscus (cocido)", kcal: 112, protein: 3.8, carbs: 23, fat: 0.2, fiber: 1.4, category: "carbohidrato" },
  { name: "Cereales de desayuno", kcal: 379, protein: 7, carbs: 84, fat: 1.5, fiber: 3.5, category: "carbohidrato" },
  { name: "Tortitas de arroz", kcal: 387, protein: 8, carbs: 81, fat: 2.8, fiber: 4.2, category: "carbohidrato" },

  // ── Grasas ──
  { name: "Aceite de oliva", kcal: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, category: "grasa" },
  { name: "Aguacate", kcal: 160, protein: 2, carbs: 9, fat: 15, fiber: 6.7, category: "grasa" },
  { name: "Almendras", kcal: 579, protein: 21, carbs: 22, fat: 49, fiber: 12.5, category: "grasa" },
  { name: "Nueces", kcal: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7, category: "grasa" },
  { name: "Mantequilla de cacahuete", kcal: 588, protein: 25, carbs: 20, fat: 50, fiber: 6, category: "grasa" },
  { name: "Semillas de chia", kcal: 486, protein: 17, carbs: 42, fat: 31, fiber: 34.4, category: "grasa" },
  { name: "Semillas de lino", kcal: 534, protein: 18, carbs: 29, fat: 42, fiber: 27.3, category: "grasa" },
  { name: "Cacahuetes", kcal: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5, category: "grasa" },
  { name: "Pistachos", kcal: 560, protein: 20, carbs: 28, fat: 45, fiber: 10.3, category: "grasa" },
  { name: "Anacardos", kcal: 553, protein: 18, carbs: 30, fat: 44, fiber: 3.3, category: "grasa" },
  { name: "Aceite de coco", kcal: 862, protein: 0, carbs: 0, fat: 100, fiber: 0, category: "grasa" },
  { name: "Mantequilla", kcal: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, category: "grasa" },

  // ── Verduras ──
  { name: "Brocoli", kcal: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, category: "verdura" },
  { name: "Espinacas", kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, category: "verdura" },
  { name: "Tomate", kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, category: "verdura" },
  { name: "Zanahoria", kcal: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, category: "verdura" },
  { name: "Calabacin", kcal: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1, category: "verdura" },
  { name: "Pimiento", kcal: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, category: "verdura" },
  { name: "Lechuga", kcal: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, category: "verdura" },
  { name: "Cebolla", kcal: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, category: "verdura" },
  { name: "Pepino", kcal: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, category: "verdura" },
  { name: "Coliflor", kcal: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2, category: "verdura" },
  { name: "Berenjena", kcal: 25, protein: 1, carbs: 6, fat: 0.2, fiber: 3, category: "verdura" },
  { name: "Champiñones", kcal: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1, category: "verdura" },
  { name: "Judias verdes", kcal: 31, protein: 1.8, carbs: 7, fat: 0.2, fiber: 2.7, category: "verdura" },
  { name: "Acelgas", kcal: 19, protein: 1.8, carbs: 3.7, fat: 0.2, fiber: 1.6, category: "verdura" },
  { name: "Rucula", kcal: 25, protein: 2.6, carbs: 3.7, fat: 0.7, fiber: 1.6, category: "verdura" },
  { name: "Esparragos", kcal: 20, protein: 2.2, carbs: 3.9, fat: 0.1, fiber: 2.1, category: "verdura" },
  { name: "Calabaza", kcal: 26, protein: 1, carbs: 6.5, fat: 0.1, fiber: 0.5, category: "verdura" },

  // ── Frutas ──
  { name: "Platano", kcal: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, category: "fruta" },
  { name: "Manzana", kcal: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, category: "fruta" },
  { name: "Naranja", kcal: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, category: "fruta" },
  { name: "Fresas", kcal: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, category: "fruta" },
  { name: "Arandanos", kcal: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, category: "fruta" },
  { name: "Uvas", kcal: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9, category: "fruta" },
  { name: "Pera", kcal: 57, protein: 0.4, carbs: 15, fat: 0.1, fiber: 3.1, category: "fruta" },
  { name: "Melocoton", kcal: 39, protein: 0.9, carbs: 10, fat: 0.3, fiber: 1.5, category: "fruta" },
  { name: "Kiwi", kcal: 61, protein: 1.1, carbs: 15, fat: 0.5, fiber: 3, category: "fruta" },
  { name: "Mango", kcal: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, category: "fruta" },
  { name: "Piña", kcal: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4, category: "fruta" },
  { name: "Sandia", kcal: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4, category: "fruta" },
  { name: "Melon", kcal: 34, protein: 0.8, carbs: 8, fat: 0.2, fiber: 0.9, category: "fruta" },
  { name: "Cerezas", kcal: 63, protein: 1.1, carbs: 16, fat: 0.2, fiber: 2.1, category: "fruta" },
  { name: "Granada", kcal: 83, protein: 1.7, carbs: 19, fat: 1.2, fiber: 4, category: "fruta" },

  // ── Lacteos ──
  { name: "Leche entera", kcal: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, category: "lacteo" },
  { name: "Leche desnatada", kcal: 34, protein: 3.4, carbs: 5, fat: 0.1, fiber: 0, category: "lacteo" },
  { name: "Queso curado", kcal: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0, category: "lacteo" },
  { name: "Queso mozzarella", kcal: 280, protein: 28, carbs: 3.1, fat: 17, fiber: 0, category: "lacteo" },
  { name: "Yogur natural", kcal: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, category: "lacteo" },
  { name: "Requesón", kcal: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0, category: "lacteo" },
  { name: "Nata", kcal: 292, protein: 2.8, carbs: 3.7, fat: 30, fiber: 0, category: "lacteo" },

  // ── Legumbres ──
  { name: "Lentejas (cocidas)", kcal: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9, category: "legumbre" },
  { name: "Garbanzos (cocidos)", kcal: 164, protein: 9, carbs: 27, fat: 2.6, fiber: 7.6, category: "legumbre" },
  { name: "Alubias (cocidas)", kcal: 127, protein: 8.7, carbs: 23, fat: 0.5, fiber: 6.4, category: "legumbre" },
  { name: "Guisantes", kcal: 81, protein: 5.4, carbs: 14, fat: 0.4, fiber: 5.7, category: "legumbre" },
  { name: "Edamame", kcal: 121, protein: 12, carbs: 9, fat: 5, fiber: 5.2, category: "legumbre" },
  { name: "Habas (cocidas)", kcal: 110, protein: 8, carbs: 19, fat: 0.4, fiber: 5.4, category: "legumbre" },

  // ── Otros / Procesados ──
  { name: "Miel", kcal: 304, protein: 0.3, carbs: 82, fat: 0, fiber: 0.2, category: "otro" },
  { name: "Chocolate negro 85%", kcal: 580, protein: 10, carbs: 30, fat: 46, fiber: 11, category: "otro" },
  { name: "Mermelada", kcal: 250, protein: 0.4, carbs: 63, fat: 0.1, fiber: 0.6, category: "otro" },
  { name: "Galletas Maria", kcal: 436, protein: 7, carbs: 74, fat: 12, fiber: 2.3, category: "otro" },
  { name: "Tostada integral", kcal: 260, protein: 12, carbs: 44, fat: 3.5, fiber: 7.4, category: "otro" },
  { name: "Hummus", kcal: 166, protein: 8, carbs: 14, fat: 9.6, fiber: 6, category: "otro" },
  { name: "Salsa de tomate", kcal: 32, protein: 1.5, carbs: 6, fat: 0.2, fiber: 1.5, category: "otro" },
  { name: "Aceitunas", kcal: 115, protein: 0.8, carbs: 6, fat: 11, fiber: 3.3, category: "otro" },
  { name: "Tortilla francesa", kcal: 154, protein: 11, carbs: 0.6, fat: 12, fiber: 0, category: "otro" },
  { name: "Proteina en polvo (caseina)", kcal: 370, protein: 75, carbs: 10, fat: 3, fiber: 0, category: "otro" },
  { name: "Barritas proteicas", kcal: 350, protein: 30, carbs: 35, fat: 12, fiber: 5, category: "otro" },
  { name: "Zumo de naranja", kcal: 45, protein: 0.7, carbs: 10, fat: 0.2, fiber: 0.2, category: "otro" },
  { name: "Cafe con leche", kcal: 40, protein: 2, carbs: 3.5, fat: 2, fiber: 0, category: "otro" },
  { name: "Batido de proteinas", kcal: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0.5, category: "otro" },
];

/** Estimate kcal + macros for a food entry based on name and grams.
 *  Tries to match against the built-in database, otherwise uses a rough heuristic. */
export function estimateNutrition(name: string, grams: number): {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
} {
  const lower = name.toLowerCase().trim();
  const match = FOOD_DATABASE.find(
    (f) =>
      f.name.toLowerCase() === lower ||
      lower.includes(f.name.toLowerCase()) ||
      f.name.toLowerCase().includes(lower)
  );

  if (match) {
    const factor = grams / 100;
    return {
      kcal: Math.round(match.kcal * factor),
      protein: Math.round(match.protein * factor * 10) / 10,
      carbs: Math.round(match.carbs * factor * 10) / 10,
      fat: Math.round(match.fat * factor * 10) / 10,
      fiber: Math.round(match.fiber * factor * 10) / 10,
    };
  }

  // Heuristic: average mixed food ~1.5 kcal/g
  const kcal = Math.round(grams * 1.5);
  return {
    kcal,
    protein: Math.round(kcal * 0.15 / 4),
    carbs: Math.round(kcal * 0.50 / 4),
    fat: Math.round(kcal * 0.35 / 9),
    fiber: Math.round(grams * 0.02 * 10) / 10,
  };
}

/** Get a daily adherence score (0-100) based on actual vs target macros */
export function calcAdherenceScore(
  actual: { kcal: number; protein: number; carbs: number; fat: number },
  target: { kcal: number; protein: number; carbs: number; fat: number }
): number {
  if (target.kcal === 0) return 0;

  const kcalDev = Math.abs(actual.kcal - target.kcal) / target.kcal;
  const proteinDev = target.protein > 0 ? Math.abs(actual.protein - target.protein) / target.protein : 0;
  const carbsDev = target.carbs > 0 ? Math.abs(actual.carbs - target.carbs) / target.carbs : 0;
  const fatDev = target.fat > 0 ? Math.abs(actual.fat - target.fat) / target.fat : 0;

  // Weighted: kcal 40%, protein 30%, carbs 15%, fat 15%
  const totalDev = kcalDev * 0.4 + proteinDev * 0.3 + carbsDev * 0.15 + fatDev * 0.15;

  return Math.max(0, Math.round((1 - totalDev) * 100));
}

/** Format date to YYYY-MM-DD */
export function toDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Get day names in Spanish */
export const DAY_NAMES_SHORT = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
export const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
