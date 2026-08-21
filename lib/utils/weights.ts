export type WeightUnit = "kg" | "lb";

const POUNDS_PER_KG = 2.2046226218;

export function formatWeightInput(weight: string, unit: WeightUnit = "kg") {
  const trimmed = weight.trim();

  if (!trimmed) {
    return null;
  }

  return `${stripWeightUnit(trimmed)} ${unit}`;
}

export function formatWeightLabel(weight: string | null, unit: WeightUnit = "kg") {
  if (!weight) {
    return null;
  }

  const parsed = parseStoredWeight(weight);

  if (!parsed) {
    return `${stripWeightUnit(weight)} ${unit}`;
  }

  return `${formatNumber(convertWeight(parsed.value, parsed.unit, unit))} ${unit}`;
}

export function getWeightInputValue(
  weight: string | null | undefined,
  unit: WeightUnit,
) {
  if (!weight) {
    return "";
  }

  const parsed = parseStoredWeight(weight);

  if (!parsed) {
    return stripWeightUnit(weight);
  }

  return formatNumber(convertWeight(parsed.value, parsed.unit, unit));
}

export function parseWeightInKilograms(weight: string | null) {
  const parsed = parseStoredWeight(weight);

  if (!parsed) {
    return null;
  }

  return convertWeight(parsed.value, parsed.unit, "kg");
}

function parseStoredWeight(weight: string | null) {
  if (!weight) {
    return null;
  }

  const match = weight.replace(",", ".").match(/(\d+(?:\.\d+)?)\s*(kg|kgs|lb|lbs)?/i);

  if (!match) {
    return null;
  }

  const rawUnit = match[2]?.toLowerCase();
  const unit: WeightUnit = rawUnit?.startsWith("lb") ? "lb" : "kg";

  return {
    value: Number(match[1]),
    unit,
  };
}

function convertWeight(value: number, from: WeightUnit, to: WeightUnit) {
  if (from === to) {
    return value;
  }

  return to === "lb" ? value * POUNDS_PER_KG : value / POUNDS_PER_KG;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function stripWeightUnit(weight: string) {
  return weight
    .trim()
    .replace(/\s*(kg|kgs|kilogramos?|lb|lbs|libras?)\s*$/i, "")
    .trim();
}
