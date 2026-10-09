"use client";

import { WeatherIcon } from "@/components/weather/weather-icon";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { getWeatherDescription } from "@/lib/weather/map-codes";
import type { CurrentWeather as CurrentWeatherData } from "@/types/api";

type CurrentWeatherProps = {
  locationName: string;
  current: CurrentWeatherData;
  locale: Locale;
};

export function CurrentWeather({
  locationName,
  current,
  locale,
}: CurrentWeatherProps) {
  const description = getWeatherDescription(current.weatherCode, locale);
  const temp = Math.round(current.temperature);
  const feels = Math.round(current.apparentTemperature);

  return (
    <section className="animate-fade-in flex flex-col items-center px-4 pt-6 text-center text-white">
      <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
        {locationName}
      </h1>
      <p className="mt-1 text-7xl font-thin tracking-tighter sm:text-8xl">
        {temp}°
      </p>
      <p className="mt-1 flex items-center justify-center gap-2 text-lg text-white/85">
        <WeatherIcon
          code={current.weatherCode}
          locale={locale}
          isDay={current.isDay}
          size={28}
        />
        <span>{description}</span>
      </p>
      <p className="mt-1 text-sm text-white/70">
        {t(locale, "feelsLike")} {feels}°
      </p>

      <dl className="mt-8 grid w-full max-w-sm grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-white/10 px-4 py-3 text-left">
          <dt className="text-white/55">{t(locale, "humidity")}</dt>
          <dd className="mt-1 text-lg font-medium">{current.humidity}%</dd>
        </div>
        <div className="rounded-2xl bg-white/10 px-4 py-3 text-left">
          <dt className="text-white/55">{t(locale, "wind")}</dt>
          <dd className="mt-1 text-lg font-medium">
            {Math.round(current.windSpeed)} km/h
          </dd>
        </div>
      </dl>
    </section>
  );
}
