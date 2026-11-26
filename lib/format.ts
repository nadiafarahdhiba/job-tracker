const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function todayISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function followUpText(day: string, today: string) {
  if (day < today) return `Overdue ${formatDay(day)}`;
  if (day === today) return "Due today";
  return `Follow up ${formatDay(day)}`;
}

export function formatDay(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day || month < 1 || month > 12) return isoDate;
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

export function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const hours24 = date.getHours();
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours = hours24 % 12 || 12;
  return `${month} ${day}, ${hours}:${minutes} ${suffix}`;
}

export function fromDatetimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function formatMoney(
  min: number | null,
  max: number | null,
  currency: string,
) {
  if (min == null && max == null) return null;
  try {
    const formatter = new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    if (min != null && max != null) {
      return `${formatter.format(min)} – ${formatter.format(max)}`;
    }
    if (min != null) return `From ${formatter.format(min)}`;
    return `Up to ${formatter.format(max as number)}`;
  } catch {
    return null;
  }
}
