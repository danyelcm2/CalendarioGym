"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Copy,
  Dumbbell,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { useWeightUnit } from "@/components/ui/WeightUnitToggle";
import { createClient } from "@/lib/supabase/client";
import {
  ROUTINE_TEMPLATES,
  type RoutineTemplate,
} from "@/lib/utils/exercise-catalog";
import {
  getPersonalRecords,
  getPlanColor,
  getPlanExerciseCount,
  inferPlanColor,
  PLAN_COLORS,
  type PlanColor,
} from "@/lib/utils/plans";
import { formatWeightLabel } from "@/lib/utils/weights";
import type { DayOfWeek, Exercise, WorkoutPlan } from "@/types/exercise";

type PlansDashboardProps = {
  userId: string;
};

type ModalState =
  | { mode: "create"; plan: null }
  | { mode: "rename"; plan: WorkoutPlan }
  | null;

export function PlansDashboard({ userId }: PlansDashboardProps) {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const [planName, setPlanName] = useState("");
  const [planColor, setPlanColor] = useState<PlanColor>("teal");
  const [status, setStatus] = useState<"loading" | "idle" | "saving">("loading");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const { unit: weightUnit } = useWeightUnit();
  const personalRecords = useMemo(() => getPersonalRecords(exercises, 3), [exercises]);

  const loadPlans = useCallback(async () => {
    setStatus("loading");
    setError(null);

    const { data: planData, error: planError } = await supabase
      .from("workout_plans")
      .select("*")
      .order("updated_at", { ascending: false });

    if (planError) {
      setError("No pudimos cargar tus planes.");
      setStatus("idle");
      return;
    }

    const nextPlans = (planData ?? []) as WorkoutPlan[];
    setPlans(nextPlans);

    if (nextPlans.length === 0) {
      setExercises([]);
      setStatus("idle");
      return;
    }

    const { data: exerciseData, error: exerciseError } = await supabase
      .from("exercises")
      .select("*");

    if (exerciseError) {
      setExercises([]);
      setStatus("idle");
      return;
    }

    setExercises((exerciseData ?? []) as Exercise[]);
    setStatus("idle");
  }, [supabase]);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = window.setTimeout(() => setNotice(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function openCreateModal() {
    setPlanName("");
    setPlanColor("teal");
    setModal({ mode: "create", plan: null });
  }

  function openRenameModal(plan: WorkoutPlan) {
    setPlanName(plan.name);
    setPlanColor(getPlanColor(plan.color).value);
    setModal({ mode: "rename", plan });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = planName.trim();

    if (!cleanName || !modal) {
      return;
    }

    setStatus("saving");
    setError(null);

    if (modal.mode === "create") {
      const selectedColor =
        planColor === "teal" ? inferPlanColor(cleanName) : planColor;
      const { data, error: createError } = await supabase
        .from("workout_plans")
        .insert({
          user_id: userId,
          name: cleanName,
          color: selectedColor,
        })
        .select()
        .single();

      setStatus("idle");

      if (createError || !data) {
        setError("No pudimos crear el plan.");
        return;
      }

      setPlans((current) => [data as WorkoutPlan, ...current]);
      setNotice("Plan creado.");
      setModal(null);
      return;
    }

    const { data, error: renameError } = await supabase
      .from("workout_plans")
      .update({ name: cleanName, color: planColor })
      .eq("id", modal.plan.id)
      .select()
      .single();

    setStatus("idle");

    if (renameError || !data) {
      setError("No pudimos cambiar el nombre del plan.");
      return;
    }

    setPlans((current) =>
      current.map((plan) =>
        plan.id === modal.plan.id ? (data as WorkoutPlan) : plan,
      ),
    );
    setNotice("Plan actualizado.");
    setModal(null);
  }

  async function handleDuplicate(plan: WorkoutPlan) {
    setStatus("saving");
    setError(null);

    const { data: newPlan, error: planError } = await supabase
      .from("workout_plans")
      .insert({
        user_id: userId,
        name: `${plan.name} copia`,
        color: plan.color,
        day_labels: plan.day_labels ?? {},
      })
      .select()
      .single();

    if (planError || !newPlan) {
      setStatus("idle");
      setError("No pudimos duplicar el plan.");
      return;
    }

    const sourceExercises = exercises.filter(
      (exercise) => exercise.plan_id === plan.id,
    );

    if (sourceExercises.length > 0) {
      const { data: copiedExercises, error: exerciseError } = await supabase
        .from("exercises")
        .insert(
          sourceExercises.map((exercise) => ({
            user_id: userId,
            plan_id: newPlan.id,
            name: exercise.name,
            day_of_week: exercise.day_of_week,
            position: exercise.position,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            rest_minutes: exercise.rest_minutes,
            notes: exercise.notes,
            completed: false,
            dropset_enabled: exercise.dropset_enabled,
            dropset_reps: exercise.dropset_reps,
            dropset_weight: exercise.dropset_weight,
          })),
        )
        .select();

      if (exerciseError) {
        await supabase.from("workout_plans").delete().eq("id", newPlan.id);
        setStatus("idle");
        setError("No pudimos copiar los ejercicios del plan.");
        return;
      }

      setExercises((current) => [
        ...((copiedExercises ?? []) as Exercise[]),
        ...current,
      ]);
    }

    setPlans((current) => [newPlan as WorkoutPlan, ...current]);
    setStatus("idle");
    setNotice("Plan duplicado.");
  }

  async function handleCreateTemplate(template: RoutineTemplate) {
    setStatus("saving");
    setError(null);

    const { data: newPlan, error: planError } = await supabase
      .from("workout_plans")
      .insert({
        user_id: userId,
        name: template.name,
        color: template.color,
        day_labels: template.dayLabels,
      })
      .select()
      .single();

    if (planError || !newPlan) {
      setStatus("idle");
      setError("No pudimos agregar la rutina.");
      return;
    }

    const dayPositions = new Map<DayOfWeek, number>();
    const templateExercises = template.exercises.map((exercise) => {
      const position = dayPositions.get(exercise.day_of_week) ?? 0;
      dayPositions.set(exercise.day_of_week, position + 1);

      return {
        ...exercise,
        user_id: userId,
        plan_id: newPlan.id,
        position,
        completed: false,
      };
    });

    const { data: createdExercises, error: exerciseError } = await supabase
      .from("exercises")
      .insert(templateExercises)
      .select();

    setStatus("idle");

    if (exerciseError) {
      await supabase.from("workout_plans").delete().eq("id", newPlan.id);
      setError("No pudimos agregar los ejercicios de la rutina.");
      return;
    }

    setPlans((current) => [newPlan as WorkoutPlan, ...current]);
    setExercises((current) => [
      ...((createdExercises ?? []) as Exercise[]),
      ...current,
    ]);
    setNotice("Rutina agregada a tus planes.");
  }

  async function handleDelete(plan: WorkoutPlan) {
    const confirmed = window.confirm(`Eliminar el plan "${plan.name}"?`);

    if (!confirmed) {
      return;
    }

    const previousPlans = plans;
    setPlans((current) => current.filter((item) => item.id !== plan.id));
    setStatus("saving");
    setError(null);

    const { error: deleteError } = await supabase
      .from("workout_plans")
      .delete()
      .eq("id", plan.id);

    setStatus("idle");

    if (deleteError) {
      setPlans(previousPlans);
      setError("No pudimos eliminar el plan.");
      return;
    }

    setExercises((current) =>
      current.filter((exercise) => exercise.plan_id !== plan.id),
    );
    setNotice("Plan eliminado.");
  }

  return (
    <section className="mx-auto max-w-[1400px] px-3 py-5 sm:px-5 md:px-8 md:py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#4f8f7c]">
            Mis planes
          </p>
          <h2 className="text-3xl font-semibold text-[#17201a] dark:text-[#f8fbff]">
            Rutinas semanales
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#647067] dark:text-[#b8c6d8]">
            Organiza diferentes rutinas y abre la que estes entrenando ahora.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreateModal}
          icon={<Plus size={18} aria-hidden="true" />}
          className="w-full md:w-auto"
        >
          Crear plan
        </Button>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-2">
        {ROUTINE_TEMPLATES.map((template) => (
          <article
            key={template.id}
            className="rounded-[20px] border border-white/80 bg-white/[0.72] p-4 shadow-sm dark:border-[#31445f] dark:bg-[#172033]/[0.72]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4f8f7c] dark:text-[#93c5fd]">
                  {template.level}
                </p>
                <h3 className="mt-1 text-base font-semibold text-[#17201a] dark:text-[#f8fbff]">
                  {template.name}
                </h3>
                <p className="mt-1 text-sm leading-5 text-[#647067] dark:text-[#b8c6d8]">
                  {template.description}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                disabled={status === "saving"}
                onClick={() => handleCreateTemplate(template)}
                icon={<Plus size={17} aria-hidden="true" />}
                className="shrink-0"
              >
                Agregar
              </Button>
            </div>
          </article>
        ))}
      </div>

      <div className="mb-5 rounded-[20px] border border-white/80 bg-white/[0.72] p-4 shadow-sm dark:border-[#31445f] dark:bg-[#172033]/[0.72]">
        <div className="mb-3 flex items-center gap-2">
          <Trophy size={18} className="text-[#f59e0b]" aria-hidden="true" />
          <h3 className="text-base font-semibold text-[#17201a] dark:text-[#f8fbff]">
            Records personales
          </h3>
        </div>
        {personalRecords.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-3">
            {personalRecords.map((record) => (
              <div
                key={record.name}
                className="rounded-2xl border border-[#e2e8e2] bg-white px-3 py-2.5 dark:border-[#31445f] dark:bg-[#111827]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-[#17201a] dark:text-[#f8fbff]">
                    {record.name}
                  </p>
                  <p className="shrink-0 text-sm font-semibold text-[#17201a] dark:text-[#f8fbff]">
                    {record.weight
                      ? formatWeightLabel(`${record.weight} kg`, weightUnit)
                      : "PR"}
                  </p>
                </div>
                <p className="mt-1 truncate text-xs text-[#647067] dark:text-[#b8c6d8]">
                  {record.sets} x {record.reps}
                  {record.estimatedMax
                    ? ` · est. ${formatWeightLabel(
                        `${record.estimatedMax} kg`,
                        weightUnit,
                      )}`
                    : ""}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-[#647067] dark:text-[#b8c6d8]">
            Agrega peso y repeticiones a tus ejercicios para detectar tus mejores marcas.
          </p>
        )}
      </div>

      <div className="mb-4 min-h-12 space-y-3">
        {status === "loading" ? <StatusMessage>Cargando planes...</StatusMessage> : null}
        {error ? <StatusMessage type="error">{error}</StatusMessage> : null}
        {notice ? <StatusMessage type="success">{notice}</StatusMessage> : null}
      </div>

      {plans.length === 0 && status !== "loading" ? (
        <div className="rounded-[24px] border border-dashed border-[#cfd8cf] bg-white/[0.72] p-8 text-center shadow-sm dark:border-[#31445f] dark:bg-[#172033]/[0.72]">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#17201a] text-white dark:bg-[#dbeafe] dark:text-[#0f172a]">
            <Dumbbell size={23} aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold text-[#17201a] dark:text-[#f8fbff]">
            Crea tu primer plan
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#647067] dark:text-[#b8c6d8]">
            Puedes tener una rutina de fuerza, hipertrofia, volumen o cualquier
            estructura semanal que uses.
          </p>
          <Button type="button" onClick={openCreateModal} className="mt-5">
            Crear plan
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
              const color = getPlanColor(plan.color);
              const exerciseCount = getPlanExerciseCount(plan, exercises);
              return (
                <article
                  key={plan.id}
                  className={`rounded-[24px] border border-t-4 border-white/80 bg-white/[0.76] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[#31445f] dark:bg-[#172033]/[0.78] ${color.border}`}
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span
                        className={`mb-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${color.soft}`}
                      >
                        {color.label}
                      </span>
                      <h3 className="break-words text-xl font-semibold text-[#17201a] dark:text-[#f8fbff]">
                        {plan.name}
                      </h3>
                      <p className="mt-2 text-sm text-[#647067] dark:text-[#b8c6d8]">
                        5 dias · {exerciseCount} ejercicios
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(plan)}
                        className="flex size-9 items-center justify-center rounded-xl text-[#647067] transition hover:bg-[#eef3ef] dark:text-[#b8c6d8] dark:hover:bg-[#22314a]"
                        aria-label={`Duplicar ${plan.name}`}
                        title="Duplicar"
                      >
                        <Copy size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openRenameModal(plan)}
                        className="flex size-9 items-center justify-center rounded-xl text-[#647067] transition hover:bg-[#eef3ef] dark:text-[#b8c6d8] dark:hover:bg-[#22314a]"
                        aria-label={`Renombrar ${plan.name}`}
                        title="Renombrar"
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(plan)}
                        className="flex size-9 items-center justify-center rounded-xl text-[#a63d2b] transition hover:bg-[#fff0ed] dark:text-[#ff9a88] dark:hover:bg-[#3a1f1b]"
                        aria-label={`Eliminar ${plan.name}`}
                        title="Eliminar"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <Link
                    href={`/plans/${plan.id}`}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#17201a] px-4 text-sm font-semibold text-white transition hover:bg-[#263228] dark:bg-[#dbeafe] dark:text-[#0f172a] dark:hover:bg-[#bfdbfe]"
                  >
                    Abrir plan
                    <MoreHorizontal size={17} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
        </div>
      )}

      {modal ? (
        <Modal
          title={modal.mode === "create" ? "Crear plan" : "Cambiar nombre"}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field
              id="plan-name"
              label="Nombre del plan"
              value={planName}
              onChange={(event) => setPlanName(event.target.value)}
              placeholder="Hipertrofia"
              required
            />
            <div>
              <p className="mb-2 text-sm font-medium text-[#354239] dark:text-[#dbe7f6]">
                Color del plan
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {PLAN_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setPlanColor(color.value)}
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-semibold transition ${
                      planColor === color.value
                        ? "border-[#17201a] bg-[#17201a] text-white dark:border-[#dbeafe] dark:bg-[#dbeafe] dark:text-[#0f172a]"
                        : "border-[#d7ded7] bg-white text-[#4d5b50] dark:border-[#31445f] dark:bg-[#111827] dark:text-[#dbe7f6]"
                    }`}
                  >
                    <span className={`size-3 rounded-full ${color.dot}`} />
                    {color.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setModal(null)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={status === "saving"}
                className="w-full sm:w-auto"
              >
                {status === "saving" ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}
