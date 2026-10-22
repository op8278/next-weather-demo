"use client";

import { CityCard } from "@/components/cities/city-card";
import { useCurrentLocation } from "@/hooks/use-current-location";
import { useWeather } from "@/hooks/use-weather";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

type CurrentLocationCardProps = {
  locale: Locale;
  onNavigate?: () => void;
};

export function CurrentLocationCard({
  locale,
  onNavigate,
}: CurrentLocationCardProps) {
  const current = useCurrentLocation(true, locale);
  const weather = useWeather(current.location);

  if (current.location) {
    return (
      <CityCard
        location={current.location}
        weatherQuery={weather}
        locale={locale}
        deleteOpen={false}
        onDeleteOpenChange={() => {}}
        removable={false}
        badge={t(locale, "currentLocation")}
        onNavigate={onNavigate}
      />
    );
  }

  const message = current.locating
    ? t(locale, "loading")
    : current.error === "denied"
      ? t(locale, "locationDenied")
      : t(locale, "locationUnavailable");

  return (
    <div className="rounded-3xl bg-white/10 px-5 py-4 text-white">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/55">
        {t(locale, "currentLocation")}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-white/75">{message}</p>
      {!current.locating && current.error ? (
        <button
          type="button"
          onClick={current.retry}
          className="mt-3 cursor-pointer rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white/90 transition hover:bg-white/16"
        >
          {t(locale, "retry")}
        </button>
      ) : null}
    </div>
  );
}
