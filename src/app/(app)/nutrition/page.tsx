"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { usePlan } from "@/src/hooks/use-plan";
import { PremiumWall } from "@/src/components/ui/premium-wall";
import { Modal } from "@/src/components/ui/modal";
import { Icon } from "@/src/components/ui/icons";
import { TiltCard } from "@/src/components/ui/tilt-card";
import {
  MEAL_SLOTS,
  GOAL_LABELS,
  ACTIVITY_LEVELS,
  FOOD_DATABASE,
  MACRO_COLORS,
  estimateNutrition,
  calcAdherenceScore,
  toDateKey,
  DAY_NAMES_SHORT,
  MONTH_NAMES,
  type NutritionGoalType,
  type MealSlot,
  type FoodItem,
} from "@/src/lib/nutrition";

/* ─── Types ─── */

interface NutritionProfile {
  weight: number;
  height: number;
  age: number;
  goal: NutritionGoalType;
  activityLevel: number;
  bmr: number;
  tdee: number;
  targetKcal: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetFiber: number;
}

interface FoodEntry {
  id: string;
  date: string;
  meal: MealSlot;
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  photoUrl: string | null;
}

interface CustomFoodItem {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface WeightLogItem {
  date: string;
  weight: number;
}

/* ─── Utility ─── */

function today(): string {
  return toDateKey(new Date());
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return toDateKey(d);
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
}

function getMonthDays(year: number, month: number): { date: string; day: number; inMonth: boolean }[] {
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { date: string; day: number; inMonth: boolean }[] = [];

  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDow - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    cells.push({ date: toDateKey(new Date(y, m, d)), day: d, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: toDateKey(new Date(year, month, d)), day: d, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const d = cells.length - startDow - daysInMonth + 1;
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    cells.push({ date: toDateKey(new Date(y, m, d)), day: d, inMonth: false });
  }
  return cells;
}

/* ═══════════════════════════════════════════
   Onboarding
   ═══════════════════════════════════════════ */

function Onboarding({ onComplete }: { onComplete: () => void }) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState<NutritionGoalType | null>(null);
  const [saving, setSaving] = useState(false);

  const canProceed = step === 0 ? weight && height && age : step === 1 ? true : goal !== null;

  const handleSubmit = async () => {
    if (!goal) return;
    setSaving(true);
    try {
      const res = await fetch("/api/nutrition/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parseFloat(weight),
          height: parseFloat(height),
          age: parseInt(age),
          goal,
          activityLevel: activity,
        }),
      });
      if (res.ok) onComplete();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="section-inner" style={{ alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ marginBottom: 32 }}>
          <span className="t-label" style={{ letterSpacing: "0.12em" }}>LumioNutrition</span>
          <h1 style={{
            fontFamily: "var(--font-sans)", fontSize: isMobile ? 24 : 32, fontWeight: 700,
            color: "var(--text-hi)", letterSpacing: "-0.02em", margin: "8px 0 0",
          }}>
            {step === 0 && "Tus datos"}
            {step === 1 && "Nivel de actividad"}
            {step === 2 && "Tu objetivo"}
          </h1>
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-lo)",
            marginTop: 8, lineHeight: 1.5,
          }}>
            {step === 0 && "Introduce tu peso, estatura y edad para calcular tus necesidades nutricionales."}
            {step === 1 && "Selecciona tu nivel de actividad fisica semanal."}
            {step === 2 && "Elige el plan que mejor se adapte a tus metas."}
          </p>
        </div>

        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 28 }}>
          {[0, 1, 2].map((s) => (
            <div key={s} style={{
              width: step === s ? 24 : 8, height: 4, borderRadius: 2,
              background: step >= s ? "var(--accent)" : "rgba(255,255,255,0.1)",
              transition: "all 0.3s",
            }} />
          ))}
        </div>

        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
            <div>
              <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Peso (kg)</label>
              <input className="input" type="number" placeholder="70" value={weight}
                onChange={(e) => setWeight(e.target.value)} min={30} max={300} />
            </div>
            <div>
              <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Estatura (cm)</label>
              <input className="input" type="number" placeholder="175" value={height}
                onChange={(e) => setHeight(e.target.value)} min={100} max={250} />
            </div>
            <div>
              <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Edad</label>
              <input className="input" type="number" placeholder="25" value={age}
                onChange={(e) => setAge(e.target.value)} min={12} max={100} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ACTIVITY_LEVELS.map((lvl) => (
              <button key={lvl.value} className="card"
                onClick={() => setActivity(lvl.value)}
                style={{
                  padding: "14px 16px", textAlign: "left", cursor: "pointer",
                  border: activity === lvl.value ? "1px solid var(--accent)" : undefined,
                  background: activity === lvl.value ? "rgba(255,255,255,0.06)" : undefined,
                }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--text-hi)" }}>{lvl.label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-lo)", marginTop: 2 }}>{lvl.desc}</div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(["MUSCLE_GAIN", "MAINTENANCE", "FAT_LOSS"] as NutritionGoalType[]).map((g) => {
              const descriptions: Record<NutritionGoalType, string> = {
                MUSCLE_GAIN: "Superavit calorico del 15%. Ideal para ganar masa muscular con entrenamiento de fuerza.",
                MAINTENANCE: "Calorias al nivel de tu gasto. Mantiene tu peso y composicion corporal actuales.",
                FAT_LOSS: "Deficit calorico del 20%. Perdida de grasa sostenible preservando masa muscular.",
              };
              return (
                <TiltCard key={g} className="card" max={4} scale={1.01}>
                  <button onClick={() => setGoal(g)} style={{
                    padding: "20px 16px", textAlign: "left", cursor: "pointer",
                    width: "100%", background: "none", border: "none",
                    borderLeft: goal === g ? "3px solid var(--accent)" : "3px solid transparent",
                  }}>
                    <div style={{
                      fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 600,
                      color: goal === g ? "var(--text-hi)" : "var(--text-mid)",
                    }}>{GOAL_LABELS[g]}</div>
                    <div style={{
                      fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-lo)",
                      marginTop: 4, lineHeight: 1.5,
                    }}>{descriptions[g]}</div>
                  </button>
                </TiltCard>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 28 }}>
          {step > 0 && <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>Atras</button>}
          {step < 2 ? (
            <button className="btn btn-primary" disabled={!canProceed}
              style={{ opacity: canProceed ? 1 : 0.4 }}
              onClick={() => setStep(step + 1)}>Siguiente</button>
          ) : (
            <button className="btn btn-primary" disabled={!goal || saving}
              style={{ opacity: !goal || saving ? 0.4 : 1 }}
              onClick={handleSubmit}>{saving ? "Calculando..." : "Comenzar"}</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Calorie Donut Chart
   ═══════════════════════════════════════════ */

function CalorieDonut({
  consumed,
  target,
  size = 180,
}: {
  consumed: number;
  target: number;
  size?: number;
}) {
  const strokeWidth = 12;
  const r = (size - strokeWidth) / 2;
  const c = Math.PI * 2 * r;
  const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
  const remaining = Math.max(0, target - consumed);
  const over = consumed > target;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={over ? "#EF5350" : MACRO_COLORS.kcal} strokeWidth={strokeWidth}
          strokeDasharray={`${pct * c} ${c}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontFamily: "var(--font-sans)", fontSize: size * 0.2, fontWeight: 700,
          color: over ? "#EF5350" : "var(--text-hi)",
          letterSpacing: "-0.03em", lineHeight: 1,
        }}>
          {Math.round(remaining)}
        </span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          color: "var(--text-lo)", marginTop: 4,
        }}>
          kcal restantes
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Macro Ring (small)
   ═══════════════════════════════════════════ */

function MacroRing({
  value, max, label, unit, color, size = 72,
}: {
  value: number; max: number; label: string; unit: string; color: string; size?: number;
}) {
  const strokeWidth = 5;
  const r = (size - strokeWidth) / 2;
  const c = Math.PI * 2 * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;

  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={`${pct * c} ${c}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray 0.4s" }}
        />
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" dominantBaseline="middle"
          fill="var(--text-hi)" style={{ fontFamily: "var(--font-sans)", fontSize: size * 0.18, fontWeight: 700 }}>
          {Math.round(value)}
        </text>
        <text x={size / 2} y={size / 2 + size * 0.14} textAnchor="middle" dominantBaseline="middle"
          fill="var(--text-lo)" style={{ fontFamily: "var(--font-mono)", fontSize: size * 0.1 }}>
          /{Math.round(max)}{unit}
        </text>
      </svg>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 11, color, marginTop: 4, fontWeight: 600,
      }}>
        {label}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Calendar Mini
   ═══════════════════════════════════════════ */

function CalendarMini({
  selectedDate, onSelectDate, loggedDates,
}: {
  selectedDate: string; onSelectDate: (d: string) => void; loggedDates: Set<string>;
}) {
  const d = new Date(selectedDate + "T12:00:00");
  const [year, setYear] = useState(d.getFullYear());
  const [month, setMonth] = useState(d.getMonth());
  const cells = useMemo(() => getMonthDays(year, month), [year, month]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button className="btn btn-ghost" style={{ padding: 4 }} onClick={prevMonth}>
          <Icon name="chevron-left" size={14} />
        </button>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--text-hi)" }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button className="btn btn-ghost" style={{ padding: 4 }} onClick={nextMonth}>
          <Icon name="chevron-right" size={14} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {DAY_NAMES_SHORT.map((dn) => (
          <div key={dn} style={{
            textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 9,
            color: "var(--text-lo)", padding: "4px 0", textTransform: "uppercase", letterSpacing: "0.06em",
          }}>{dn}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((cell, i) => {
          const isSelected = cell.date === selectedDate;
          const hasLog = loggedDates.has(cell.date);
          const isToday = cell.date === today();
          return (
            <button key={i}
              onClick={() => { if (cell.inMonth) onSelectDate(cell.date); }}
              style={{
                padding: "6px 0", border: "none", cursor: cell.inMonth ? "pointer" : "default",
                background: isSelected ? "var(--accent)" : "transparent",
                borderRadius: "var(--radius-sm)", position: "relative",
              }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 11,
                color: isSelected ? "#000" : !cell.inMonth ? "var(--text-lo)" : "var(--text-hi)",
                fontWeight: isToday ? 700 : 400, opacity: cell.inMonth ? 1 : 0.3,
              }}>
                {cell.day}
              </span>
              {hasLog && !isSelected && (
                <div style={{
                  position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)",
                  width: 3, height: 3, borderRadius: "50%", background: "var(--accent)",
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Weekly Adherence Bars
   ═══════════════════════════════════════════ */

function WeeklyAdherence({
  entries, profile,
}: {
  entries: FoodEntry[]; profile: NutritionProfile;
}) {
  const dailyScores = useMemo(() => {
    const grouped: Record<string, FoodEntry[]> = {};
    entries.forEach((e) => {
      const dk = e.date.split("T")[0];
      if (!grouped[dk]) grouped[dk] = [];
      grouped[dk].push(e);
    });

    const scores: { date: string; score: number; dayName: string }[] = [];
    const todayStr = today();
    for (let i = 6; i >= 0; i--) {
      const dk = addDays(todayStr, -i);
      const dayEntries = grouped[dk] ?? [];
      const actual = {
        kcal: dayEntries.reduce((s, e) => s + e.kcal, 0),
        protein: dayEntries.reduce((s, e) => s + e.protein, 0),
        carbs: dayEntries.reduce((s, e) => s + e.carbs, 0),
        fat: dayEntries.reduce((s, e) => s + e.fat, 0),
      };
      const target = {
        kcal: profile.targetKcal, protein: profile.targetProtein,
        carbs: profile.targetCarbs, fat: profile.targetFat,
      };
      const score = actual.kcal > 0 ? calcAdherenceScore(actual, target) : 0;
      const d = new Date(dk + "T12:00:00");
      scores.push({ date: dk, score, dayName: DAY_NAMES_SHORT[(d.getDay() + 6) % 7] });
    }
    return scores;
  }, [entries, profile]);

  const avgScore = dailyScores.filter(s => s.score > 0).length > 0
    ? Math.round(dailyScores.filter(s => s.score > 0).reduce((s, d) => s + d.score, 0) / dailyScores.filter(s => s.score > 0).length)
    : 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span className="t-label">Adherencia semanal</span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
          color: avgScore >= 80 ? MACRO_COLORS.fiber : avgScore >= 50 ? MACRO_COLORS.carbs : "var(--text-lo)",
        }}>{avgScore > 0 ? `${avgScore}%` : "--"}</span>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80 }}>
        {dailyScores.map((ds) => {
          const barH = ds.score > 0 ? Math.max(8, (ds.score / 100) * 64) : 4;
          const barColor = ds.score >= 80 ? MACRO_COLORS.fiber
            : ds.score >= 50 ? MACRO_COLORS.carbs
            : ds.score > 0 ? "#EF5350"
            : "rgba(255,255,255,0.08)";
          return (
            <div key={ds.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 600,
                color: ds.score > 0 ? "var(--text-mid)" : "var(--text-lo)",
              }}>
                {ds.score > 0 ? ds.score : ""}
              </span>
              <div style={{
                width: "100%", height: barH, borderRadius: 3,
                background: barColor, transition: "height 0.3s",
              }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-lo)" }}>
                {ds.dayName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Add Food Modal
   ═══════════════════════════════════════════ */

function AddFoodModal({
  open, onClose, meal, date, onAdded, customFoods,
}: {
  open: boolean; onClose: () => void; meal: MealSlot; date: string;
  onAdded: () => void; customFoods: CustomFoodItem[];
}) {
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [grams, setGrams] = useState("");
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<(FoodItem | CustomFoodItem)[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | CustomFoodItem | null>(null);
  const [customKcal, setCustomKcal] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    const lower = query.toLowerCase();
    // Search built-in + custom foods
    const builtIn = FOOD_DATABASE.filter(
      (f) => f.name.toLowerCase().includes(lower) || lower.includes(f.name.toLowerCase().split(" ")[0])
    ).slice(0, 6);
    const custom = customFoods.filter(
      (f) => f.name.toLowerCase().includes(lower)
    ).slice(0, 4);
    setSuggestions([...custom, ...builtIn]);
  }, [query, customFoods]);

  const handlePhoto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 480;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = (h * MAX) / w; w = MAX; } }
        else { if (h > MAX) { w = (w * MAX) / h; h = MAX; } }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        setPhotoUrl(canvas.toDataURL("image/webp", 0.75));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const selectSuggestion = (food: FoodItem | CustomFoodItem) => {
    setSelectedFood(food);
    setName(food.name);
    setQuery(food.name);
    setSuggestions([]);
  };

  const preview = useMemo(() => {
    if (!grams) return null;
    const g = parseFloat(grams);
    if (isNaN(g) || g <= 0) return null;

    if (customKcal) {
      const k = parseFloat(customKcal);
      return { kcal: k, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    }

    if (selectedFood) {
      const factor = g / 100;
      return {
        kcal: Math.round(selectedFood.kcal * factor),
        protein: Math.round(selectedFood.protein * factor * 10) / 10,
        carbs: Math.round(selectedFood.carbs * factor * 10) / 10,
        fat: Math.round(selectedFood.fat * factor * 10) / 10,
        fiber: Math.round((selectedFood as FoodItem).fiber * factor * 10) / 10 || 0,
      };
    }

    if (name) return estimateNutrition(name, g);
    return null;
  }, [grams, selectedFood, name, customKcal]);

  const handleSave = async () => {
    const finalName = name || query;
    if (!finalName || !grams) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        date, meal, name: finalName, grams: parseFloat(grams),
      };
      if (preview) {
        body.kcal = preview.kcal;
        body.protein = preview.protein;
        body.carbs = preview.carbs;
        body.fat = preview.fat;
        body.fiber = preview.fiber;
      }
      if (photoUrl) body.photoUrl = photoUrl;
      const res = await fetch("/api/nutrition/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        onAdded();
        onClose();
        setQuery(""); setName(""); setGrams(""); setSelectedFood(null); setCustomKcal(""); setPhotoUrl(null);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Anadir a ${MEAL_SLOTS.find((m) => m.key === meal)?.label ?? meal}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Search */}
        <div>
          <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Alimento</label>
          <div style={{ position: "relative" }}>
            <input className="input" placeholder="Buscar alimento..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setName(e.target.value); setSelectedFood(null); }}
            />
            <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}>
              <Icon name="search" size={14} color="var(--text-lo)" />
            </div>
          </div>

          {suggestions.length > 0 && (
            <div style={{
              background: "var(--bg-raised)", border: "1px solid var(--border-mid)",
              borderRadius: "var(--radius-sm)", marginTop: 4, maxHeight: 220, overflowY: "auto",
            }}>
              {suggestions.map((s, idx) => {
                const isCustom = !("category" in s);
                return (
                  <button key={`${s.name}-${idx}`} onClick={() => selectSuggestion(s)}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      width: "100%", padding: "10px 14px", border: "none",
                      background: "var(--bg-raised)", cursor: "pointer", textAlign: "left",
                      borderBottom: "1px solid var(--border)",
                    }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-hi)", display: "flex", alignItems: "center", gap: 6 }}>
                      {isCustom && <span style={{ fontSize: 9, color: MACRO_COLORS.protein, fontWeight: 600 }}>MIO</span>}
                      {s.name}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-lo)" }}>
                      {s.kcal} kcal/100g
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Grams */}
        <div>
          <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Cantidad (g)</label>
          <input className="input" type="number" placeholder="150"
            value={grams} onChange={(e) => setGrams(e.target.value)} min={1} />
        </div>

        {/* Custom kcal override */}
        {!selectedFood && name && (
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Calorias manuales (opcional)</label>
            <input className="input" type="number" placeholder="Dejar vacio para estimar"
              value={customKcal} onChange={(e) => setCustomKcal(e.target.value)} />
          </div>
        )}

        {/* Photo */}
        <div>
          <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Foto (opcional)</label>
          {photoUrl ? (
            <div style={{ position: "relative", display: "inline-block" }}>
              <img src={photoUrl} alt="Foto" style={{
                width: 80, height: 80, borderRadius: "var(--radius-sm)",
                objectFit: "cover", border: "1px solid var(--border)",
              }} />
              <button onClick={() => setPhotoUrl(null)} style={{
                position: "absolute", top: -6, right: -6, width: 20, height: 20,
                borderRadius: "50%", background: "var(--bg-surface)", border: "1px solid var(--border-mid)",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0,
              }}>
                <Icon name="x" size={10} color="var(--text-mid)" />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }}
                onClick={() => cameraRef.current?.click()}>
                <Icon name="camera" size={14} /> Camara
              </button>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }}
                onClick={() => galleryRef.current?.click()}>
                <Icon name="plus" size={14} /> Galeria
              </button>
            </div>
          )}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment"
            onChange={handlePhoto} style={{ display: "none" }} />
          <input ref={galleryRef} type="file" accept="image/*"
            onChange={handlePhoto} style={{ display: "none" }} />
        </div>

        {/* Preview */}
        {preview && (
          <div className="card" style={{ padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="t-label">Estimacion</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 700, color: "var(--text-hi)" }}>
                {preview.kcal} kcal
              </span>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: MACRO_COLORS.protein }}>P: {preview.protein}g</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: MACRO_COLORS.carbs }}>C: {preview.carbs}g</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: MACRO_COLORS.fat }}>G: {preview.fat}g</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: MACRO_COLORS.fiber }}>F: {preview.fiber}g</span>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={saving || !name || !grams}
            style={{ opacity: saving || !name || !grams ? 0.4 : 1 }}
            onClick={handleSave}>{saving ? "Guardando..." : "Anadir"}</button>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════
   Custom Food Modal (from label photo)
   ═══════════════════════════════════════════ */

function CustomFoodModal({
  open, onClose, onCreated,
}: {
  open: boolean; onClose: () => void; onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [fiber, setFiber] = useState("");
  const [labelPhoto, setLabelPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handlePhoto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 600;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = (h * MAX) / w; w = MAX; } }
        else { if (h > MAX) { w = (w * MAX) / h; h = MAX; } }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        setLabelPhoto(canvas.toDataURL("image/webp", 0.8));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const handleSave = async () => {
    if (!name || !kcal) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        kcal: parseFloat(kcal),
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        fiber: parseFloat(fiber) || 0,
      };
      if (labelPhoto) body.labelPhoto = labelPhoto;
      const res = await fetch("/api/nutrition/custom-foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        onCreated();
        onClose();
        setName(""); setKcal(""); setProtein(""); setCarbs(""); setFat(""); setFiber(""); setLabelPhoto(null);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Crear alimento personalizado">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Photo of nutrition label */}
        <div>
          <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Foto de la etiqueta nutricional</label>
          {labelPhoto ? (
            <div style={{ position: "relative", display: "inline-block" }}>
              <img src={labelPhoto} alt="Etiqueta" style={{
                width: "100%", maxHeight: 200, borderRadius: "var(--radius-sm)",
                objectFit: "contain", border: "1px solid var(--border)", background: "rgba(0,0,0,0.3)",
              }} />
              <button onClick={() => setLabelPhoto(null)} style={{
                position: "absolute", top: -6, right: -6, width: 20, height: 20,
                borderRadius: "50%", background: "var(--bg-surface)", border: "1px solid var(--border-mid)",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0,
              }}>
                <Icon name="x" size={10} color="var(--text-mid)" />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }}
                onClick={() => cameraRef.current?.click()}>
                <Icon name="camera" size={14} /> Fotografiar etiqueta
              </button>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }}
                onClick={() => galleryRef.current?.click()}>
                <Icon name="plus" size={14} /> Galeria
              </button>
            </div>
          )}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment"
            onChange={handlePhoto} style={{ display: "none" }} />
          <input ref={galleryRef} type="file" accept="image/*"
            onChange={handlePhoto} style={{ display: "none" }} />
        </div>

        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-lo)", lineHeight: 1.5,
          background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: "var(--radius-sm)",
        }}>
          Introduce los valores por cada 100g segun la etiqueta nutricional del producto.
        </p>

        <div>
          <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Nombre del alimento</label>
          <input className="input" placeholder="Ej: Galletas integrales marca X"
            value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Kcal /100g</label>
            <input className="input" type="number" placeholder="250"
              value={kcal} onChange={(e) => setKcal(e.target.value)} />
          </div>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6, color: MACRO_COLORS.protein }}>Proteina (g)</label>
            <input className="input" type="number" placeholder="8"
              value={protein} onChange={(e) => setProtein(e.target.value)} />
          </div>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6, color: MACRO_COLORS.carbs }}>Carbos (g)</label>
            <input className="input" type="number" placeholder="35"
              value={carbs} onChange={(e) => setCarbs(e.target.value)} />
          </div>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6, color: MACRO_COLORS.fat }}>Grasas (g)</label>
            <input className="input" type="number" placeholder="12"
              value={fat} onChange={(e) => setFat(e.target.value)} />
          </div>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6, color: MACRO_COLORS.fiber }}>Fibra (g)</label>
            <input className="input" type="number" placeholder="5"
              value={fiber} onChange={(e) => setFiber(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={saving || !name || !kcal}
            style={{ opacity: saving || !name || !kcal ? 0.4 : 1 }}
            onClick={handleSave}>{saving ? "Guardando..." : "Guardar alimento"}</button>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════
   Meal Section
   ═══════════════════════════════════════════ */

function MealSection({
  slot, entries, onAdd, onDelete,
}: {
  slot: typeof MEAL_SLOTS[number]; entries: FoodEntry[]; onAdd: () => void; onDelete: (id: string) => void;
}) {
  const totalKcal = entries.reduce((s, e) => s + e.kcal, 0);
  const totalP = entries.reduce((s, e) => s + e.protein, 0);
  const totalC = entries.reduce((s, e) => s + e.carbs, 0);
  const totalF = entries.reduce((s, e) => s + e.fat, 0);
  const totalFi = entries.reduce((s, e) => s + (e.fiber || 0), 0);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Meal header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 16px", borderBottom: entries.length > 0 ? "1px solid var(--border)" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "var(--radius-sm)",
            background: "rgba(255,255,255,0.04)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <Icon name={slot.icon} size={16} color="var(--text-mid)" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--text-hi)" }}>
              {slot.label}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-lo)" }}>
              {slot.time}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {totalKcal > 0 && (
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--text-hi)" }}>
              {Math.round(totalKcal)} kcal
            </span>
          )}
          <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11, color: MACRO_COLORS.kcal }} onClick={onAdd}>
            + ANADIR
          </button>
        </div>
      </div>

      {/* Per-meal macro summary */}
      {entries.length > 0 && (
        <div style={{
          display: "flex", gap: 12, padding: "8px 16px",
          borderBottom: "1px solid var(--border)",
          background: "rgba(255,255,255,0.015)",
        }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: MACRO_COLORS.protein }}>
            P: {Math.round(totalP * 10) / 10}g
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: MACRO_COLORS.carbs }}>
            C: {Math.round(totalC * 10) / 10}g
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: MACRO_COLORS.fat }}>
            G: {Math.round(totalF * 10) / 10}g
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: MACRO_COLORS.fiber }}>
            F: {Math.round(totalFi * 10) / 10}g
          </span>
        </div>
      )}

      {/* Entries */}
      {entries.map((entry, i) => (
        <div key={entry.id} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 16px",
          borderBottom: i < entries.length - 1 ? "1px solid var(--border)" : "none",
        }}>
          {entry.photoUrl && (
            <img src={entry.photoUrl} alt="" style={{
              width: 36, height: 36, borderRadius: "var(--radius-sm)",
              objectFit: "cover", flexShrink: 0,
            }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-hi)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{entry.name}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-lo)" }}>{entry.grams}g</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: MACRO_COLORS.protein }}>P:{entry.protein}g</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: MACRO_COLORS.carbs }}>C:{entry.carbs}g</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: MACRO_COLORS.fat }}>G:{entry.fat}g</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: MACRO_COLORS.fiber }}>F:{entry.fiber || 0}g</span>
            </div>
          </div>
          <span style={{
            fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--text-mid)", flexShrink: 0,
          }}>{entry.kcal}</span>
          <button onClick={() => onDelete(entry.id)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}>
            <Icon name="x" size={12} color="var(--text-lo)" />
          </button>
        </div>
      ))}

      {entries.length === 0 && (
        <div style={{
          padding: "16px", textAlign: "center",
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-lo)",
        }}>
          Sin registros
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Weight Chart
   ═══════════════════════════════════════════ */

function WeightChart({ logs }: { logs: WeightLogItem[] }) {
  if (logs.length < 2) return null;
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const weights = sorted.map((l) => l.weight);
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;
  const range = maxW - minW || 1;
  const w = 280, h = 60;
  const points = sorted.map((l, i) => {
    const x = (i / (sorted.length - 1)) * w;
    const y = h - ((l.weight - minW) / range) * h;
    return `${x},${y}`;
  });
  const diff = weights[weights.length - 1] - weights[0];

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span className="t-label">Evolucion de peso</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name={diff <= 0 ? "trending-down" : "trending-up"} size={12}
            color={diff <= 0 ? "var(--accent)" : "var(--text-mid)"} />
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: diff <= 0 ? "var(--accent)" : "var(--text-mid)",
          }}>
            {diff > 0 ? "+" : ""}{diff.toFixed(1)} kg
          </span>
        </div>
      </div>
      <svg viewBox={`-4 -4 ${w + 8} ${h + 8}`} style={{ width: "100%", height: "auto", maxHeight: 80 }}>
        <polyline points={points.join(" ")} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
        {sorted.map((l, i) => {
          const x = (i / (sorted.length - 1)) * w;
          const y = h - ((l.weight - minW) / range) * h;
          return <circle key={i} cx={x} cy={y} r="2.5" fill="var(--accent)" />;
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-lo)" }}>
          {formatDateShort(sorted[0].date)}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-lo)" }}>
          {formatDateShort(sorted[sorted.length - 1].date)}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════ */

export default function NutritionPage() {
  const isMobile = useIsMobile();
  const { isPremium, loading: planLoading } = usePlan();

  const [profile, setProfile] = useState<NutritionProfile | null>(null);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [weekEntries, setWeekEntries] = useState<FoodEntry[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLogItem[]>([]);
  const [customFoods, setCustomFoods] = useState<CustomFoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(today());

  // Modal state
  const [addMeal, setAddMeal] = useState<MealSlot | null>(null);
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [customFoodModalOpen, setCustomFoodModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);

  // Logged dates for calendar dots
  const loggedDates = useMemo(() => {
    const dates = new Set<string>();
    weekEntries.forEach((e) => dates.add(e.date.split("T")[0]));
    entries.forEach((e) => dates.add(e.date.split("T")[0]));
    return dates;
  }, [entries, weekEntries]);

  /* ─── Data loading ─── */

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/nutrition/profile");
      const data = await res.json();
      setProfile(data.profile ?? null);
    } catch { /* */ }
  }, []);

  const loadEntries = useCallback(async (date: string) => {
    try {
      const res = await fetch(`/api/nutrition/entries?date=${date}`);
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch { /* */ }
  }, []);

  const loadWeekEntries = useCallback(async () => {
    const todayStr = today();
    const fromStr = addDays(todayStr, -6);
    try {
      const res = await fetch(`/api/nutrition/entries?from=${fromStr}&to=${todayStr}`);
      const data = await res.json();
      setWeekEntries(data.entries ?? []);
    } catch { /* */ }
  }, []);

  const loadWeightLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/nutrition/weight");
      const data = await res.json();
      setWeightLogs(
        (data.logs ?? []).map((l: { date: string; weight: number }) => ({
          date: l.date.split("T")[0], weight: l.weight,
        }))
      );
    } catch { /* */ }
  }, []);

  const loadCustomFoods = useCallback(async () => {
    try {
      const res = await fetch("/api/nutrition/custom-foods");
      const data = await res.json();
      setCustomFoods(data.foods ?? []);
    } catch { /* */ }
  }, []);

  useEffect(() => {
    Promise.all([loadProfile(), loadWeightLogs(), loadCustomFoods()]).then(() => setLoading(false));
  }, [loadProfile, loadWeightLogs, loadCustomFoods]);

  useEffect(() => {
    if (profile) {
      loadEntries(selectedDate);
      loadWeekEntries();
    }
  }, [selectedDate, profile, loadEntries, loadWeekEntries]);

  const handleDeleteEntry = async (id: string) => {
    await fetch("/api/nutrition/entries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadEntries(selectedDate);
    loadWeekEntries();
  };

  const handleLogWeight = async () => {
    if (!newWeight) return;
    setSavingWeight(true);
    try {
      await fetch("/api/nutrition/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, weight: parseFloat(newWeight) }),
      });
      await loadWeightLogs();
      setWeightModalOpen(false);
      setNewWeight("");
    } finally {
      setSavingWeight(false);
    }
  };

  const handleEntryAdded = () => {
    loadEntries(selectedDate);
    loadWeekEntries();
  };

  /* ─── Loading / Premium gate ─── */

  if (loading || planLoading) {
    return (
      <div className="section-inner" style={{ alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-lo)" }}>Cargando...</span>
      </div>
    );
  }

  if (!isPremium) {
    return <PremiumWall feature="LumioNutrition" />;
  }

  if (!profile) {
    return <Onboarding onComplete={() => { loadProfile(); }} />;
  }

  /* ─── Daily totals ─── */

  const dayEntries = entries.filter((e) => e.date.split("T")[0] === selectedDate);
  const dayTotals = {
    kcal: dayEntries.reduce((s, e) => s + e.kcal, 0),
    protein: dayEntries.reduce((s, e) => s + e.protein, 0),
    carbs: dayEntries.reduce((s, e) => s + e.carbs, 0),
    fat: dayEntries.reduce((s, e) => s + e.fat, 0),
    fiber: dayEntries.reduce((s, e) => s + (e.fiber || 0), 0),
  };

  const isToday = selectedDate === today();

  return (
    <div className="section-inner">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <span className="t-label">LumioNutrition</span>
          <h1 style={{
            fontFamily: "var(--font-sans)", fontSize: isMobile ? 22 : 28, fontWeight: 700,
            color: "var(--text-hi)", letterSpacing: "-0.02em", margin: "4px 0 0",
          }}>
            {isToday ? "Hoy" : formatDateShort(selectedDate)}
          </h1>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <span className="badge badge-white">{GOAL_LABELS[profile.goal]}</span>
            <button className="badge badge-dim" style={{ cursor: "pointer" }}
              onClick={() => { setNewWeight(String(profile.weight)); setWeightModalOpen(true); }}>
              {profile.weight} kg
            </button>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ fontSize: 11 }}
          onClick={() => setCustomFoodModalOpen(true)}>
          <Icon name="plus" size={14} /> Crear alimento
        </button>
      </div>

      {/* ─── Calorie + Macros Summary ─── */}
      <div className="card" style={{ padding: isMobile ? 16 : 28, overflow: "visible" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr",
          alignItems: "center",
          gap: isMobile ? 16 : 0,
        }}>
          {/* Left stats */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 16,
            alignItems: isMobile ? "center" : "flex-end",
            paddingRight: isMobile ? 0 : 32,
          }}>
            <div style={{ textAlign: isMobile ? "center" : "right" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-lo)", marginBottom: 4, letterSpacing: "0.08em" }}>
                OBJETIVO
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 28, fontWeight: 700, color: "var(--text-hi)", letterSpacing: "-0.02em" }}>
                {Math.round(profile.targetKcal)}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-lo)" }}>kcal</div>
            </div>
          </div>

          {/* Donut center */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <CalorieDonut consumed={dayTotals.kcal} target={profile.targetKcal} size={isMobile ? 160 : 200} />
          </div>

          {/* Right stats */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 16,
            alignItems: isMobile ? "center" : "flex-start",
            paddingLeft: isMobile ? 0 : 32,
          }}>
            <div style={{ textAlign: isMobile ? "center" : "left" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-lo)", marginBottom: 4, letterSpacing: "0.08em" }}>
                CONSUMIDO
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 28, fontWeight: 700, color: MACRO_COLORS.kcal, letterSpacing: "-0.02em" }}>
                {Math.round(dayTotals.kcal)}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-lo)" }}>kcal</div>
            </div>
          </div>
        </div>

        {/* 4 Macro Rings */}
        <div style={{
          display: "flex", justifyContent: "space-around",
          marginTop: isMobile ? 20 : 28, paddingTop: 20, paddingBottom: 4,
          borderTop: "1px solid var(--border)",
        }}>
          <MacroRing value={dayTotals.protein} max={profile.targetProtein}
            label="Proteina" unit="g" color={MACRO_COLORS.protein} size={isMobile ? 68 : 88} />
          <MacroRing value={dayTotals.carbs} max={profile.targetCarbs}
            label="Carbos" unit="g" color={MACRO_COLORS.carbs} size={isMobile ? 68 : 88} />
          <MacroRing value={dayTotals.fat} max={profile.targetFat}
            label="Grasas" unit="g" color={MACRO_COLORS.fat} size={isMobile ? 68 : 88} />
          <MacroRing value={dayTotals.fiber} max={profile.targetFiber || 30}
            label="Fibra" unit="g" color={MACRO_COLORS.fiber} size={isMobile ? 68 : 88} />
        </div>
      </div>

      {/* ─── Calendar + Adherence ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: 16,
      }}>
        <div className="card" style={{ padding: 16 }}>
          <CalendarMini
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            loggedDates={loggedDates}
          />
        </div>
        <div className="card" style={{ padding: 16 }}>
          <WeeklyAdherence entries={weekEntries} profile={profile} />
        </div>
      </div>

      {/* ─── Meal Sections ─── */}
      {MEAL_SLOTS.map((slot) => (
        <MealSection
          key={slot.key}
          slot={slot}
          entries={dayEntries.filter((e) => e.meal === slot.key)}
          onAdd={() => setAddMeal(slot.key)}
          onDelete={handleDeleteEntry}
        />
      ))}

      {/* Quick date nav */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", paddingTop: 8 }}>
        <button className="btn btn-ghost" style={{ fontSize: 11 }}
          onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
          <Icon name="chevron-left" size={12} /> Dia anterior
        </button>
        {!isToday && (
          <button className="btn btn-ghost" style={{ fontSize: 11 }}
            onClick={() => setSelectedDate(today())}>
            Hoy
          </button>
        )}
        <button className="btn btn-ghost" style={{ fontSize: 11 }}
          onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
          Dia siguiente <Icon name="chevron-right" size={12} />
        </button>
      </div>

      {/* Weight chart */}
      <WeightChart logs={weightLogs} />

      {/* ─── Modals ─── */}
      {addMeal && (
        <AddFoodModal
          open={!!addMeal}
          onClose={() => setAddMeal(null)}
          meal={addMeal}
          date={selectedDate}
          onAdded={handleEntryAdded}
          customFoods={customFoods}
        />
      )}

      <CustomFoodModal
        open={customFoodModalOpen}
        onClose={() => setCustomFoodModalOpen(false)}
        onCreated={() => loadCustomFoods()}
      />

      <Modal open={weightModalOpen} onClose={() => setWeightModalOpen(false)} title="Registrar peso">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Peso actual (kg)</label>
            <input className="input" type="number" placeholder="70.0" step="0.1"
              value={newWeight} onChange={(e) => setNewWeight(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setWeightModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" disabled={savingWeight || !newWeight}
              style={{ opacity: savingWeight || !newWeight ? 0.4 : 1 }}
              onClick={handleLogWeight}>{savingWeight ? "Guardando..." : "Guardar"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
