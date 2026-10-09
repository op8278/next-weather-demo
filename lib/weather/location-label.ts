import type { Locale } from "@/lib/i18n/types";
import type { SelectedLocation, LocationLabel } from "@/stores/app-store";

export function toOpenMeteoLanguage(locale: Locale): string {
  return locale === "zh" ? "zh" : "en";
}

export function getLocationLabel(
  location: SelectedLocation,
  locale: Locale,
): LocationLabel {
  return (
    location.labels?.[locale] ?? {
      name: location.name,
      country: location.country,
      admin1: location.admin1,
    }
  );
}

/** True only when we already have a real localized label (not a fallback). */
export function hasLocaleLabel(
  location: SelectedLocation,
  locale: Locale,
): boolean {
  return Boolean(location.labels?.[locale]?.name);
}

export function formatLocationLabel(label: LocationLabel): string {
  return [label.name, label.admin1, label.country].filter(Boolean).join(", ");
}
