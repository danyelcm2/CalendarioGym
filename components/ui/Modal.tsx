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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#17201a]/[0.35] px-2 py-2 backdrop-blur-sm sm:items-center sm:px-4 sm:py-4">
      <section className="max-h-[calc(100svh-1rem)] w-full max-w-xl overflow-y-auto rounded-[24px] border border-white/70 bg-white p-4 shadow-[0_28px_80px_rgba(23,32,26,0.22)] sm:max-h-[calc(100vh-2rem)] sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
          <h2 className="text-lg font-semibold text-[#17201a] sm:text-xl">
            {title}
          </h2>
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
