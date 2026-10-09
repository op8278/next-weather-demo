"use client";

import { useEffect, useState } from "react";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { LocaleSwitcher } from "@/components/common/locale-switcher";
import { LocationSearch } from "@/components/search/location-search";
import { CurrentWeather } from "@/components/weather/current-weather";
import { DailyForecast } from "@/components/weather/daily-forecast";
import { HourlyForecast } from "@/components/weather/hourly-forecast";
import { useWeather } from "@/hooks/use-weather";
import { getErrorMessage, t } from "@/lib/i18n";
import {
  getBackgroundGradient,
  getWeatherMood,
} from "@/lib/weather/map-codes";
import { useAppStore } from "@/stores/app-store";

export function WeatherShell() {
  const [hydrated, setHydrated] = useState(false);
  const locale = useAppStore((s) => s.locale);
  const location = useAppStore((s) => s.location);
  const weather = useWeather(hydrated ? location : null);

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
          <p className="text-sm font-medium tracking-wide text-white/70">
            {t(locale, "appTitle")}
          </p>
          <LocaleSwitcher />
        </header>

        <div className="mt-4">
          <LocationSearch />
        </div>

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
