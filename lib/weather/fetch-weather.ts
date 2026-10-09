import { apiClient } from "@/lib/api/client";
import type { SelectedLocation } from "@/stores/app-store";
import type { WeatherData } from "@/types/api";

export function weatherQueryKey(location: SelectedLocation) {
  return [
    "weather",
    location.latitude,
    location.longitude,
    location.name,
  ] as const;
}

export async function fetchWeatherData(
  location: SelectedLocation,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    lat: String(location.latitude),
    lon: String(location.longitude),
    name: location.name,
  });
  return apiClient<WeatherData>(`/api/weather?${params.toString()}`);
}
