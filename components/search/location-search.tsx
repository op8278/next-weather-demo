"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useGeocode } from "@/hooks/use-geocode";
import { getErrorMessage, t } from "@/lib/i18n";
import { useAppStore, type SelectedLocation } from "@/stores/app-store";

function formatLocationLabel(item: {
  name: string;
  admin1?: string;
  country: string;
}) {
  return [item.name, item.admin1, item.country].filter(Boolean).join(", ");
}

export function LocationSearch() {
  const locale = useAppStore((s) => s.locale);
  const recent = useAppStore((s) => s.recent);
  const setLocation = useAppStore((s) => s.setLocation);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debounced = useDebouncedValue(query, 350);
  const geocode = useGeocode(debounced, open);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function selectLocation(location: SelectedLocation) {
    setLocation(location);
    setQuery("");
    setOpen(false);
  }

  const showRecent = open && query.trim().length < 2 && recent.length > 0;
  const showResults = open && query.trim().length >= 2;

  return (
    <div ref={rootRef} className="relative w-full">
      <label className="sr-only" htmlFor="location-search">
        {t(locale, "searchPlaceholder")}
      </label>
      <input
        id="location-search"
        type="search"
        autoComplete="off"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={t(locale, "searchPlaceholder")}
        aria-controls={listId}
        aria-expanded={open}
        className="w-full rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-sm text-white outline-none backdrop-blur-sm placeholder:text-white/55 focus:border-white/40 focus:bg-white/16"
      />

      {showRecent || showResults ? (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-white/15 bg-slate-900/90 shadow-xl backdrop-blur-md"
        >
          {showRecent ? (
            <div className="px-3 py-2">
              <p className="px-1 pb-2 text-[11px] uppercase tracking-[0.14em] text-white/45">
                {t(locale, "recent")}
              </p>
              <ul>
                {recent.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      role="option"
                      className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-white/90 transition hover:bg-white/10"
                      onClick={() => selectLocation(item)}
                    >
                      {formatLocationLabel(item)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {showResults ? (
            <div className="px-3 py-2">
              {geocode.isFetching ? (
                <p className="px-3 py-3 text-sm text-white/65">
                  {t(locale, "loading")}
                </p>
              ) : null}

              {geocode.isError ? (
                <p className="px-3 py-3 text-sm text-white/75">
                  {getErrorMessage(locale, geocode.error)}
                </p>
              ) : null}

              {geocode.isSuccess && geocode.data.results.length === 0 ? (
                <p className="px-3 py-3 text-sm text-white/65">
                  {t(locale, "searchNoResults")}
                </p>
              ) : null}

              {geocode.isSuccess ? (
                <ul>
                  {geocode.data.results.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        role="option"
                        className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-white/90 transition hover:bg-white/10"
                        onClick={() =>
                          selectLocation({
                            id: item.id,
                            name: item.name,
                            latitude: item.latitude,
                            longitude: item.longitude,
                            country: item.country,
                            admin1: item.admin1,
                          })
                        }
                      >
                        {formatLocationLabel(item)}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {!geocode.isFetching &&
              !geocode.isError &&
              !geocode.isSuccess &&
              debounced.trim().length < 2 ? (
                <p className="px-3 py-3 text-sm text-white/65">
                  {t(locale, "searchEmpty")}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
