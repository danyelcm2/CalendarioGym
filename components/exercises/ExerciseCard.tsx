"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Check, GripVertical, Pencil, Trash2 } from "lucide-react";

import { formatWeightLabel } from "@/lib/utils/weights";
import type { WeightUnit } from "@/lib/utils/weights";
import type { Exercise } from "@/types/exercise";

type ExerciseCardProps = {
  exercise: Exercise;
  weightUnit: WeightUnit;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
  onToggleComplete: (exercise: Exercise) => void;
};

export function ExerciseCard({
  exercise,
  weightUnit,
  onEdit,
  onDelete,
  onToggleComplete,
}: ExerciseCardProps) {
  const weightLabel = formatWeightLabel(exercise.weight, weightUnit);
  const dropsetWeightLabel = formatWeightLabel(exercise.dropset_weight, weightUnit);
  const isCardio = exercise.notes?.toLowerCase().includes("cardio") ?? false;

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
      className={`group rounded-[18px] border border-[#dfe6df] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-4 dark:border-[#31445f] dark:bg-[#111827] ${
        isDragging ? "opacity-45 ring-2 ring-[#4f8f7c]" : ""
      } ${
        exercise.completed ? "bg-[#f4fbf6] dark:bg-[#1e3a5f]" : ""
      }`}
    >
      <div className="flex items-start gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={() => onToggleComplete(exercise)}
          className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border transition sm:size-8 ${
            exercise.completed
              ? "border-[#1f6a3d] bg-[#1f6a3d] text-white dark:border-[#bfdbfe] dark:bg-[#bfdbfe] dark:text-[#0f172a]"
              : "border-[#cfd8cf] bg-white text-transparent hover:border-[#4f8f7c] dark:border-[#31445f] dark:bg-[#111827]"
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
          className="mt-0.5 flex size-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-xl text-[#9aa39a] transition hover:bg-[#eef3ef] hover:text-[#17201a] active:cursor-grabbing sm:size-8 dark:text-[#6f7d72] dark:hover:bg-[#22314a] dark:hover:text-[#f7fbf6]"
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
          <h3 className="break-words text-sm font-semibold leading-5 text-[#17201a] dark:text-[#f8fbff]">
            {exercise.name}
          </h3>
          <p className="mt-1 text-sm leading-5 text-[#647067] dark:text-[#b8c6d8]">
            {isCardio
              ? `${exercise.reps} de cardio`
              : `${exercise.sets} series x ${exercise.reps} repeticiones`}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {weightLabel ? (
              <span className="rounded-full bg-[#edf7f5] px-2.5 py-1 text-xs font-medium text-[#2b7266] dark:bg-[#1e3a5f] dark:text-[#bfdbfe]">
                {weightLabel}
              </span>
            ) : null}
            {exercise.rest_minutes ? (
              <span className="rounded-full bg-[#f3f0e8] px-2.5 py-1 text-xs font-medium text-[#6c5d35] dark:bg-[#322b18] dark:text-[#f0d991]">
                {exercise.rest_minutes} min
              </span>
            ) : null}
            {exercise.dropset_enabled ? (
              <span className="rounded-full bg-[#fff1f2] px-2.5 py-1 text-xs font-medium text-[#be123c] dark:bg-[#3f1518] dark:text-[#fda4af]">
                Dropset
              </span>
            ) : null}
            {isCardio ? (
              <span className="rounded-full bg-[#eff6ff] px-2.5 py-1 text-xs font-medium text-[#1d4ed8] dark:bg-[#1e3a5f] dark:text-[#bfdbfe]">
                Cardio
              </span>
            ) : null}
          </div>
          {exercise.dropset_enabled ? (
            <p className="mt-3 rounded-2xl bg-[#fff8f8] px-3 py-2 text-xs leading-5 text-[#8f2d3d] dark:bg-[#251416] dark:text-[#fda4af]">
              Continua con {exercise.dropset_reps || "--"} reps
              {dropsetWeightLabel ? ` · ${dropsetWeightLabel}` : ""}
            </p>
          ) : null}
          {exercise.notes && exercise.notes.toLowerCase() !== "cardio" ? (
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#68746b] dark:text-[#b8c6d8]">
              {exercise.notes}
            </p>
          ) : null}
        </button>

        <div className="flex shrink-0 flex-col items-center gap-1 opacity-100 transition sm:flex-row sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(exercise)}
            className="flex size-9 items-center justify-center rounded-xl text-[#647067] transition hover:bg-[#eef3ef] hover:text-[#17201a] sm:size-8 dark:text-[#b8c6d8] dark:hover:bg-[#22314a] dark:hover:text-[#f7fbf6]"
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
