"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { WeatherShell } from "@/components/weather/weather-shell";
import { parseLocationFromSearchParams } from "@/lib/weather/location-url";
import { useAppStore, type SelectedLocation } from "@/stores/app-store";

export function WeatherDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const favorites = useAppStore((s) => s.favorites);

  const id = params.id;
  const numericId = Number(id);

  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const name = searchParams.get("name");
  const country = searchParams.get("country");
  const admin1 = searchParams.get("admin1");

  const location = useMemo<SelectedLocation | null>(() => {
    if (!Number.isFinite(numericId)) return null;

    const fromFavorite = favorites.find((item) => item.id === numericId);
    if (fromFavorite) return fromFavorite;

    const query = new URLSearchParams();
    if (lat) query.set("lat", lat);
    if (lon) query.set("lon", lon);
    if (name) query.set("name", name);
    if (country) query.set("country", country);
    if (admin1) query.set("admin1", admin1);

    return parseLocationFromSearchParams(numericId, query);
  }, [admin1, country, favorites, lat, lon, name, numericId]);

  useEffect(() => {
    if (!location) {
      router.replace("/");
    }
  }, [location, router]);

  if (!location) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-[#10141c] text-sm text-white/70">
        Loading…
      </div>
    );
  }

  return <WeatherShell location={location} />;
}
