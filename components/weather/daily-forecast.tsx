"use client";

import { useState } from "react";
import { DayForecastSheet } from "@/components/weather/day-forecast-sheet";
import { WeatherIcon } from "@/components/weather/weather-icon";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { hoursForDate } from "@/lib/weather/hourly-window";
import { getWeatherDescription } from "@/lib/weather/map-codes";
import type { DailyForecastItem, HourlyForecastItem } from "@/types/api";

type DailyForecastProps = {
  items: DailyForecastItem[];
  hourly: HourlyForecastItem[];
  locale: Locale;
  timezone: string;
};

function formatDay(
  date: string,
  timezone: string,
  locale: Locale,
  index: number,
) {
  if (index === 0) return t(locale, "today");
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    weekday: "short",
    timeZone: timezone,
  }).format(new Date(`${date}T12:00:00`));
}

export function DailyForecast({
  items,
  hourly,
  locale,
  timezone,
}: DailyForecastProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (items.length === 0) return null;

  const selectedIndex = items.findIndex((item) => item.date === selectedDate);
  const selectedDay = selectedIndex >= 0 ? items[selectedIndex] : null;

  return (
    <section className="animate-fade-in mt-6 px-4 pb-10">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-white/55">
        {t(locale, "daily")}
      </h2>
      <ul className="divide-y divide-white/10">
        {items.map((item, index) => (
          <li key={item.date}>
            <button
              type="button"
              onClick={() => setSelectedDate(item.date)}
              className="grid w-full grid-cols-[4.5rem_auto_1fr_auto] items-center gap-3 py-3 text-left text-white transition hover:bg-white/10 cursor-pointer"
            >
              <span className="text-sm font-medium">
                {formatDay(item.date, timezone, locale, index)}
              </span>
              <WeatherIcon
                code={item.weatherCode}
                locale={locale}
                size={26}
              />
              <div className="min-w-0">
                <p className="truncate text-sm text-white/80">
                  {getWeatherDescription(item.weatherCode, locale)}
                </p>
                {item.precipitationProbabilityMax != null ? (
                  <p className="text-xs text-sky-200/80">
                    {t(locale, "precip")} {item.precipitationProbabilityMax}%
                  </p>
                ) : null}
              </div>
              <span className="text-sm tabular-nums text-white/90">
                <span className="font-medium">{Math.round(item.tempMax)}°</span>
                <span className="mx-1.5 text-white/35">/</span>
                <span className="text-white/60">{Math.round(item.tempMin)}°</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {selectedDay ? (
        <DayForecastSheet
          title={formatDay(
            selectedDay.date,
            timezone,
            locale,
            selectedIndex,
          )}
          day={selectedDay}
          hours={hoursForDate(hourly, selectedDay.date)}
          locale={locale}
          timezone={timezone}
          onClose={() => setSelectedDate(null)}
        />
      ) : null}
    </section>
  );
}
