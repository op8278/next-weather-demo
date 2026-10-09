"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchWeatherData,
  weatherQueryKey,
} from "@/lib/weather/fetch-weather";
import type { SelectedLocation } from "@/stores/app-store";

export function useWeather(location: SelectedLocation | null) {
  return useQuery({
    queryKey: location
      ? weatherQueryKey(location)
      : ["weather", "idle"],
    queryFn: () => {
      if (!location) {
        throw new Error("No location selected");
      }
      return fetchWeatherData(location);
    },
    enabled: Boolean(location),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
