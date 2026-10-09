"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TemperatureCurve } from "@/components/weather/temperature-curve";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import type { DailyForecastItem, HourlyForecastItem } from "@/types/api";

type DayForecastSheetProps = {
  title: string;
  day: DailyForecastItem;
  hours: HourlyForecastItem[];
  locale: Locale;
  timezone: string;
  onClose: () => void;
};

export function DayForecastSheet({
  title,
  day,
  hours,
  locale,
  timezone,
  onClose,
}: DayForecastSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        className="animate-sheet-backdrop absolute inset-0 bg-black/40"
        aria-label={t(locale, "close")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-forecast-sheet-title"
        className="animate-sheet-up relative w-full max-w-md rounded-t-3xl border border-white/12 bg-[#1a2744]/95 px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:max-w-lg"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/25" />
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id="day-forecast-sheet-title"
              className="text-lg font-medium text-white"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm tabular-nums text-white/70">
              <span className="text-white/90">
                {t(locale, "high")} {Math.round(day.tempMax)}°
              </span>
              <span className="mx-2 text-white/30">·</span>
              <span>
                {t(locale, "low")} {Math.round(day.tempMin)}°
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/85 transition hover:bg-white/16"
          >
            {t(locale, "close")}
          </button>
        </div>
        {hours.length > 0 ? (
          <TemperatureCurve
            items={hours}
            locale={locale}
            timezone={timezone}
          />
        ) : (
          <p className="py-10 text-center text-sm text-white/55">
            {t(locale, "errorGeneric")}
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
