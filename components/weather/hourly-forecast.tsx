"use client";

import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { getWeatherDescription } from "@/lib/weather/map-codes";
import type { HourlyForecastItem } from "@/types/api";

type HourlyForecastProps = {
  items: HourlyForecastItem[];
  locale: Locale;
  timezone: string;
};

function formatHour(time: string, timezone: string, locale: Locale, isFirst: boolean) {
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
}: HourlyForecastProps) {
  if (items.length === 0) return null;

  return (
    <section className="animate-fade-in mt-8 px-4">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-white/55">
        {t(locale, "hourly")}
      </h2>
      <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex min-w-max gap-1">
          {items.map((item, index) => {
            const description = getWeatherDescription(item.weatherCode, locale);
            return (
              <li
                key={item.time}
                className="flex h-28 w-[4.75rem] flex-col items-center px-1.5 py-3 text-center text-white gap-1"
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
    </section>
  );
}
