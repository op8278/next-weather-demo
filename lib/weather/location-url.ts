import type { SelectedLocation } from "@/stores/app-store";
import { getLocationLabel } from "@/lib/weather/location-label";
import type { Locale } from "@/lib/i18n/types";

export function buildWeatherHref(
  location: SelectedLocation,
  locale: Locale = "en",
): string {
  const label = getLocationLabel(location, locale);
  const params = new URLSearchParams({
    lat: String(location.latitude),
    lon: String(location.longitude),
    name: label.name,
  });
  if (label.country) params.set("country", label.country);
  if (label.admin1) params.set("admin1", label.admin1);
  return `/weather/${location.id}?${params.toString()}`;
}

export function parseLocationFromSearchParams(
  id: number,
  searchParams: URLSearchParams,
): SelectedLocation | null {
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const name = searchParams.get("name")?.trim();

  if (!name || Number.isNaN(lat) || Number.isNaN(lon)) {
    return null;
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null;
  }

  return {
    id,
    name,
    latitude: lat,
    longitude: lon,
    country: searchParams.get("country") ?? "",
    admin1: searchParams.get("admin1") ?? undefined,
  };
}
