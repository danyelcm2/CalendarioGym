"use client";

import { ExerciseForm } from "@/components/exercises/ExerciseForm";
import { Modal } from "@/components/ui/Modal";
import type { WeightUnit } from "@/lib/utils/weights";
import type { Exercise, ExerciseInput } from "@/types/exercise";

type ExerciseModalProps = {
  exercise?: Exercise | null;
  dayLabel: string;
  weightUnit: WeightUnit;
  onClose: () => void;
  onSubmit: (input: ExerciseInput) => Promise<void>;
};

export function ExerciseModal({
  exercise,
  dayLabel,
  weightUnit,
  onClose,
  onSubmit,
}: ExerciseModalProps) {
  return (
    <Modal
      title={exercise ? "Editar ejercicio" : `Agregar ejercicio - ${dayLabel}`}
      onClose={onClose}
    >
      <ExerciseForm
        exercise={exercise}
        weightUnit={weightUnit}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
