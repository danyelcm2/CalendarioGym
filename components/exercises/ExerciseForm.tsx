"use client";

import { useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Field, TextArea, fieldClass } from "@/components/ui/Field";
import {
  formatWeightInput,
  getWeightInputValue,
  type WeightUnit,
} from "@/lib/utils/weights";
import type {
  Exercise,
  ExerciseCatalogItem,
  ExerciseInput,
} from "@/types/exercise";

type ExerciseFormProps = {
  exercise?: Exercise | null;
  catalog: ExerciseCatalogItem[];
  weightUnit: WeightUnit;
  onSubmit: (input: ExerciseInput) => Promise<void>;
  onCancel: () => void;
};

function isCardioExercise(exercise?: Exercise | null) {
  return exercise?.notes?.toLowerCase().includes("cardio") ?? false;
}

function getCardioMinutes(exercise?: Exercise | null) {
  const match = exercise?.reps.match(/\d+/);
  return match ? match[0] : "20";
}

export function ExerciseForm({
  exercise,
  catalog,
  weightUnit,
  onSubmit,
  onCancel,
}: ExerciseFormProps) {
  const [exerciseKind, setExerciseKind] = useState<"strength" | "cardio">(
    isCardioExercise(exercise) ? "cardio" : "strength",
  );
  const [name, setName] = useState(exercise?.name ?? "");
  const [sets, setSets] = useState(String(exercise?.sets ?? 4));
  const [reps, setReps] = useState(exercise?.reps ?? "10");
  const [weight, setWeight] = useState(
    getWeightInputValue(exercise?.weight, weightUnit),
  );
  const [restMinutes, setRestMinutes] = useState(
    exercise?.rest_minutes ? String(exercise.rest_minutes) : "",
  );
  const [dropsetEnabled, setDropsetEnabled] = useState(
    exercise?.dropset_enabled ?? false,
  );
  const [dropsetReps, setDropsetReps] = useState(exercise?.dropset_reps ?? "");
  const [dropsetWeight, setDropsetWeight] = useState(
    getWeightInputValue(exercise?.dropset_weight, weightUnit),
  );
  const [notes, setNotes] = useState(exercise?.notes ?? "");
  const [cardioMinutes, setCardioMinutes] = useState(getCardioMinutes(exercise));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const filteredCatalog = useMemo(() => {
    const query = name.trim().toLowerCase();
    const kindCatalog = catalog.filter((item) =>
      exerciseKind === "cardio"
        ? item.category === "cardio"
        : item.category !== "cardio",
    );

    if (!query) {
      return kindCatalog.slice(0, 12);
    }

    return kindCatalog
      .filter((item) => item.name.toLowerCase().includes(query))
      .slice(0, 12);
  }, [catalog, exerciseKind, name]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    if (exerciseKind === "cardio") {
      await onSubmit({
        name: name.trim(),
        sets: 1,
        reps: `${cardioMinutes} min`,
        weight: null,
        rest_minutes: null,
        dropset_enabled: false,
        dropset_reps: null,
        dropset_weight: null,
        notes: notes.trim() || "Cardio",
      });
    } else {
      await onSubmit({
        name: name.trim(),
        sets: Number(sets),
        reps: reps.trim(),
        weight: formatWeightInput(weight, weightUnit),
        rest_minutes: restMinutes ? Number(restMinutes) : null,
        dropset_enabled: dropsetEnabled,
        dropset_reps: dropsetEnabled ? dropsetReps.trim() || null : null,
        dropset_weight: dropsetEnabled
          ? formatWeightInput(dropsetWeight, weightUnit)
          : null,
        notes: notes.trim() || null,
      });
    }

    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-2 gap-2">
        {([
          ["strength", "Fuerza"],
          ["cardio", "Cardio"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setExerciseKind(value)}
            className={`min-h-11 rounded-2xl border px-4 text-sm font-semibold transition ${
              exerciseKind === value
                ? "border-[#17201a] bg-[#17201a] text-white dark:border-[#dbeafe] dark:bg-[#dbeafe] dark:text-[#0f172a]"
                : "border-[#d7ded7] bg-white text-[#4d5b50] dark:border-[#31445f] dark:bg-[#172033] dark:text-[#dbe7f6]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative">
        <label
          htmlFor="exercise-name"
          className="block text-sm font-medium text-[#354239] dark:text-[#dbe7f6]"
        >
          {exerciseKind === "cardio" ? "Actividad" : "Nombre del ejercicio"}
          <input
            id="exercise-name"
            className={fieldClass}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setIsCatalogOpen(true);
            }}
            onFocus={() => setIsCatalogOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setIsCatalogOpen(false), 120);
            }}
            placeholder={exerciseKind === "cardio" ? "Caminadora" : "Press banca"}
            autoComplete="off"
            required
          />
        </label>
        {isCatalogOpen && filteredCatalog.length > 0 ? (
          <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-[#d7ded7] bg-white p-1 shadow-[0_18px_45px_rgba(23,32,26,0.16)] dark:border-[#31445f] dark:bg-[#111827]">
            {filteredCatalog.map((item) => (
              <button
                key={item.id}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  setName(item.name);
                  setIsCatalogOpen(false);
                }}
                className="block min-h-11 w-full rounded-xl px-3 text-left text-sm font-medium text-[#17201a] transition hover:bg-[#eef3ef] dark:text-[#f8fbff] dark:hover:bg-[#22314a]"
              >
                {item.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {exerciseKind === "cardio" ? (
        <Field
          id="cardio-minutes"
          label="Tiempo de cardio (min)"
          value={cardioMinutes}
          onChange={(event) => setCardioMinutes(event.target.value)}
          type="number"
          min={1}
          step={1}
          required
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <Field
              id="sets"
              label="Series"
              value={sets}
              onChange={(event) => setSets(event.target.value)}
              type="number"
              min={1}
              required
            />
            <Field
              id="reps"
              label="Repeticiones"
              value={reps}
              onChange={(event) => setReps(event.target.value)}
              placeholder="10 o 8-12"
              required
            />
            <Field
              id="weight"
              label={`Peso opcional (${weightUnit})`}
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder={weightUnit === "kg" ? "60" : "135"}
            />
            <Field
              id="rest"
              label="Descanso (min)"
              value={restMinutes}
              onChange={(event) => setRestMinutes(event.target.value)}
              type="number"
              min={0}
              step="0.5"
              placeholder="1.5"
            />
          </div>

          <div className="rounded-2xl border border-[#d9e0d8] bg-white p-4 dark:border-[#31445f] dark:bg-[#111827]">
            <label className="flex items-start gap-3 text-sm font-semibold text-[#354239] dark:text-[#dbe7f6]">
              <input
                type="checkbox"
                checked={dropsetEnabled}
                onChange={(event) => setDropsetEnabled(event.target.checked)}
                className="mt-1 size-4 rounded border-[#cfd8cf] accent-[#17201a]"
              />
              <span>
                Dropset
                <span className="mt-1 block text-xs font-normal leading-5 text-[#647067] dark:text-[#b8c6d8]">
                  Al terminar la serie principal, bajas el peso y sigues sin
                  descanso con otras repeticiones.
                </span>
              </span>
            </label>

            {dropsetEnabled ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field
                  id="dropset-reps"
                  label="Repeticiones dropset"
                  value={dropsetReps}
                  onChange={(event) => setDropsetReps(event.target.value)}
                  placeholder="8"
                />
                <Field
                  id="dropset-weight"
                  label={`Peso dropset (${weightUnit})`}
                  value={dropsetWeight}
                  onChange={(event) => setDropsetWeight(event.target.value)}
                  placeholder={weightUnit === "kg" ? "45" : "100"}
                />
              </div>
            ) : null}
          </div>
        </>
      )}

      <TextArea
        id="notes"
        label="Notas opcionales"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Tempo, tecnica, sensaciones..."
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Guardando..." : exercise ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
