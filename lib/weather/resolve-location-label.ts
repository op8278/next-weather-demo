import { apiClient } from "@/lib/api/client";
import type { Locale } from "@/lib/i18n/types";
import type { LocationLabel, SelectedLocation } from "@/stores/app-store";
import type { GeocodeData } from "@/types/api";

export async function resolveLocationLabel(
  location: SelectedLocation,
  locale: Locale,
): Promise<LocationLabel | null> {
  // Use Open-Meteo `/v1/get?id=` via our API — exact match, no fuzzy `q` search.
  const data = await apiClient<GeocodeData>(
    `/api/geocode?id=${location.id}&lang=${locale}`,
  );

  const match = data.results[0];
  if (!match || match.id !== location.id) return null;

  return {
    name: match.name,
    country: match.country,
    admin1: match.admin1,
  };
}
