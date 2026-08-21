"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

const STORAGE_KEY = "calendario-gym-accent";

const ACCENTS = [
  {
    id: "blue",
    label: "Azul",
    color: "#2563eb",
    hover: "#1d4ed8",
    soft: "#eff6ff",
    softStrong: "#dbeafe",
    softDark: "#1e3a5f",
    darkText: "#bfdbfe",
  },
  {
    id: "cyan",
    label: "Celeste",
    color: "#0891b2",
    hover: "#0e7490",
    soft: "#ecfeff",
    softStrong: "#cffafe",
    softDark: "#164e63",
    darkText: "#a5f3fc",
  },
  {
    id: "rose",
    label: "Rosa",
    color: "#e11d48",
    hover: "#be123c",
    soft: "#fff1f2",
    softStrong: "#ffe4e6",
    softDark: "#881337",
    darkText: "#fecdd3",
  },
  {
    id: "amber",
    label: "Ambar",
    color: "#d97706",
    hover: "#b45309",
    soft: "#fffbeb",
    softStrong: "#fef3c7",
    softDark: "#78350f",
    darkText: "#fde68a",
  },
  {
    id: "violet",
    label: "Violeta",
    color: "#7c3aed",
    hover: "#6d28d9",
    soft: "#f5f3ff",
    softStrong: "#ede9fe",
    softDark: "#4c1d95",
    darkText: "#ddd6fe",
  },
] as const;

type AccentId = (typeof ACCENTS)[number]["id"];

function getAccent(id: string | null) {
  return ACCENTS.find((accent) => accent.id === id) ?? ACCENTS[0];
}

function applyAccent(id: string | null) {
  const accent = getAccent(id);
  const root = document.documentElement;

  root.style.setProperty("--accent", accent.color);
  root.style.setProperty("--accent-hover", accent.hover);
  root.style.setProperty("--accent-soft", accent.soft);
  root.style.setProperty("--accent-soft-strong", accent.softStrong);
  root.style.setProperty("--accent-soft-dark", accent.softDark);
  root.style.setProperty("--accent-dark-text", accent.darkText);

  return accent.id;
}

export function AccentColorPicker() {
  const [selected, setSelected] = useState<AccentId>("blue");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSelected(applyAccent(window.localStorage.getItem(STORAGE_KEY)));
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex size-10 items-center justify-center rounded-2xl border border-[#d7ded7] bg-white text-[var(--accent)] transition hover:bg-[var(--accent-soft)] dark:border-[#31445f] dark:bg-[#172033] dark:hover:bg-[var(--accent-soft-dark)]"
        aria-label="Cambiar color del sistema"
        title="Color del sistema"
      >
        <Palette size={17} aria-hidden="true" />
      </button>
      {isOpen ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 grid grid-cols-5 gap-2 rounded-2xl border border-[#d7ded7] bg-white p-2 shadow-[0_18px_45px_rgba(23,32,26,0.16)] dark:border-[#31445f] dark:bg-[#111827]"
          onMouseLeave={() => setIsOpen(false)}
        >
          {ACCENTS.map((accent) => (
            <button
              key={accent.id}
              type="button"
              onClick={() => {
                window.localStorage.setItem(STORAGE_KEY, accent.id);
                setSelected(applyAccent(accent.id));
                setIsOpen(false);
              }}
              className={`size-8 rounded-full border transition ${
                selected === accent.id
                  ? "border-[#17201a] ring-2 ring-[var(--accent)] ring-offset-2 dark:border-[#f8fbff] dark:ring-offset-[#111827]"
                  : "border-white/80 hover:scale-105 dark:border-[#31445f]"
              }`}
              style={{ backgroundColor: accent.color }}
              aria-label={`Usar acento ${accent.label}`}
              title={accent.label}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
