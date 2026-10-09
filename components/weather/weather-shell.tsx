"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { LocaleSwitcher } from "@/components/common/locale-switcher";
import { CurrentWeather } from "@/components/weather/current-weather";
import { DailyForecast } from "@/components/weather/daily-forecast";
import { HourlyForecast } from "@/components/weather/hourly-forecast";
import { useWeather } from "@/hooks/use-weather";
import { getErrorMessage, t } from "@/lib/i18n";
import {
  getBackgroundGradient,
  getWeatherMood,
} from "@/lib/weather/map-codes";
import { useAppStore, type SelectedLocation } from "@/stores/app-store";

type WeatherShellProps = {
  location: SelectedLocation;
};

export function WeatherShell({ location }: WeatherShellProps) {
  const [hydrated, setHydrated] = useState(false);
  const locale = useAppStore((s) => s.locale);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const weather = useWeather(hydrated ? location : null);

  const favorited = favorites.some((item) => item.id === location.id);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [hydrated, locale]);

  const mood = weather.data
    ? getWeatherMood(weather.data.current.weatherCode)
    : "clear";
  const isDay = weather.data?.current.isDay ?? true;
  const background = getBackgroundGradient(mood, isDay);

  return (
    <div
      className="min-h-full flex-1 transition-[background] duration-700 ease-out"
      style={{ background }}
    >
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-4 pb-8 pt-5 sm:max-w-lg sm:px-6 sm:pt-8">
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white/90 transition hover:bg-white/16"
          >
            ← {t(locale, "backToList")}
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleFavorite(location)}
              aria-pressed={favorited}
              aria-label={
                favorited ? t(locale, "unfavorite") : t(locale, "favorite")
              }
              title={
                favorited ? t(locale, "unfavorite") : t(locale, "favorite")
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white transition hover:bg-white/16"
            >
              {favorited ? "★" : "☆"}
            </button>
            <LocaleSwitcher />
          </div>
        </header>

        <main className="mt-2 flex-1">
          {!hydrated || weather.isLoading ? (
            <LoadingState label={t(locale, "loading")} />
          ) : null}

          {weather.isError ? (
            <ErrorState
              message={getErrorMessage(locale, weather.error)}
              retryLabel={t(locale, "retry")}
              onRetry={() => void weather.refetch()}
            />
          ) : null}

          {weather.data ? (
            <>
              <CurrentWeather
                locationName={weather.data.location.name}
                current={weather.data.current}
                locale={locale}
              />
              <HourlyForecast
                items={weather.data.hourly}
                locale={locale}
                timezone={weather.data.location.timezone}
              />
              <DailyForecast
                items={weather.data.daily}
                locale={locale}
                timezone={weather.data.location.timezone}
              />
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
