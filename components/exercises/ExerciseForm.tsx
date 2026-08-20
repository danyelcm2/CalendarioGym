"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Field, TextArea } from "@/components/ui/Field";
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
  const [notes, setNotes] = useState(exercise?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    await onSubmit({
      name: name.trim(),
      sets: Number(sets),
      reps: reps.trim(),
      weight: weight.trim() || null,
      rest_minutes: restMinutes ? Number(restMinutes) : null,
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
          label="Peso opcional"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          placeholder="60 kg"
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
