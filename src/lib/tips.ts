export interface Tip {
  id: number;
  text: string;
  category: "nutricion" | "mente" | "entrenamiento" | "descanso" | "motivacion";
  icon: string;
}

export const DAILY_TIPS: Tip[] = [
  // ── Nutricion (14) ──
  {
    id: 1,
    text: "Come proteína antes de algo azucarado para evitar picos de insulina.",
    category: "nutricion",
    icon: "heart",
  },
  {
    id: 2,
    text: "Beber agua antes de comer reduce el apetito hasta un 30%.",
    category: "nutricion",
    icon: "heart",
  },
  {
    id: 3,
    text: "El aceite de oliva virgen extra en ayunas activa el metabolismo y mejora la absorción de nutrientes.",
    category: "nutricion",
    icon: "heart",
  },
  {
    id: 4,
    text: "Los alimentos fermentados como el kéfir o el chucrut mejoran la microbiota y el estado de ánimo.",
    category: "nutricion",
    icon: "heart",
  },
  {
    id: 5,
    text: "Masticar despacio y conscientemente reduce la ingesta calórica hasta un 20%.",
    category: "nutricion",
    icon: "heart",
  },
  {
    id: 6,
    text: "Las nueces en el desayuno reducen el hambre a lo largo del día gracias a sus grasas saludables.",
    category: "nutricion",
    icon: "heart",
  },
  {
    id: 7,
    text: "Cocinar con cúrcuma y pimienta negra juntas potencia el efecto antiinflamatorio de la curcumina x20.",
    category: "nutricion",
    icon: "heart",
  },
  {
    id: 8,
    text: "Comer en platos más pequeños reduce la ingesta sin que tu cerebro lo perciba como restricción.",
    category: "nutricion",
    icon: "heart",
  },
  {
    id: 9,
    text: "La fibra soluble de la avena baja el colesterol LDL y estabiliza el azúcar en sangre.",
    category: "nutricion",
    icon: "heart",
  },
  {
    id: 10,
    text: "Distribuir la proteína en 3-4 comidas maximiza la síntesis muscular mejor que concentrarla en una sola.",
    category: "nutricion",
    icon: "heart",
  },
  {
    id: 11,
    text: "Los arándanos contienen pterostilbeno, que mejora la memoria y protege las neuronas.",
    category: "nutricion",
    icon: "heart",
  },
  {
    id: 12,
    text: "Prioriza carbohidratos complejos: avena, boniato y arroz integral liberan energía de forma sostenida.",
    category: "nutricion",
    icon: "heart",
  },
  {
    id: 13,
    text: "El magnesio presente en espinacas y almendras reduce el cortisol y mejora el sueño.",
    category: "nutricion",
    icon: "heart",
  },
  {
    id: 14,
    text: "Saltarse el desayuno no adelgaza más; lo que importa es el balance calórico del día completo.",
    category: "nutricion",
    icon: "heart",
  },

  // ── Mente (14) ──
  {
    id: 15,
    text: "Compites contra tu yo de hace unos meses, no contra los demás.",
    category: "mente",
    icon: "book",
  },
  {
    id: 16,
    text: "Sigue así, eres muy valioso y haces lo que puedes para mejorar cada día.",
    category: "mente",
    icon: "book",
  },
  {
    id: 17,
    text: "5 minutos de respiración profunda reducen el cortisol más que 30 minutos de descanso pasivo.",
    category: "mente",
    icon: "book",
  },
  {
    id: 18,
    text: "Escribir 3 cosas por las que estás agradecido cada noche cambia la estructura cerebral en 3 semanas.",
    category: "mente",
    icon: "book",
  },
  {
    id: 19,
    text: "El cerebro no distingue entre un fracaso real e imaginado; visualiza el éxito para entrenarlo.",
    category: "mente",
    icon: "book",
  },
  {
    id: 20,
    text: "La meditación de 10 minutos diarios aumenta el grosor de la corteza prefrontal en 8 semanas.",
    category: "mente",
    icon: "book",
  },
  {
    id: 21,
    text: "Leer ficción desarrolla la empatía y la inteligencia emocional tanto como la terapia.",
    category: "mente",
    icon: "book",
  },
  {
    id: 22,
    text: "El estrés crónico reduce el hipocampo. El ejercicio aeróbico lo hace crecer de nuevo.",
    category: "mente",
    icon: "book",
  },
  {
    id: 23,
    text: "Aprender algo nuevo activa la dopamina. Eso explica por qué la curiosidad se retroalimenta sola.",
    category: "mente",
    icon: "book",
  },
  {
    id: 24,
    text: "Hablar con uno mismo en tercera persona reduce la ansiedad y mejora la toma de decisiones.",
    category: "mente",
    icon: "book",
  },
  {
    id: 25,
    text: "El contacto con la naturaleza durante 20 minutos al día baja la presión arterial y el cortisol.",
    category: "mente",
    icon: "book",
  },
  {
    id: 26,
    text: "No eres tus pensamientos; eres quien los observa. Esa distancia es la base de la resiliencia.",
    category: "mente",
    icon: "book",
  },
  {
    id: 27,
    text: "Celebrar los pequeños progresos libera dopamina y refuerza el hábito. Nunca trivialices un logro.",
    category: "mente",
    icon: "book",
  },
  {
    id: 28,
    text: "Poner nombre a una emoción reduce su intensidad en el cerebro. Nómbrala para dominarla.",
    category: "mente",
    icon: "book",
  },

  // ── Entrenamiento (14) ──
  {
    id: 29,
    text: "El músculo se construye en el descanso, no en el gimnasio.",
    category: "entrenamiento",
    icon: "zap",
  },
  {
    id: 30,
    text: "La constancia supera siempre a la intensidad. Tres días moderados cada semana valen más que un día explosivo.",
    category: "entrenamiento",
    icon: "zap",
  },
  {
    id: 31,
    text: "El calentamiento dinámico reduce lesiones un 54% y mejora el rendimiento en el primer ejercicio.",
    category: "entrenamiento",
    icon: "zap",
  },
  {
    id: 32,
    text: "Los ejercicios compuestos (sentadilla, peso muerto, press) activan más músculo y más hormonas anabólicas.",
    category: "entrenamiento",
    icon: "zap",
  },
  {
    id: 33,
    text: "Aumentar el peso un 2,5% semanal es suficiente para progresar sin sobrecargar las articulaciones.",
    category: "entrenamiento",
    icon: "zap",
  },
  {
    id: 34,
    text: "20 minutos de cardio en zona 2 (puedes hablar) mejoran la salud cardiovascular más que sprints ocasionales.",
    category: "entrenamiento",
    icon: "zap",
  },
  {
    id: 35,
    text: "El entrenamiento de fuerza 2 veces por semana reduce el riesgo de muerte prematura un 23%.",
    category: "entrenamiento",
    icon: "zap",
  },
  {
    id: 36,
    text: "Estirar después del entrenamiento mejora la flexibilidad y reduce el dolor muscular post-ejercicio.",
    category: "entrenamiento",
    icon: "zap",
  },
  {
    id: 37,
    text: "La técnica correcta siempre por encima del peso. Un ego alto lleva a lesiones que paran meses.",
    category: "entrenamiento",
    icon: "zap",
  },
  {
    id: 38,
    text: "Caminar 8.000 pasos diarios reduce la mortalidad por todas las causas tanto como correr.",
    category: "entrenamiento",
    icon: "zap",
  },
  {
    id: 39,
    text: "La variabilidad en el entrenamiento previene el estancamiento: cambia el orden, el tempo o el descanso.",
    category: "entrenamiento",
    icon: "zap",
  },
  {
    id: 40,
    text: "El entrenamiento en ayunas puede aumentar la oxidación de grasas, pero perjudica el rendimiento de alta intensidad.",
    category: "entrenamiento",
    icon: "zap",
  },
  {
    id: 41,
    text: "Músculo quemado en el gimnasio es el activo más rentable: eleva el metabolismo basal los 7 días de la semana.",
    category: "entrenamiento",
    icon: "zap",
  },
  {
    id: 42,
    text: "La creatina monohidrato es el suplemento más estudiado y seguro para mejorar fuerza y recuperación.",
    category: "entrenamiento",
    icon: "zap",
  },

  // ── Descanso (14) ──
  {
    id: 43,
    text: "Dormir menos de 7 horas aumenta el cortisol y reduce la testosterona hasta un 15%.",
    category: "descanso",
    icon: "moon",
  },
  {
    id: 44,
    text: "La temperatura ideal para dormir es entre 16 y 19 °C. El frío facilita la conciliación del sueño.",
    category: "descanso",
    icon: "moon",
  },
  {
    id: 45,
    text: "La luz azul suprime la melatonina. Activa el modo nocturno o usa gafas ámbar 2 horas antes de dormir.",
    category: "descanso",
    icon: "moon",
  },
  {
    id: 46,
    text: "Mantener el mismo horario de sueño los fines de semana consolida el ritmo circadiano.",
    category: "descanso",
    icon: "moon",
  },
  {
    id: 47,
    text: "Una siesta de 20 minutos antes de las 15:00 restaura la alerta sin afectar el sueño nocturno.",
    category: "descanso",
    icon: "moon",
  },
  {
    id: 48,
    text: "El magnesio glicinato antes de dormir mejora la profundidad del sueño y reduce el tiempo para dormirse.",
    category: "descanso",
    icon: "moon",
  },
  {
    id: 49,
    text: "La cafeína tiene una vida media de 5-7 horas. Tu café de las 15:00 aún está activo a medianoche.",
    category: "descanso",
    icon: "moon",
  },
  {
    id: 50,
    text: "El sueño profundo es cuando el cerebro limpia la proteína beta-amiloide, asociada al Alzheimer.",
    category: "descanso",
    icon: "moon",
  },
  {
    id: 51,
    text: "Leer un libro físico antes de dormir reduce el tiempo para conciliar el sueño hasta un 68%.",
    category: "descanso",
    icon: "moon",
  },
  {
    id: 52,
    text: "La privación de sueño duplica el riesgo de accidente de tráfico. Descansar no es perder tiempo.",
    category: "descanso",
    icon: "moon",
  },
  {
    id: 53,
    text: "Dormir bien en un cuarto oscuro potencia la producción de melatonina hasta 10 veces más.",
    category: "descanso",
    icon: "moon",
  },
  {
    id: 54,
    text: "El ruido blanco o rosa a bajo volumen reduce el tiempo hasta dormirse y mejora la calidad del sueño.",
    category: "descanso",
    icon: "moon",
  },
  {
    id: 55,
    text: "El ejercicio mejora el sueño, pero hacerlo 1-2 horas antes de acostarse puede retrasarlo.",
    category: "descanso",
    icon: "moon",
  },
  {
    id: 56,
    text: "Una hora de sueño perdida por noche acumula una deuda que puede tardar semanas en recuperarse.",
    category: "descanso",
    icon: "moon",
  },

  // ── Motivacion (14) ──
  {
    id: 57,
    text: "Roma no se construyó en un día, pero se construía todos los días.",
    category: "motivacion",
    icon: "star",
  },
  {
    id: 58,
    text: "El progreso no es lineal, pero siempre es real si sigues moviéndote.",
    category: "motivacion",
    icon: "star",
  },
  {
    id: 59,
    text: "La disciplina es elegir entre lo que quieres ahora y lo que más quieres en el futuro.",
    category: "motivacion",
    icon: "star",
  },
  {
    id: 60,
    text: "No tienes que ser perfecto para ser exitoso. Tienes que ser consistente.",
    category: "motivacion",
    icon: "star",
  },
  {
    id: 61,
    text: "El mejor momento para empezar era ayer. El segundo mejor momento es ahora.",
    category: "motivacion",
    icon: "star",
  },
  {
    id: 62,
    text: "Cada repetición, cada comida sana, cada noche de sueño es un voto por la persona que quieres ser.",
    category: "motivacion",
    icon: "star",
  },
  {
    id: 63,
    text: "Los malos días son parte del proceso. No los cuentes como fracasos; cuéntalos como datos.",
    category: "motivacion",
    icon: "star",
  },
  {
    id: 64,
    text: "Tu cuerpo puede aguantar casi cualquier cosa. Es tu mente la que necesita convencerse.",
    category: "motivacion",
    icon: "star",
  },
  {
    id: 65,
    text: "Compara tu versión actual con la de hace 6 meses. Ese es el único ranking que importa.",
    category: "motivacion",
    icon: "star",
  },
  {
    id: 66,
    text: "La motivación te arranca; el hábito te lleva. Construye sistemas, no metas.",
    category: "motivacion",
    icon: "star",
  },
  {
    id: 67,
    text: "Un 1% mejor cada día equivale a ser 37 veces mejor en un año. La mejora compuesta funciona.",
    category: "motivacion",
    icon: "star",
  },
  {
    id: 68,
    text: "No busques inspiración para empezar. Empieza y la inspiración aparecerá en el camino.",
    category: "motivacion",
    icon: "star",
  },
  {
    id: 69,
    text: "El dolor del esfuerzo dura poco. El dolor del arrepentimiento dura toda la vida.",
    category: "motivacion",
    icon: "star",
  },
  {
    id: 70,
    text: "Eres capaz de mucho más de lo que crees. La única forma de comprobarlo es intentándolo.",
    category: "motivacion",
    icon: "star",
  },
];

/**
 * Returns a deterministic tip for today based on the day of the year.
 * The same tip is shown all day; it changes every day.
 */
export function getTodayTip(): Tip {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
}
