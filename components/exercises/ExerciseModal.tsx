"use client";

import { ExerciseForm } from "@/components/exercises/ExerciseForm";
import { Modal } from "@/components/ui/Modal";
import type { Exercise, ExerciseInput } from "@/types/exercise";

type ExerciseModalProps = {
  exercise?: Exercise | null;
  dayLabel: string;
  onClose: () => void;
  onSubmit: (input: ExerciseInput) => Promise<void>;
};

export function ExerciseModal({
  exercise,
  dayLabel,
  onClose,
  onSubmit,
}: ExerciseModalProps) {
  return (
    <Modal
      title={exercise ? "Editar ejercicio" : `Agregar ejercicio - ${dayLabel}`}
      onClose={onClose}
    >
      <ExerciseForm exercise={exercise} onSubmit={onSubmit} onCancel={onClose} />
    </Modal>
  );
}
