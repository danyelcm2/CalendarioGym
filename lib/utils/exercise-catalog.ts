import type { DayOfWeek, ExerciseInput } from "@/types/exercise";

export const EXERCISE_CATALOG = [
  "Press banca",
  "Press inclinado con mancuernas",
  "Aperturas en polea",
  "Sentadilla",
  "Prensa de pierna",
  "Peso muerto rumano",
  "Hip thrust",
  "Dominadas",
  "Jalon al pecho",
  "Remo con barra",
  "Remo en maquina",
  "Press militar",
  "Elevaciones laterales",
  "Curl de biceps",
  "Extension de triceps",
  "Plancha",
  "Crunch en polea",
  "Caminadora",
  "Bicicleta estatica",
  "Eliptica",
  "Escaladora",
] as const;

type RoutineExercise = ExerciseInput & {
  day_of_week: DayOfWeek;
};

export type RoutineTemplate = {
  id: string;
  name: string;
  level: "Principiante" | "Pro";
  color: "blue" | "red" | "green" | "teal" | "purple" | "amber";
  description: string;
  dayLabels: Partial<Record<DayOfWeek, string>>;
  exercises: RoutineExercise[];
};

function strength(
  day_of_week: DayOfWeek,
  name: string,
  sets: number,
  reps: string,
  rest_minutes = 1.5,
): RoutineExercise {
  return {
    day_of_week,
    name,
    sets,
    reps,
    weight: null,
    rest_minutes,
    dropset_enabled: false,
    dropset_reps: null,
    dropset_weight: null,
    notes: null,
  };
}

function cardio(day_of_week: DayOfWeek, name: string, minutes: number): RoutineExercise {
  return {
    day_of_week,
    name,
    sets: 1,
    reps: `${minutes} min`,
    weight: null,
    rest_minutes: null,
    dropset_enabled: false,
    dropset_reps: null,
    dropset_weight: null,
    notes: "Cardio",
  };
}

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: "beginner-full-body",
    name: "Base principiante",
    level: "Principiante",
    color: "blue",
    description: "Fuerza general con volumen controlado y cardio suave.",
    dayLabels: {
      monday: "Full body A",
      tuesday: "Cardio",
      wednesday: "Full body B",
      thursday: "Movilidad",
      friday: "Full body C",
    },
    exercises: [
      strength("monday", "Sentadilla", 3, "10"),
      strength("monday", "Press banca", 3, "10"),
      strength("monday", "Jalon al pecho", 3, "10"),
      cardio("tuesday", "Caminadora", 25),
      strength("wednesday", "Peso muerto rumano", 3, "10"),
      strength("wednesday", "Press militar", 3, "10"),
      strength("wednesday", "Remo en maquina", 3, "12"),
      cardio("thursday", "Bicicleta estatica", 20),
      strength("friday", "Prensa de pierna", 3, "12"),
      strength("friday", "Press inclinado con mancuernas", 3, "10"),
      strength("friday", "Plancha", 3, "30 seg", 1),
    ],
  },
  {
    id: "pro-hypertrophy",
    name: "Hipertrofia pro",
    level: "Pro",
    color: "purple",
    description: "Push/pull/legs con accesorios y cardio estrategico.",
    dayLabels: {
      monday: "Push pesado",
      tuesday: "Pull",
      wednesday: "Pierna",
      thursday: "Push volumen",
      friday: "Full + cardio",
    },
    exercises: [
      strength("monday", "Press banca", 4, "6-8", 2),
      strength("monday", "Press militar", 4, "8"),
      strength("monday", "Extension de triceps", 3, "12"),
      strength("tuesday", "Dominadas", 4, "6-10", 2),
      strength("tuesday", "Remo con barra", 4, "8-10", 2),
      strength("tuesday", "Curl de biceps", 3, "12"),
      strength("wednesday", "Sentadilla", 4, "6-8", 2),
      strength("wednesday", "Peso muerto rumano", 4, "8-10", 2),
      strength("wednesday", "Hip thrust", 3, "10"),
      strength("thursday", "Press inclinado con mancuernas", 4, "10-12"),
      strength("thursday", "Aperturas en polea", 3, "12-15"),
      strength("thursday", "Elevaciones laterales", 4, "15"),
      strength("friday", "Remo en maquina", 3, "12"),
      strength("friday", "Prensa de pierna", 3, "12"),
      cardio("friday", "Escaladora", 18),
    ],
  },
];
