"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { WeatherData } from "@/types/api";
import type { SelectedLocation } from "@/stores/app-store";

export function useWeather(location: SelectedLocation | null) {
  return useQuery({
    queryKey: [
      "weather",
      location?.latitude,
      location?.longitude,
      location?.name,
    ],
    queryFn: () => {
      if (!location) {
        throw new Error("No location selected");
      }
      const params = new URLSearchParams({
        lat: String(location.latitude),
        lon: String(location.longitude),
        name: location.name,
      });
      return apiClient<WeatherData>(`/api/weather?${params.toString()}`);
    },
    enabled: Boolean(location),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
