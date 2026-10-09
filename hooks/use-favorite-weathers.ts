"use client";

import { useQueries } from "@tanstack/react-query";
import {
  fetchWeatherData,
  weatherQueryKey,
} from "@/lib/weather/fetch-weather";
import type { SelectedLocation } from "@/stores/app-store";

export function useFavoriteWeathers(favorites: SelectedLocation[]) {
  return useQueries({
    queries: favorites.map((location) => ({
      queryKey: weatherQueryKey(location),
      queryFn: () => fetchWeatherData(location),
      staleTime: 5 * 60 * 1000,
      retry: 1,
    })),
  });
}
