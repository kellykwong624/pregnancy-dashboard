export function differenceInDays(a: Date, b: Date) {
  const ms = 24 * 60 * 60 * 1000;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utcA - utcB) / ms);
}

export function gestationalAgeFromLmp(lmp?: string, onDate = new Date()) {
  if (!lmp) return null;
  const start = new Date(`${lmp}T12:00:00`);
  const days = differenceInDays(onDate, start);
  if (days < 0) return null;
  return {
    weeks: Math.floor(days / 7),
    days: days % 7,
    totalDays: days
  };
}

export function dueDateFromLmp(lmp?: string) {
  if (!lmp) return "";
  const d = new Date(`${lmp}T12:00:00`);
  d.setDate(d.getDate() + 280);
  return d.toISOString().slice(0, 10);
}

export function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}
