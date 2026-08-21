import type { DayOfWeek, ExerciseInput } from "@/types/exercise";

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

const proExercises: RoutineExercise[] = [
  strength("monday", "Press de banca", 3, "10-12"),
  strength("monday", "Press de banca inclinado", 3, "10-12"),
  strength("monday", "Fly", 3, "10-12"),
  strength("monday", "Triceps cuerda", 3, "10-12"),
  strength("monday", "Triceps frances", 3, "10-12"),
  strength("monday", "Triceps frente", 3, "10-12"),
  strength("tuesday", "Remada curvada", 3, "10-12"),
  strength("tuesday", "Remada abierta", 3, "10-12"),
  strength("tuesday", "Tirada abierta", 3, "10-12"),
  strength("tuesday", "Rosca Scott", 3, "10-12"),
  strength("tuesday", "Rosca martillo", 3, "10-12"),
  strength("tuesday", "Rosca directa", 3, "10-12"),
  strength("wednesday", "Hack en cuclillas", 3, "10-12"),
  strength("wednesday", "Silla extensora", 3, "10-12"),
  strength("wednesday", "Aductora", 3, "10-12"),
  strength("wednesday", "Mesa flexora", 3, "10-12"),
  strength("wednesday", "Silla flexora", 3, "10-12"),
  strength("wednesday", "Prensa de piernas", 3, "10-12"),
  strength("thursday", "Crucifijo inverso", 3, "10-12"),
  strength("thursday", "Elevacion frontal", 3, "10-12"),
  strength("thursday", "Elevacion lateral", 3, "10-12"),
  strength("thursday", "Desarrollo de hombros", 3, "10-12"),
  strength("friday", "Triceps cuerda", 3, "10-12"),
  strength("friday", "Triceps frances", 3, "10-12"),
  strength("friday", "Triceps frente", 3, "10-12"),
  strength("friday", "Rosca directa", 3, "10-12"),
  strength("friday", "Rosca martillo", 3, "10-12"),
  strength("friday", "Rosca Scott", 3, "10-12"),
];

const beginnerExercises = proExercises.map((exercise) => ({
  ...exercise,
  sets: 2,
}));

const routineDayLabels: Partial<Record<DayOfWeek, string>> = {
  monday: "Pecho y triceps",
  tuesday: "Espalda y biceps",
  wednesday: "Pierna completa",
  thursday: "Hombro aislado",
  friday: "Biceps y triceps",
};

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: "beginner-split",
    name: "Split principiante",
    level: "Principiante",
    color: "blue",
    description: "Misma distribucion semanal con menos volumen por ejercicio.",
    dayLabels: routineDayLabels,
    exercises: beginnerExercises,
  },
  {
    id: "pro-split",
    name: "Split pro",
    level: "Pro",
    color: "purple",
    description: "Rutina semanal avanzada por grupos musculares.",
    dayLabels: routineDayLabels,
    exercises: proExercises,
  },
];
