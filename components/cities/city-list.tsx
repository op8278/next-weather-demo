"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CityCard } from "@/components/cities/city-card";
import { LocaleSwitcher } from "@/components/common/locale-switcher";
import { LocationSearch } from "@/components/search/location-search";
import { useFavoriteWeathers } from "@/hooks/use-favorite-weathers";
import { useResolveLocationLabels } from "@/hooks/use-resolve-location-labels";
import { t } from "@/lib/i18n";
import { buildWeatherHref } from "@/lib/weather/location-url";
import { useAppStore, type SelectedLocation } from "@/stores/app-store";

export function CityList() {
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [openSwipeId, setOpenSwipeId] = useState<number | null>(null);
  const locale = useAppStore((s) => s.locale);
  const favorites = useAppStore((s) => s.favorites);
  const removeFavorite = useAppStore((s) => s.removeFavorite);
  const weatherQueries = useFavoriteWeathers(hydrated ? favorites : []);
  useResolveLocationLabels();

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Soft-back can restore this page with stale swipe UI; always reset on list.
  useEffect(() => {
    if (pathname === "/") {
      setOpenSwipeId(null);
    }
  }, [pathname]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [hydrated, locale]);

  function handleSelect(location: SelectedLocation) {
    setOpenSwipeId(null);
    router.push(buildWeatherHref(location, locale));
  }

  return (
    <div className="min-h-full flex-1 bg-[linear-gradient(180deg,#1c2433_0%,#10141c_55%,#0b0e14_100%)]">
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-4 pb-10 pt-5 sm:max-w-lg sm:px-6 sm:pt-8">
        <header className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {t(locale, "citiesTitle")}
          </h1>
          <LocaleSwitcher />
        </header>

        <div className="mt-5">
          <LocationSearch onSelect={handleSelect} />
        </div>

        <main className="mt-6 flex-1">
          {!hydrated ? (
            <p className="py-16 text-center text-sm text-white/60">
              {t(locale, "loading")}
            </p>
          ) : favorites.length === 0 ? (
            <p className="px-2 py-16 text-center text-sm leading-relaxed text-white/65">
              {t(locale, "emptyFavorites")}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {favorites.map((location, index) => (
                <li key={location.id}>
                  <CityCard
                    location={location}
                    weatherQuery={weatherQueries[index]!}
                    locale={locale}
                    deleteOpen={openSwipeId === location.id}
                    onDeleteOpenChange={(open) =>
                      setOpenSwipeId(open ? location.id : null)
                    }
                    onNavigate={() => setOpenSwipeId(null)}
                    onRemove={() => {
                      setOpenSwipeId(null);
                      removeFavorite(location.id);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}
