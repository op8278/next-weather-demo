"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { getLocationLabel } from "@/lib/weather/location-label";
import { buildWeatherHref } from "@/lib/weather/location-url";
import {
  getBackgroundGradient,
  getWeatherDescription,
  getWeatherMood,
} from "@/lib/weather/map-codes";
import type { SelectedLocation } from "@/stores/app-store";
import type { WeatherData } from "@/types/api";

const SWIPE_THRESHOLD = 82;
const SWIPE_DEADZONE = 10;

type CityCardProps = {
  location: SelectedLocation;
  weatherQuery: UseQueryResult<WeatherData, Error>;
  locale: Locale;
  deleteOpen: boolean;
  onDeleteOpenChange: (open: boolean) => void;
  onRemove: () => void;
  onNavigate?: () => void;
};

export function CityCard({
  location,
  weatherQuery,
  locale,
  deleteOpen,
  onDeleteOpenChange,
  onRemove,
  onNavigate,
}: CityCardProps) {
  const router = useRouter();
  const href = buildWeatherHref(location, locale);

  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const startX = useRef<number | null>(null);
  const dragging = useRef(false);
  const swiped = useRef(false);

  function updateOffset(next: number) {
    offsetRef.current = next;
    setOffset(next);
  }

  const weather = weatherQuery.data;
  const label = getLocationLabel(location, locale);
  const mood = weather
    ? getWeatherMood(weather.current.weatherCode)
    : "cloudy";
  const isDay = weather?.current.isDay ?? true;
  const background = getBackgroundGradient(mood, isDay);
  const today = weather?.daily[0];

  // Parent owns which card is open; sync closed state back into local offset.
  useEffect(() => {
    if (!deleteOpen) {
      updateOffset(0);
      swiped.current = false;
    } else {
      updateOffset(-SWIPE_THRESHOLD);
    }
  }, [deleteOpen]);

  function closeDelete() {
    swiped.current = false;
    updateOffset(0);
    onDeleteOpenChange(false);
  }

  function goDetail() {
    onNavigate?.();
    onDeleteOpenChange(false);
    router.push(href);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch") return;

    startX.current = event.clientX;
    dragging.current = true;
    swiped.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current || startX.current == null) return;
    const delta = event.clientX - startX.current;
    if (Math.abs(delta) < SWIPE_DEADZONE && !swiped.current) return;
    swiped.current = true;
    updateOffset(Math.min(0, Math.max(-SWIPE_THRESHOLD, delta)));
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    dragging.current = false;
    startX.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!swiped.current) {
      goDetail();
      return;
    }

    const shouldOpen = offsetRef.current <= -SWIPE_THRESHOLD / 2;
    updateOffset(shouldOpen ? -SWIPE_THRESHOLD : 0);
    onDeleteOpenChange(shouldOpen);
  }

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <button
        type="button"
        onClick={onRemove}
        className="absolute inset-y-0 right-0 flex w-[72px] items-center justify-center rounded-3xl bg-red-500 text-sm font-medium text-white"
        aria-label={t(locale, "removeCity")}
      >
        {t(locale, "removeCity")}
      </button>

      <div
        className="group relative touch-pan-y transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          role="link"
          tabIndex={0}
          className="block w-full cursor-pointer rounded-3xl px-5 py-4 text-left text-white shadow-sm"
          style={{ background }}
          onClick={() => {
            if (deleteOpen || offset !== 0 || swiped.current) {
              closeDelete();
              return;
            }
            goDetail();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              goDetail();
            }
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-medium tracking-tight">
                {label.name}
              </h2>
              <p className="mt-0.5 text-sm text-white/75">
                {weatherQuery.isLoading
                  ? t(locale, "loading")
                  : weather
                    ? getWeatherDescription(weather.current.weatherCode, locale)
                    : weatherQuery.isError
                      ? t(locale, "errorGeneric")
                      : "—"}
              </p>
            </div>
            <p className="shrink-0 text-5xl font-thin tracking-tighter">
              {weather ? `${Math.round(weather.current.temperature)}°` : "–"}
            </p>
          </div>

          <div className="mt-6 flex items-end justify-between gap-3 text-sm text-white/80">
            <span className="truncate text-white/65">
              {[label.admin1, label.country].filter(Boolean).join(", ")}
            </span>
            <span className="tabular-nums">
              {t(locale, "high")}{" "}
              {today ? `${Math.round(today.tempMax)}°` : "–"}{" "}
              {t(locale, "low")}{" "}
              {today ? `${Math.round(today.tempMin)}°` : "–"}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="absolute bottom-3 right-3 hidden min-h-9 items-center rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white opacity-0 shadow-md transition hover:bg-red-600 group-hover:opacity-100 focus:opacity-100 sm:inline-flex cursor-pointer"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          {t(locale, "removeCity")}
        </button>
      </div>
    </div>
  );
}
