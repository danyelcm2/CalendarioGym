"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Pencil, Plus } from "lucide-react";

import { ExerciseCard } from "@/components/exercises/ExerciseCard";
import { Button } from "@/components/ui/Button";
import type { WeightUnit } from "@/lib/utils/weights";
import type { DayOfWeek, Exercise } from "@/types/exercise";

type DayColumnProps = {
  day: {
    value: DayOfWeek;
    label: string;
    shortLabel: string;
  };
  dayLabel: string;
  exercises: Exercise[];
  weightUnit: WeightUnit;
  onAdd: (day: DayOfWeek) => void;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
  onToggleComplete: (exercise: Exercise) => void;
  onRenameDay: (day: DayOfWeek) => void;
};

export function DayColumn({
  day,
  dayLabel,
  exercises,
  weightUnit,
  onAdd,
  onEdit,
  onDelete,
  onToggleComplete,
  onRenameDay,
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
          ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_18px_50px_rgba(79,143,124,0.16)] dark:bg-[#1e3a5f]"
          : "border-white/80 bg-white/[0.72] shadow-sm dark:border-[#31445f] dark:bg-[#172033]/[0.72]"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a857d] dark:text-[#b8c6d8]">
            {day.shortLabel}
          </p>
          <h2 className="break-words text-lg font-semibold uppercase text-[#17201a] sm:text-xl dark:text-[#f8fbff]">
            {dayLabel || day.label}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onRenameDay(day.value)}
            className="flex size-9 items-center justify-center rounded-xl text-[#647067] transition hover:bg-[#eef3ef] dark:text-[#b8c6d8] dark:hover:bg-[#22314a]"
            aria-label={`Cambiar nombre de ${day.label}`}
            title="Cambiar nombre"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <span className="rounded-full bg-[#edf1ec] px-3 py-1 text-xs font-semibold text-[#4d5b50] dark:bg-[#22314a] dark:text-[#dbe7f6]">
            {exercises.length}
          </span>
        </div>
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
                weightUnit={weightUnit}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
              />
            ))
          ) : (
            <div className="flex min-h-40 flex-1 items-center justify-center rounded-[20px] border border-dashed border-[#cfd8cf] bg-white/[0.46] px-4 text-center text-sm text-[#7a857d] dark:border-[#31445f] dark:bg-[#111827]/[0.55] dark:text-[#b8c6d8]">
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
