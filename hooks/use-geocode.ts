"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { GeocodeData } from "@/types/api";

export function useGeocode(query: string, enabled = true) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["geocode", trimmed],
    queryFn: () =>
      apiClient<GeocodeData>(
        `/api/geocode?q=${encodeURIComponent(trimmed)}`,
      ),
    enabled: enabled && trimmed.length >= 2,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
