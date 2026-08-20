"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CalendarDays, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

import { DayColumn } from "@/components/calendar/DayColumn";
import { ExerciseModal } from "@/components/exercises/ExerciseModal";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { createClient } from "@/lib/supabase/client";
import { addWeeks, formatDateInput, formatWeekRange, getMonday } from "@/lib/utils/date";
import {
  flattenGroups,
  groupExercises,
  isDayOfWeek,
  type ExerciseGroups,
} from "@/lib/utils/exercises";
import { WEEK_DAYS, type DayOfWeek, type Exercise, type ExerciseInput } from "@/types/exercise";

type WeeklyCalendarProps = {
  userId: string;
};

type ModalState =
  | { mode: "create"; day: DayOfWeek; exercise: null }
  | { mode: "edit"; day: DayOfWeek; exercise: Exercise }
  | null;

export function WeeklyCalendar({ userId }: WeeklyCalendarProps) {
  const [weekStart, setWeekStart] = useState(() => getMonday());
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "saving">("loading");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const weekStartKey = formatDateInput(weekStart);
  const groupedExercises = useMemo(() => groupExercises(exercises), [exercises]);
  const weekRange = formatWeekRange(weekStart);
  const currentDayLabel = modal
    ? WEEK_DAYS.find((day) => day.value === modal.day)?.label ?? ""
    : "";

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const loadExercises = useCallback(async () => {
    setStatus("loading");
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("exercises")
      .select("*")
      .eq("week_start_date", weekStartKey)
      .order("position", { ascending: true });

    if (fetchError) {
      setError("No pudimos cargar tus ejercicios.");
      setExercises([]);
      setStatus("idle");
      return;
    }

    setExercises((data ?? []) as Exercise[]);
    setStatus("idle");
  }, [supabase, weekStartKey]);

  useEffect(() => {
    void loadExercises();
  }, [loadExercises]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = window.setTimeout(() => setNotice(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  async function persistPositions(nextExercises: Exercise[], days: DayOfWeek[]) {
    const uniqueDays = Array.from(new Set(days));
    const updates = nextExercises.filter((exercise) =>
      uniqueDays.includes(exercise.day_of_week),
    );

    const results = await Promise.all(
      updates.map((exercise) =>
        supabase
          .from("exercises")
          .update({
            day_of_week: exercise.day_of_week,
            position: exercise.position,
            week_start_date: weekStartKey,
          })
          .eq("id", exercise.id),
      ),
    );

    const failed = results.find((result) => result.error);

    if (failed?.error) {
      throw failed.error;
    }
  }

  function getTargetDay(overId: string, groups: ExerciseGroups) {
    if (isDayOfWeek(overId)) {
      return overId;
    }

    return WEEK_DAYS.find((day) =>
      groups[day.value].some((exercise) => exercise.id === overId),
    )?.value;
  }

  function handleDragStart(event: DragStartEvent) {
    const exercise = exercises.find((item) => item.id === String(event.active.id));
    setActiveExercise(exercise ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveExercise(null);

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const previousExercises = exercises;
    const groups = groupExercises(previousExercises);
    const movingExercise = previousExercises.find((exercise) => exercise.id === activeId);

    if (!movingExercise) {
      return;
    }

    const sourceDay = movingExercise.day_of_week;
    const targetDay = getTargetDay(overId, groups);

    if (!targetDay) {
      return;
    }

    if (sourceDay === targetDay && !isDayOfWeek(overId)) {
      const dayItems = groups[sourceDay];
      const oldIndex = dayItems.findIndex((exercise) => exercise.id === activeId);
      const newIndex = dayItems.findIndex((exercise) => exercise.id === overId);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      groups[sourceDay] = arrayMove(dayItems, oldIndex, newIndex);
    } else {
      groups[sourceDay] = groups[sourceDay].filter(
        (exercise) => exercise.id !== activeId,
      );

      const targetItems = groups[targetDay];
      const targetIndex = isDayOfWeek(overId)
        ? targetItems.length
        : Math.max(
            targetItems.findIndex((exercise) => exercise.id === overId),
            0,
          );

      groups[targetDay] = [
        ...targetItems.slice(0, targetIndex),
        { ...movingExercise, day_of_week: targetDay },
        ...targetItems.slice(targetIndex),
      ];
    }

    const nextExercises = flattenGroups(groups);
    setExercises(nextExercises);
    setStatus("saving");
    setError(null);

    try {
      await persistPositions(nextExercises, [sourceDay, targetDay]);
      setNotice("Orden guardado.");
    } catch {
      setExercises(previousExercises);
      setError("No pudimos guardar el nuevo orden. Se restauro el estado anterior.");
    } finally {
      setStatus("idle");
    }
  }

  async function handleCreate(input: ExerciseInput) {
    if (!modal || modal.mode !== "create") {
      return;
    }

    setStatus("saving");
    setError(null);

    const position = groupedExercises[modal.day].length;
    const { data, error: insertError } = await supabase
      .from("exercises")
      .insert({
        ...input,
        user_id: userId,
        day_of_week: modal.day,
        week_start_date: weekStartKey,
        position,
      })
      .select()
      .single();

    setStatus("idle");

    if (insertError || !data) {
      setError("No pudimos crear el ejercicio.");
      return;
    }

    setExercises((current) => flattenGroups(groupExercises([...current, data as Exercise])));
    setNotice("Ejercicio creado.");
    setModal(null);
  }

  async function handleUpdate(input: ExerciseInput) {
    if (!modal || modal.mode !== "edit") {
      return;
    }

    setStatus("saving");
    setError(null);

    const { data, error: updateError } = await supabase
      .from("exercises")
      .update(input)
      .eq("id", modal.exercise.id)
      .select()
      .single();

    setStatus("idle");

    if (updateError || !data) {
      setError("No pudimos actualizar el ejercicio.");
      return;
    }

    setExercises((current) =>
      current.map((exercise) =>
        exercise.id === modal.exercise.id ? (data as Exercise) : exercise,
      ),
    );
    setNotice("Ejercicio actualizado.");
    setModal(null);
  }

  async function handleDelete(exercise: Exercise) {
    const confirmed = window.confirm(`Eliminar "${exercise.name}"?`);

    if (!confirmed) {
      return;
    }

    const previousExercises = exercises;
    const nextGroups = groupExercises(
      previousExercises.filter((item) => item.id !== exercise.id),
    );
    const nextExercises = flattenGroups(nextGroups);

    setExercises(nextExercises);
    setStatus("saving");
    setError(null);

    const { error: deleteError } = await supabase
      .from("exercises")
      .delete()
      .eq("id", exercise.id);

    if (deleteError) {
      setExercises(previousExercises);
      setError("No pudimos eliminar el ejercicio.");
      setStatus("idle");
      return;
    }

    try {
      await persistPositions(nextExercises, [exercise.day_of_week]);
      setNotice("Ejercicio eliminado.");
    } catch {
      setError("El ejercicio se elimino, pero no pudimos reordenar el dia.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <section className="mx-auto max-w-[1600px] px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#4f8f7c]">
            <CalendarDays size={17} aria-hidden="true" />
            <span>{status === "saving" ? "Guardando cambios" : "Calendario"}</span>
          </div>
          <h2 className="text-3xl font-semibold tracking-normal text-[#17201a] md:text-4xl">
            {weekRange}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setWeekStart((current) => addWeeks(current, -1))}
            icon={<ChevronLeft size={17} aria-hidden="true" />}
          >
            Semana anterior
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setWeekStart(getMonday())}
            icon={<RotateCcw size={17} aria-hidden="true" />}
          >
            Hoy
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setWeekStart((current) => addWeeks(current, 1))}
            icon={<ChevronRight size={17} aria-hidden="true" />}
          >
            Semana siguiente
          </Button>
        </div>
      </div>

      <div className="mb-4 min-h-12 space-y-3">
        {status === "loading" ? (
          <StatusMessage>Cargando ejercicios...</StatusMessage>
        ) : null}
        {error ? <StatusMessage type="error">{error}</StatusMessage> : null}
        {notice ? <StatusMessage type="success">{notice}</StatusMessage> : null}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveExercise(null)}
      >
        <div className="overflow-x-auto pb-4">
          <div className="grid min-w-max grid-cols-5 gap-4 md:min-w-0">
            {WEEK_DAYS.map((day) => (
              <DayColumn
                key={day.value}
                day={day}
                exercises={groupedExercises[day.value]}
                onAdd={(selectedDay) =>
                  setModal({ mode: "create", day: selectedDay, exercise: null })
                }
                onEdit={(exercise) =>
                  setModal({
                    mode: "edit",
                    day: exercise.day_of_week,
                    exercise,
                  })
                }
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      </DndContext>

      {activeExercise ? (
        <p className="sr-only">Arrastrando {activeExercise.name}</p>
      ) : null}

      {modal ? (
        <ExerciseModal
          exercise={modal.exercise}
          dayLabel={currentDayLabel}
          onClose={() => setModal(null)}
          onSubmit={modal.mode === "create" ? handleCreate : handleUpdate}
        />
      ) : null}
    </section>
  );
}
