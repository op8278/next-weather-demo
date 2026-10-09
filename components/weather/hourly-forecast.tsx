"use client";

import { useState } from "react";
import { TemperatureCurve } from "@/components/weather/temperature-curve";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import {
  calendarDateInTimezone,
  hoursForDate,
  nextHours,
} from "@/lib/weather/hourly-window";
import { getWeatherDescription } from "@/lib/weather/map-codes";
import type { HourlyForecastItem } from "@/types/api";

type HourlyForecastProps = {
  items: HourlyForecastItem[];
  locale: Locale;
  timezone: string;
  /** Open-Meteo current time string; list tab starts from this hour. */
  fromTime?: string;
};

type HourlyTab = "list" | "chart";

function formatHour(
  time: string,
  timezone: string,
  locale: Locale,
  isFirst: boolean,
) {
  if (isFirst) return t(locale, "now");
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    hour: "numeric",
    hour12: locale === "en",
    timeZone: timezone,
  }).format(new Date(time));
}

export function HourlyForecast({
  items,
  locale,
  timezone,
  fromTime,
}: HourlyForecastProps) {
  const [tab, setTab] = useState<HourlyTab>("list");

  if (items.length === 0) return null;

  const listItems = nextHours(items, 24, fromTime);
  const today = calendarDateInTimezone(new Date(), timezone);
  const chartItems = hoursForDate(items, today);

  return (
    <section className="animate-fade-in mt-8 px-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-white/55">
          {t(locale, "hourly")}
        </h2>
        <div
          role="tablist"
          aria-label={t(locale, "hourly")}
          className="flex rounded-full bg-white/10 p-0.5"
        >
          {(
            [
              ["list", "hourlyList"],
              ["chart", "hourlyChart"],
            ] as const
          ).map(([value, key]) => {
            const selected = tab === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(value)}
                className={`rounded-full px-3 py-1 text-xs transition cursor-pointer ${
                  selected
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white/85"
                }`}
              >
                {t(locale, key)}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "list" ? (
        <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex min-w-max gap-1">
            {listItems.map((item, index) => {
              const description = getWeatherDescription(
                item.weatherCode,
                locale,
              );
              return (
                <li
                  key={item.time}
                  className="flex h-28 w-[4.75rem] flex-col items-center gap-1 px-1.5 py-3 text-center text-white"
                >
                  <span className="shrink-0 text-xs leading-none text-white/70">
                    {formatHour(item.time, timezone, locale, index === 0)}
                  </span>
                  <span
                    className="mt-2 h-8 w-full shrink-0 overflow-hidden text-center text-[11px] leading-4 text-white/55"
                    title={description}
                  >
                    <span className="line-clamp-2">{description}</span>
                  </span>
                  <span className="mt-auto shrink-0 text-lg font-medium leading-none">
                    {Math.round(item.temperature)}°
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="rounded-2xl px-1 py-3">
          <TemperatureCurve
            items={chartItems.length > 0 ? chartItems : listItems}
            locale={locale}
            timezone={timezone}
          />
        </div>
      )}
    </section>
  );
}
