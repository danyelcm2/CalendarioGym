"use client";

import { ExerciseForm } from "@/components/exercises/ExerciseForm";
import { Modal } from "@/components/ui/Modal";
import type { WeightUnit } from "@/lib/utils/weights";
import type {
  Exercise,
  ExerciseCatalogItem,
  ExerciseInput,
} from "@/types/exercise";

type ExerciseModalProps = {
  exercise?: Exercise | null;
  dayLabel: string;
  catalog: ExerciseCatalogItem[];
  weightUnit: WeightUnit;
  onClose: () => void;
  onSubmit: (input: ExerciseInput) => Promise<void>;
};

export function ExerciseModal({
  exercise,
  dayLabel,
  catalog,
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
        catalog={catalog}
        weightUnit={weightUnit}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
