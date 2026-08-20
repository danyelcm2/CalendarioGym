const dayFormatter = new Intl.DateTimeFormat("es-GT", {
  day: "numeric",
  month: "long",
});

export function getMonday(date = new Date()) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addWeeks(date: Date, weeks: number) {
  return addDays(date, weeks * 7);
}

export function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatWeekRange(weekStart: Date) {
  const weekEnd = addDays(weekStart, 4);
  return `Semana del ${dayFormatter.format(weekStart)} al ${dayFormatter.format(
    weekEnd,
  )}`;
}
