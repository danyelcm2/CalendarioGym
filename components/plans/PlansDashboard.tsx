"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Dumbbell, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { createClient } from "@/lib/supabase/client";
import type { WorkoutPlan } from "@/types/exercise";

type PlansDashboardProps = {
  userId: string;
};

type PlanCounts = Record<string, number>;

type ModalState =
  | { mode: "create"; plan: null }
  | { mode: "rename"; plan: WorkoutPlan }
  | null;

export function PlansDashboard({ userId }: PlansDashboardProps) {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [counts, setCounts] = useState<PlanCounts>({});
  const [modal, setModal] = useState<ModalState>(null);
  const [planName, setPlanName] = useState("");
  const [status, setStatus] = useState<"loading" | "idle" | "saving">("loading");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

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
      setCounts({});
      setStatus("idle");
      return;
    }

    const { data: exerciseData, error: exerciseError } = await supabase
      .from("exercises")
      .select("plan_id");

    if (exerciseError) {
      setCounts({});
      setStatus("idle");
      return;
    }

    const nextCounts = (exerciseData ?? []).reduce<PlanCounts>(
      (accumulator, exercise) => {
        accumulator[exercise.plan_id] = (accumulator[exercise.plan_id] ?? 0) + 1;
        return accumulator;
      },
      {},
    );

    setCounts(nextCounts);
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
    setModal({ mode: "create", plan: null });
  }

  function openRenameModal(plan: WorkoutPlan) {
    setPlanName(plan.name);
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
      const { data, error: createError } = await supabase
        .from("workout_plans")
        .insert({
          user_id: userId,
          name: cleanName,
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
      .update({ name: cleanName })
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

    setCounts((current) => {
      const nextCounts = { ...current };
      delete nextCounts[plan.id];
      return nextCounts;
    });
    setNotice("Plan eliminado.");
  }

  return (
    <section className="mx-auto max-w-[1400px] px-3 py-5 sm:px-5 md:px-8 md:py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#4f8f7c]">
            Mis planes
          </p>
          <h2 className="text-3xl font-semibold text-[#17201a] dark:text-[#f7fbf6]">
            Rutinas semanales
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#647067] dark:text-[#a8b4aa]">
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

      <div className="mb-4 min-h-12 space-y-3">
        {status === "loading" ? <StatusMessage>Cargando planes...</StatusMessage> : null}
        {error ? <StatusMessage type="error">{error}</StatusMessage> : null}
        {notice ? <StatusMessage type="success">{notice}</StatusMessage> : null}
      </div>

      {plans.length === 0 && status !== "loading" ? (
        <div className="rounded-[24px] border border-dashed border-[#cfd8cf] bg-white/[0.72] p-8 text-center shadow-sm dark:border-[#334238] dark:bg-[#162019]/[0.72]">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#17201a] text-white dark:bg-[#f7fbf6] dark:text-[#101711]">
            <Dumbbell size={23} aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold text-[#17201a] dark:text-[#f7fbf6]">
            Crea tu primer plan
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#647067] dark:text-[#a8b4aa]">
            Puedes tener una rutina de fuerza, hipertrofia, volumen o cualquier
            estructura semanal que uses.
          </p>
          <Button type="button" onClick={openCreateModal} className="mt-5">
            Crear plan
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className="rounded-[24px] border border-white/80 bg-white/[0.76] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[#26342b] dark:bg-[#162019]/[0.78]"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="break-words text-xl font-semibold text-[#17201a] dark:text-[#f7fbf6]">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm text-[#647067] dark:text-[#a8b4aa]">
                    5 dias · {counts[plan.id] ?? 0} ejercicios
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => openRenameModal(plan)}
                    className="flex size-9 items-center justify-center rounded-xl text-[#647067] transition hover:bg-[#eef3ef] dark:text-[#a8b4aa] dark:hover:bg-[#223027]"
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
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#17201a] px-4 text-sm font-semibold text-white transition hover:bg-[#263228] dark:bg-[#f7fbf6] dark:text-[#101711] dark:hover:bg-[#dbe7dd]"
              >
                Abrir plan
                <MoreHorizontal size={17} aria-hidden="true" />
              </Link>
            </article>
          ))}
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
