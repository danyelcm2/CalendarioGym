export function formatWeightInput(weight: string) {
  const trimmed = weight.trim();

  if (!trimmed) {
    return null;
  }

  return `${stripWeightUnit(trimmed)} LB`;
}

export function formatWeightLabel(weight: string | null) {
  if (!weight) {
    return null;
  }

  return `${stripWeightUnit(weight)} LB`;
}

function stripWeightUnit(weight: string) {
  return weight
    .trim()
    .replace(/\s*(kg|kgs|kilogramos?|lb|lbs|libras?)\s*$/i, "")
    .trim();
}
