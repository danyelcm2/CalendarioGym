export function formatWeightInput(weight: string) {
  const trimmed = weight.trim();

  if (!trimmed) {
    return null;
  }

  return `${stripWeightUnit(trimmed)} kg`;
}

export function formatWeightLabel(weight: string | null) {
  if (!weight) {
    return null;
  }

  return `${stripWeightUnit(weight)} kg`;
}

function stripWeightUnit(weight: string) {
  return weight
    .trim()
    .replace(/\s*(kg|kgs|kilogramos?|lb|lbs|libras?)\s*$/i, "")
    .trim();
}
