"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { WeatherShell } from "@/components/weather/weather-shell";
import {
  buildWeatherHref,
  parseLocationFromSearchParams,
} from "@/lib/weather/location-url";
import {
  DEFAULT_LOCATION,
  useAppStore,
  type SelectedLocation,
} from "@/stores/app-store";

export function WeatherDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const favorites = useAppStore((s) => s.favorites);

  const id = params.id;
  const numericId = Number(id);
  const safeId = Number.isFinite(numericId) ? numericId : DEFAULT_LOCATION.id;

  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const name = searchParams.get("name");
  const country = searchParams.get("country");
  const admin1 = searchParams.get("admin1");

  const location = useMemo<SelectedLocation>(() => {
    const fromFavorite = favorites.find((item) => item.id === safeId);
    if (fromFavorite) return fromFavorite;

    const query = new URLSearchParams();
    if (lat) query.set("lat", lat);
    if (lon) query.set("lon", lon);
    if (name) query.set("name", name);
    if (country) query.set("country", country);
    if (admin1) query.set("admin1", admin1);

    return parseLocationFromSearchParams(safeId, query) ?? DEFAULT_LOCATION;
  }, [admin1, country, favorites, lat, lon, name, safeId]);

  useEffect(() => {
    if (!Number.isFinite(numericId)) {
      router.replace(buildWeatherHref(DEFAULT_LOCATION));
      return;
    }

    const fromFavorite = favorites.find((item) => item.id === numericId);
    if (fromFavorite) return;

    const query = new URLSearchParams();
    if (lat) query.set("lat", lat);
    if (lon) query.set("lon", lon);
    if (name) query.set("name", name);

    if (!parseLocationFromSearchParams(numericId, query)) {
      router.replace(buildWeatherHref(DEFAULT_LOCATION));
    }
  }, [favorites, lat, lon, name, numericId, router]);

  return <WeatherShell location={location} />;
}
