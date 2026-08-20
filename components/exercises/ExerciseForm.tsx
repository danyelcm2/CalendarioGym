"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Field, TextArea } from "@/components/ui/Field";
import { formatWeightInput } from "@/lib/utils/weights";
import type { Exercise, ExerciseInput } from "@/types/exercise";

type ExerciseFormProps = {
  exercise?: Exercise | null;
  onSubmit: (input: ExerciseInput) => Promise<void>;
  onCancel: () => void;
};

export function ExerciseForm({ exercise, onSubmit, onCancel }: ExerciseFormProps) {
  const [name, setName] = useState(exercise?.name ?? "");
  const [sets, setSets] = useState(String(exercise?.sets ?? 4));
  const [reps, setReps] = useState(exercise?.reps ?? "10");
  const [weight, setWeight] = useState(exercise?.weight ?? "");
  const [restMinutes, setRestMinutes] = useState(
    exercise?.rest_minutes ? String(exercise.rest_minutes) : "",
  );
  const [dropsetEnabled, setDropsetEnabled] = useState(
    exercise?.dropset_enabled ?? false,
  );
  const [dropsetReps, setDropsetReps] = useState(exercise?.dropset_reps ?? "");
  const [dropsetWeight, setDropsetWeight] = useState(
    exercise?.dropset_weight ?? "",
  );
  const [notes, setNotes] = useState(exercise?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    await onSubmit({
      name: name.trim(),
      sets: Number(sets),
      reps: reps.trim(),
      weight: formatWeightInput(weight),
      rest_minutes: restMinutes ? Number(restMinutes) : null,
      dropset_enabled: dropsetEnabled,
      dropset_reps: dropsetEnabled ? dropsetReps.trim() || null : null,
      dropset_weight: dropsetEnabled ? formatWeightInput(dropsetWeight) : null,
      notes: notes.trim() || null,
    });

    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <Field
        id="exercise-name"
        label="Nombre del ejercicio"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Press banca"
        required
      />

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
          label="Peso opcional (LB)"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          placeholder="60"
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

      <div className="rounded-2xl border border-[#d9e0d8] bg-white p-4 dark:border-[#334238] dark:bg-[#101711]">
        <label className="flex items-start gap-3 text-sm font-semibold text-[#354239] dark:text-[#d7e0d8]">
          <input
            type="checkbox"
            checked={dropsetEnabled}
            onChange={(event) => setDropsetEnabled(event.target.checked)}
            className="mt-1 size-4 rounded border-[#cfd8cf] accent-[#17201a]"
          />
          <span>
            Dropset
            <span className="mt-1 block text-xs font-normal leading-5 text-[#647067] dark:text-[#a8b4aa]">
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
              label="Peso dropset (LB)"
              value={dropsetWeight}
              onChange={(event) => setDropsetWeight(event.target.value)}
              placeholder="45"
            />
          </div>
        ) : null}
      </div>

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
