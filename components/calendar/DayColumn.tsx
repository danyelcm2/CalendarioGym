"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

import { ExerciseCard } from "@/components/exercises/ExerciseCard";
import { Button } from "@/components/ui/Button";
import type { DayOfWeek, Exercise } from "@/types/exercise";

type DayColumnProps = {
  day: {
    value: DayOfWeek;
    label: string;
    shortLabel: string;
  };
  exercises: Exercise[];
  onAdd: (day: DayOfWeek) => void;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
};

export function DayColumn({
  day,
  exercises,
  onAdd,
  onEdit,
  onDelete,
}: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: day.value,
    data: {
      type: "day",
      day: day.value,
    },
  });

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-[calc(100svh-18rem)] w-full min-w-0 flex-col rounded-[22px] border p-3 transition sm:p-4 md:min-h-[30rem] ${
        isOver
          ? "border-[#4f8f7c] bg-[#edf8f5] shadow-[0_18px_50px_rgba(79,143,124,0.16)]"
          : "border-white/80 bg-white/[0.72] shadow-sm"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a857d]">
            {day.shortLabel}
          </p>
          <h2 className="text-lg font-semibold text-[#17201a] sm:text-xl">
            {day.label}
          </h2>
        </div>
        <span className="rounded-full bg-[#edf1ec] px-3 py-1 text-xs font-semibold text-[#4d5b50]">
          {exercises.length}
        </span>
      </div>

      <SortableContext
        items={exercises.map((exercise) => exercise.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-2.5 sm:gap-3">
          {exercises.length > 0 ? (
            exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <div className="flex min-h-40 flex-1 items-center justify-center rounded-[20px] border border-dashed border-[#cfd8cf] bg-white/[0.46] px-4 text-center text-sm text-[#7a857d]">
              Sin ejercicios
            </div>
          )}
        </div>
      </SortableContext>

      <Button
        type="button"
        variant="secondary"
        className="mt-4 w-full"
        onClick={() => onAdd(day.value)}
        icon={<Plus size={17} aria-hidden="true" />}
      >
        Agregar ejercicio
      </Button>
    </section>
  );
}
