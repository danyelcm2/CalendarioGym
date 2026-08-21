"use client";

import { useEffect, useState } from "react";

import type { WeightUnit } from "@/lib/utils/weights";

const STORAGE_KEY = "calendario-gym-weight-unit";
const CHANGE_EVENT = "calendario-gym-weight-unit-change";

function readStoredUnit(): WeightUnit {
  if (typeof window === "undefined") {
    return "kg";
  }

  return window.localStorage.getItem(STORAGE_KEY) === "lb" ? "lb" : "kg";
}

export function useWeightUnit() {
  const [unit, setUnitState] = useState<WeightUnit>("kg");

  useEffect(() => {
    setUnitState(readStoredUnit());

    function handleChange() {
      setUnitState(readStoredUnit());
    }

    window.addEventListener(CHANGE_EVENT, handleChange);
    window.addEventListener("storage", handleChange);

    return () => {
      window.removeEventListener(CHANGE_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  function setUnit(nextUnit: WeightUnit) {
    setUnitState(nextUnit);
    window.localStorage.setItem(STORAGE_KEY, nextUnit);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return { unit, setUnit };
}

export function WeightUnitToggle() {
  const { unit, setUnit } = useWeightUnit();

  return (
    <div
      className="flex min-h-10 shrink-0 overflow-hidden rounded-2xl border border-[#d7ded7] bg-white text-xs font-semibold sm:min-h-11 sm:text-sm dark:border-[#31445f] dark:bg-[#172033]"
      aria-label="Unidad de peso"
    >
      {(["kg", "lb"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setUnit(option)}
          className={`min-w-8 px-1.5 transition sm:min-w-12 sm:px-3 ${
            unit === option
              ? "bg-[#17201a] text-white dark:bg-[#dbeafe] dark:text-[#0f172a]"
              : "text-[#4d5b50] hover:bg-[#eef3ef] dark:text-[#b8c6d8] dark:hover:bg-[#22314a]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
