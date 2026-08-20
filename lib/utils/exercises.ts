import { WEEK_DAYS, type DayOfWeek, type Exercise } from "@/types/exercise";

export type ExerciseGroups = Record<DayOfWeek, Exercise[]>;

export function groupExercises(exercises: Exercise[]): ExerciseGroups {
  const groups = WEEK_DAYS.reduce((accumulator, day) => {
    accumulator[day.value] = [];
    return accumulator;
  }, {} as ExerciseGroups);

  exercises
    .slice()
    .sort((a, b) => a.position - b.position)
    .forEach((exercise) => {
      groups[exercise.day_of_week].push(exercise);
    });

  return groups;
}

export function flattenGroups(groups: ExerciseGroups) {
  return WEEK_DAYS.flatMap((day) =>
    groups[day.value].map((exercise, index) => ({
      ...exercise,
      day_of_week: day.value,
      position: index,
    })),
  );
}

export function isDayOfWeek(value: string): value is DayOfWeek {
  return WEEK_DAYS.some((day) => day.value === value);
}
