"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#17201a]/[0.35] px-4 py-4 backdrop-blur-sm sm:items-center">
      <section className="w-full max-w-xl rounded-[26px] border border-white/70 bg-white p-6 shadow-[0_28px_80px_rgba(23,32,26,0.22)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-[#17201a]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full text-[#657066] transition hover:bg-[#eef3ef]"
            aria-label="Cerrar"
            title="Cerrar"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
