import type { HourlyForecastItem } from "@/types/api";

/** Open-Meteo hourly times are local ISO-like strings (`YYYY-MM-DDTHH:mm`). */
function dateKey(time: string) {
  return time.slice(0, 10);
}

/**
 * Next `count` hours from `fromTime` (inclusive), using Open-Meteo local time strings.
 * Lexicographic compare is valid for `YYYY-MM-DDTHH:mm`.
 */
export function nextHours(
  items: HourlyForecastItem[],
  count = 24,
  fromTime?: string,
): HourlyForecastItem[] {
  const upcoming = fromTime
    ? items.filter((item) => item.time >= fromTime)
    : items;
  return upcoming.slice(0, count);
}

export function calendarDateInTimezone(
  instant: Date,
  timezone: string,
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

export function hoursForDate(
  items: HourlyForecastItem[],
  date: string,
): HourlyForecastItem[] {
  return items.filter((item) => dateKey(item.time) === date);
}
