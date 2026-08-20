"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

import type { Exercise } from "@/types/exercise";

type ExerciseCardProps = {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
};

export function ExerciseCard({ exercise, onEdit, onDelete }: ExerciseCardProps) {
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
      className={`group rounded-[18px] border border-[#dfe6df] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isDragging ? "opacity-45 ring-2 ring-[#4f8f7c]" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-0.5 flex size-8 shrink-0 cursor-grab items-center justify-center rounded-xl text-[#9aa39a] transition hover:bg-[#eef3ef] hover:text-[#17201a] active:cursor-grabbing"
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
          <h3 className="truncate text-sm font-semibold text-[#17201a]">
            {exercise.name}
          </h3>
          <p className="mt-1 text-sm text-[#647067]">
            {exercise.sets} series x {exercise.reps} repeticiones
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {exercise.weight ? (
              <span className="rounded-full bg-[#edf7f5] px-2.5 py-1 text-xs font-medium text-[#2b7266]">
                {exercise.weight}
              </span>
            ) : null}
            {exercise.rest_seconds ? (
              <span className="rounded-full bg-[#f3f0e8] px-2.5 py-1 text-xs font-medium text-[#6c5d35]">
                {exercise.rest_seconds}s
              </span>
            ) : null}
          </div>
          {exercise.notes ? (
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#68746b]">
              {exercise.notes}
            </p>
          ) : null}
        </button>

        <div className="flex shrink-0 items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(exercise)}
            className="flex size-8 items-center justify-center rounded-xl text-[#647067] transition hover:bg-[#eef3ef] hover:text-[#17201a]"
            aria-label={`Editar ${exercise.name}`}
            title="Editar"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(exercise)}
            className="flex size-8 items-center justify-center rounded-xl text-[#a63d2b] transition hover:bg-[#fff0ed]"
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
