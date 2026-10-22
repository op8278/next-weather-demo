"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Locale } from "@/lib/i18n/types";
import type { SelectedLocation } from "@/stores/app-store";
import type { GeocodeData } from "@/types/api";

type Coords = {
  lat: number;
  lon: number;
};

export type CurrentLocationError = "denied" | "unavailable";

export function useCurrentLocation(enabled: boolean, locale: Locale) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<CurrentLocationError | null>(null);
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    if (!window.isSecureContext || !("geolocation" in navigator)) {
      setGeoError("unavailable");
      return;
    }

    let cancelled = false;
    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLocating(false);
      },
      (error) => {
        if (cancelled) return;
        setCoords(null);
        setGeoError(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable");
        setLocating(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 5 * 60 * 1000,
      },
    );

    return () => {
      cancelled = true;
    };
  }, [enabled, requestId]);

  const reverse = useQuery({
    queryKey: ["geocode", "reverse", coords?.lat, coords?.lon, locale],
    enabled: Boolean(coords),
    staleTime: 30 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      if (!coords) throw new Error("Missing coordinates");
      const params = new URLSearchParams({
        lat: String(coords.lat),
        lon: String(coords.lon),
        lang: locale,
      });
      return apiClient<GeocodeData>(`/api/geocode?${params.toString()}`);
    },
  });

  const match = reverse.data?.results[0];
  const location: SelectedLocation | null = match
    ? {
        id: match.id,
        name: match.name,
        latitude: match.latitude,
        longitude: match.longitude,
        country: match.country,
        admin1: match.admin1,
        labels: {
          [locale]: {
            name: match.name,
            country: match.country,
            admin1: match.admin1,
          },
        },
      }
    : null;

  return {
    location,
    locating: locating || reverse.isFetching,
    error: geoError ?? (reverse.isError ? "unavailable" : null),
    retry: () => {
      if (coords && !geoError) {
        void reverse.refetch();
        return;
      }
      setRequestId((id) => id + 1);
    },
  };
}
