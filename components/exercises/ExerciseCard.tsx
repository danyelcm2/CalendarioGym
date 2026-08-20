"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Check, GripVertical, Pencil, Trash2 } from "lucide-react";

import type { Exercise } from "@/types/exercise";

type ExerciseCardProps = {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
  onToggleComplete: (exercise: Exercise) => void;
};

export function ExerciseCard({
  exercise,
  onEdit,
  onDelete,
  onToggleComplete,
}: ExerciseCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: exercise.id,
    data: {
      type: "exercise",
      day: exercise.day_of_week,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`group rounded-[18px] border border-[#dfe6df] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-4 dark:border-[#334238] dark:bg-[#101711] ${
        isDragging ? "opacity-45 ring-2 ring-[#4f8f7c]" : ""
      } ${
        exercise.completed ? "bg-[#f4fbf6] dark:bg-[#101f16]" : ""
      }`}
    >
      <div className="flex items-start gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={() => onToggleComplete(exercise)}
          className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border transition sm:size-8 ${
            exercise.completed
              ? "border-[#1f6a3d] bg-[#1f6a3d] text-white dark:border-[#9ee4b4] dark:bg-[#9ee4b4] dark:text-[#101711]"
              : "border-[#cfd8cf] bg-white text-transparent hover:border-[#4f8f7c] dark:border-[#334238] dark:bg-[#101711]"
          }`}
          aria-label={
            exercise.completed
              ? `Marcar ${exercise.name} como pendiente`
              : `Marcar ${exercise.name} como completado`
          }
          title={exercise.completed ? "Completado" : "Marcar completado"}
        >
          <Check size={17} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="mt-0.5 flex size-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-xl text-[#9aa39a] transition hover:bg-[#eef3ef] hover:text-[#17201a] active:cursor-grabbing sm:size-8 dark:text-[#6f7d72] dark:hover:bg-[#223027] dark:hover:text-[#f7fbf6]"
          aria-label={`Arrastrar ${exercise.name}`}
          title="Arrastrar"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => onEdit(exercise)}
          className="min-w-0 flex-1 text-left"
        >
          <h3 className="break-words text-sm font-semibold leading-5 text-[#17201a] dark:text-[#f7fbf6]">
            {exercise.name}
          </h3>
          <p className="mt-1 text-sm leading-5 text-[#647067] dark:text-[#a8b4aa]">
            {exercise.sets} series x {exercise.reps} repeticiones
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {exercise.weight ? (
              <span className="rounded-full bg-[#edf7f5] px-2.5 py-1 text-xs font-medium text-[#2b7266] dark:bg-[#17322b] dark:text-[#a6f2df]">
                {exercise.weight}
              </span>
            ) : null}
            {exercise.rest_minutes ? (
              <span className="rounded-full bg-[#f3f0e8] px-2.5 py-1 text-xs font-medium text-[#6c5d35] dark:bg-[#322b18] dark:text-[#f0d991]">
                {exercise.rest_minutes} min
              </span>
            ) : null}
          </div>
          {exercise.notes ? (
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#68746b] dark:text-[#a8b4aa]">
              {exercise.notes}
            </p>
          ) : null}
        </button>

        <div className="flex shrink-0 flex-col items-center gap-1 opacity-100 transition sm:flex-row sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(exercise)}
            className="flex size-9 items-center justify-center rounded-xl text-[#647067] transition hover:bg-[#eef3ef] hover:text-[#17201a] sm:size-8 dark:text-[#a8b4aa] dark:hover:bg-[#223027] dark:hover:text-[#f7fbf6]"
            aria-label={`Editar ${exercise.name}`}
            title="Editar"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(exercise)}
            className="flex size-9 items-center justify-center rounded-xl text-[#a63d2b] transition hover:bg-[#fff0ed] sm:size-8 dark:text-[#ff9a88] dark:hover:bg-[#3a1f1b]"
            aria-label={`Eliminar ${exercise.name}`}
            title="Eliminar"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
