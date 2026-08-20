import type { Exercise, WorkoutPlan } from "@/types/exercise";

export const PLAN_COLORS = [
  {
    value: "blue",
    label: "Azul",
    dot: "bg-[#3b82f6]",
    border: "border-t-[#3b82f6]",
    soft: "bg-[#eff6ff] text-[#1d4ed8] dark:bg-[#13233f] dark:text-[#93c5fd]",
  },
  {
    value: "red",
    label: "Rojo",
    dot: "bg-[#ef4444]",
    border: "border-t-[#ef4444]",
    soft: "bg-[#fff1f2] text-[#be123c] dark:bg-[#3f1518] dark:text-[#fda4af]",
  },
  {
    value: "green",
    label: "Verde",
    dot: "bg-[#22c55e]",
    border: "border-t-[#22c55e]",
    soft: "bg-[#f0fdf4] text-[#15803d] dark:bg-[#112c1a] dark:text-[#86efac]",
  },
  {
    value: "teal",
    label: "Teal",
    dot: "bg-[#14b8a6]",
    border: "border-t-[#14b8a6]",
    soft: "bg-[#f0fdfa] text-[#0f766e] dark:bg-[#12312d] dark:text-[#99f6e4]",
  },
  {
    value: "purple",
    label: "Morado",
    dot: "bg-[#8b5cf6]",
    border: "border-t-[#8b5cf6]",
    soft: "bg-[#f5f3ff] text-[#6d28d9] dark:bg-[#241a3d] dark:text-[#c4b5fd]",
  },
  {
    value: "amber",
    label: "Ambar",
    dot: "bg-[#f59e0b]",
    border: "border-t-[#f59e0b]",
    soft: "bg-[#fffbeb] text-[#b45309] dark:bg-[#34240d] dark:text-[#fcd34d]",
  },
] as const;

export type PlanColor = (typeof PLAN_COLORS)[number]["value"];

export function getPlanColor(value: string | null | undefined) {
  return PLAN_COLORS.find((color) => color.value === value) ?? PLAN_COLORS[3];
}

export function inferPlanColor(name: string): PlanColor {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes("fuerza")) {
    return "red";
  }

  if (
    normalizedName.includes("pierna") ||
    normalizedName.includes("legs") ||
    normalizedName.includes("glute")
  ) {
    return "green";
  }

  if (
    normalizedName.includes("hipertrofia") ||
    normalizedName.includes("push") ||
    normalizedName.includes("pull")
  ) {
    return "blue";
  }

  if (normalizedName.includes("volumen")) {
    return "purple";
  }

  return "teal";
}

function normalizeExerciseName(name: string) {
  return name.trim().toLowerCase();
}

function parseWeight(weight: string | null) {
  if (!weight) {
    return null;
  }

  const match = weight.replace(",", ".").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function parseReps(reps: string) {
  const match = reps.match(/\d+/);
  return match ? Number(match[0]) : null;
}

export type PersonalRecord = {
  name: string;
  weight: number | null;
  estimatedMax: number | null;
  sets: number;
  reps: string;
};

export function getPersonalRecords(exercises: Exercise[], limit = 4) {
  const records = new Map<string, PersonalRecord>();

  exercises.forEach((exercise) => {
    const weight = parseWeight(exercise.weight);
    const reps = parseReps(exercise.reps);

    if (!weight && !reps) {
      return;
    }

    const estimatedMax = weight && reps ? weight * (1 + reps / 30) : weight;
    const key = normalizeExerciseName(exercise.name);
    const current = records.get(key);

    if (
      !current ||
      (estimatedMax ?? 0) > (current.estimatedMax ?? 0) ||
      ((estimatedMax ?? 0) === (current.estimatedMax ?? 0) &&
        (weight ?? 0) > (current.weight ?? 0))
    ) {
      records.set(key, {
        name: exercise.name,
        weight,
        estimatedMax,
        sets: exercise.sets,
        reps: exercise.reps,
      });
    }
  });

  return Array.from(records.values())
    .sort((a, b) => (b.estimatedMax ?? 0) - (a.estimatedMax ?? 0))
    .slice(0, limit);
}

export function getPlanExerciseCount(plan: WorkoutPlan, exercises: Exercise[]) {
  return exercises.filter((exercise) => exercise.plan_id === plan.id).length;
}
