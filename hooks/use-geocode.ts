"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Locale } from "@/lib/i18n/types";
import type { GeocodeData } from "@/types/api";

export function useGeocode(
  query: string,
  locale: Locale,
  enabled = true,
) {
  const trimmed = query.trim();
  // Chinese place names are often 1–2 chars; Latin queries need a bit more.
  const minLength = locale === "zh" ? 1 : 2;
  const canSearch = enabled && trimmed.length >= minLength;

  return useQuery({
    queryKey: ["geocode", trimmed, locale],
    queryFn: () =>
      apiClient<GeocodeData>(
        `/api/geocode?q=${encodeURIComponent(trimmed)}&lang=${locale}`,
      ),
    enabled: canSearch,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    // Avoid UI flicker / duplicate loading when locale or query tweaks.
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
