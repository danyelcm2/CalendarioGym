"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { ArrowLeft, Download, Dumbbell } from "lucide-react";

import { DayColumn } from "@/components/calendar/DayColumn";
import { ExerciseModal } from "@/components/exercises/ExerciseModal";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { useWeightUnit } from "@/components/ui/WeightUnitToggle";
import { createClient } from "@/lib/supabase/client";
import {
  flattenGroups,
  groupExercises,
  isDayOfWeek,
  type ExerciseGroups,
} from "@/lib/utils/exercises";
import { formatWeightLabel, type WeightUnit } from "@/lib/utils/weights";
import {
  WEEK_DAYS,
  type DayOfWeek,
  type Exercise,
  type ExerciseCatalogItem,
  type ExerciseInput,
} from "@/types/exercise";

type WeeklyCalendarProps = {
  userId: string;
  planId: string;
  planName: string;
  planColor?: string;
  initialDayLabels: Partial<Record<DayOfWeek, string>>;
};

type ModalState =
  | { mode: "create"; day: DayOfWeek; exercise: null }
  | { mode: "edit"; day: DayOfWeek; exercise: Exercise }
  | null;

function getExercisePrintSummary(exercise: Exercise, weightUnit: WeightUnit) {
  const weightLabel = formatWeightLabel(exercise.weight, weightUnit);
  const dropsetWeightLabel = formatWeightLabel(exercise.dropset_weight, weightUnit);
  const isCardio = exercise.notes?.toLowerCase().includes("cardio") ?? false;

  return [
    isCardio ? `${exercise.reps} cardio` : `${exercise.sets} x ${exercise.reps}`,
    weightLabel,
    exercise.rest_minutes ? `${exercise.rest_minutes} min` : null,
    exercise.dropset_enabled
      ? `Dropset ${exercise.dropset_reps || "--"} reps${
          dropsetWeightLabel ? ` ${dropsetWeightLabel}` : ""
        }`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function WeeklyCalendar({
  userId,
  planId,
  planName,
  initialDayLabels,
}: WeeklyCalendarProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseCatalog, setExerciseCatalog] = useState<ExerciseCatalogItem[]>([]);
  const [dayLabels, setDayLabels] =
    useState<Partial<Record<DayOfWeek, string>>>(initialDayLabels);
  const [modal, setModal] = useState<ModalState>(null);
  const [selectedMobileDay, setSelectedMobileDay] =
    useState<DayOfWeek>("monday");
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "saving">("loading");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { unit: weightUnit } = useWeightUnit();

  const supabase = useMemo(() => createClient(), []);
  const groupedExercises = useMemo(() => groupExercises(exercises), [exercises]);
  const currentDayLabel = modal
    ? dayLabels[modal.day] ??
      WEEK_DAYS.find((day) => day.value === modal.day)?.label ??
      ""
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
      .eq("plan_id", planId)
      .order("position", { ascending: true });

    if (fetchError) {
      setError("No pudimos cargar tus ejercicios.");
      setExercises([]);
      setStatus("idle");
      return;
    }

    setExercises((data ?? []) as Exercise[]);
    setStatus("idle");
  }, [supabase, planId]);

  const loadExerciseCatalog = useCallback(async () => {
    const { data, error: catalogError } = await supabase
      .from("exercise_catalog")
      .select("id,name,category")
      .order("name", { ascending: true });

    if (catalogError) {
      setExerciseCatalog([]);
      setError("No pudimos cargar el catalogo de ejercicios.");
      return;
    }

    setExerciseCatalog((data ?? []) as ExerciseCatalogItem[]);
  }, [supabase]);

  useEffect(() => {
    void loadExercises();
    void loadExerciseCatalog();
  }, [loadExercises, loadExerciseCatalog]);

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
        plan_id: planId,
        day_of_week: modal.day,
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

  async function handleToggleComplete(exercise: Exercise) {
    const previousExercises = exercises;
    const nextCompleted = !exercise.completed;

    setExercises((current) =>
      current.map((item) =>
        item.id === exercise.id ? { ...item, completed: nextCompleted } : item,
      ),
    );

    const { error: completeError } = await supabase
      .from("exercises")
      .update({ completed: nextCompleted })
      .eq("id", exercise.id);

    if (completeError) {
      setExercises(previousExercises);
      setError("No pudimos actualizar el estado del ejercicio.");
      return;
    }

    setNotice(nextCompleted ? "Ejercicio completado." : "Ejercicio pendiente.");
  }

  function handlePrint() {
    window.print();
  }

  async function handleRenameDay(day: DayOfWeek) {
    const dayConfig = WEEK_DAYS.find((item) => item.value === day);
    const currentLabel = dayLabels[day] ?? "";
    const nextLabel = window.prompt(
      `Nombre para ${dayConfig?.label ?? day}`,
      currentLabel,
    );

    if (nextLabel === null) {
      return;
    }

    const cleanLabel = nextLabel.trim();
    const previousLabels = dayLabels;
    const nextLabels = {
      ...dayLabels,
      [day]: cleanLabel,
    };

    if (!cleanLabel) {
      delete nextLabels[day];
    }

    setDayLabels(nextLabels);

    const { error: renameError } = await supabase
      .from("workout_plans")
      .update({ day_labels: nextLabels })
      .eq("id", planId);

    if (renameError) {
      setDayLabels(previousLabels);
      setError("No pudimos cambiar el nombre del dia.");
      return;
    }

    setNotice("Nombre de dia actualizado.");
  }

  return (
    <section className="mx-auto max-w-[1600px] px-3 py-4 sm:px-5 md:px-8 md:py-8">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <div className="mb-3">
            <Link
              href="/plans"
              className="inline-flex items-center gap-2 rounded-2xl px-1 py-1 text-sm font-semibold text-[#4f8f7c] transition hover:text-[#326d5f] dark:hover:text-[#9ee4d1]"
            >
              <ArrowLeft size={17} aria-hidden="true" />
              Mis planes
            </Link>
          </div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#4f8f7c]">
            <Dumbbell size={17} aria-hidden="true" />
            <span>{status === "saving" ? "Guardando cambios" : "Plan semanal"}</span>
          </div>
          <h2 className="text-balance text-3xl font-semibold tracking-normal text-[#17201a] sm:text-4xl dark:text-[#f8fbff]">
            {planName}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#647067] dark:text-[#b8c6d8]">
            Lunes a viernes · {exercises.length} ejercicios
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handlePrint}
          icon={<Download size={17} aria-hidden="true" />}
          className="no-print w-full xl:w-auto"
        >
          Exportar PDF
        </Button>
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
        <div className="md:hidden">
          <div className="-mx-3 mb-4 overflow-x-auto px-3 pb-1">
            <div className="flex min-w-max gap-2">
              {WEEK_DAYS.map((day) => {
                const isSelected = selectedMobileDay === day.value;
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => setSelectedMobileDay(day.value)}
                    className={`min-h-11 rounded-2xl border px-4 text-sm font-semibold transition ${
                      isSelected
                        ? "border-[#17201a] bg-[#17201a] text-white shadow-sm dark:border-[#dbeafe] dark:bg-[#dbeafe] dark:text-[#0f172a]"
                        : "border-[#d7ded7] bg-white text-[#4d5b50] dark:border-[#31445f] dark:bg-[#172033] dark:text-[#dbe7f6]"
                    }`}
                  >
                    {day.shortLabel}
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        isSelected
                          ? "bg-white/[0.14] text-white dark:bg-[#111827]/[0.1] dark:text-[#0f172a]"
                          : "bg-[#eef3ef] text-[#4d5b50] dark:bg-[#22314a] dark:text-[#dbe7f6]"
                      }`}
                    >
                      {groupedExercises[day.value].length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {WEEK_DAYS.filter((day) => day.value === selectedMobileDay).map(
            (day) => (
              <DayColumn
                key={day.value}
                day={day}
                dayLabel={dayLabels[day.value] ?? day.label}
                exercises={groupedExercises[day.value]}
                weightUnit={weightUnit}
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
                onToggleComplete={handleToggleComplete}
                onRenameDay={handleRenameDay}
              />
            ),
          )}
        </div>

        <div className="hidden md:block">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {WEEK_DAYS.map((day) => (
              <DayColumn
                key={day.value}
                day={day}
                dayLabel={dayLabels[day.value] ?? day.label}
                exercises={groupedExercises[day.value]}
                weightUnit={weightUnit}
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
                onToggleComplete={handleToggleComplete}
                onRenameDay={handleRenameDay}
              />
            ))}
          </div>
        </div>
      </DndContext>

      <div className="print-plan">
        <h1>{planName}</h1>
        <p>Lunes a viernes · {exercises.length} ejercicios</p>
        <div className="print-grid">
          {WEEK_DAYS.map((day) => (
            <section key={day.value}>
              <h2>{day.shortLabel} · {dayLabels[day.value] ?? day.label}</h2>
              {groupedExercises[day.value].length > 0 ? (
                groupedExercises[day.value].map((exercise) => (
                  <article key={exercise.id}>
                    <h3>
                      {exercise.completed ? "[x] " : ""}
                      {exercise.name}
                    </h3>
                    <p>{getExercisePrintSummary(exercise, weightUnit)}</p>
                    {exercise.notes ? <p>{exercise.notes}</p> : null}
                  </article>
                ))
              ) : (
                <p>Sin ejercicios</p>
              )}
            </section>
          ))}
        </div>
      </div>

      {activeExercise ? (
        <p className="sr-only">Arrastrando {activeExercise.name}</p>
      ) : null}

      {modal ? (
        <ExerciseModal
          exercise={modal.exercise}
          dayLabel={currentDayLabel}
          catalog={exerciseCatalog}
          weightUnit={weightUnit}
          onClose={() => setModal(null)}
          onSubmit={modal.mode === "create" ? handleCreate : handleUpdate}
        />
      ) : null}
    </section>
  );
}
