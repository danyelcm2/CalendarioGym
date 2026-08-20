export const WEEK_DAYS = [
  { value: "monday", label: "Lunes", shortLabel: "Lun" },
  { value: "tuesday", label: "Martes", shortLabel: "Mar" },
  { value: "wednesday", label: "Miercoles", shortLabel: "Mie" },
  { value: "thursday", label: "Jueves", shortLabel: "Jue" },
  { value: "friday", label: "Viernes", shortLabel: "Vie" },
] as const;

export type DayOfWeek = (typeof WEEK_DAYS)[number]["value"];

export type WorkoutPlan = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Exercise = {
  id: string;
  user_id: string;
  plan_id: string;
  name: string;
  day_of_week: DayOfWeek;
  position: number;
  sets: number;
  reps: string;
  weight: string | null;
  rest_minutes: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ExerciseInput = {
  name: string;
  sets: number;
  reps: string;
  weight: string | null;
  rest_minutes: number | null;
  notes: string | null;
};
