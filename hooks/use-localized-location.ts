"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getLocationLabel,
  hasLocaleLabel,
} from "@/lib/weather/location-label";
import { resolveLocationLabel } from "@/lib/weather/resolve-location-label";
import {
  useAppStore,
  type LocationLabel,
  type SelectedLocation,
} from "@/stores/app-store";

type LocalizedLocationState = {
  label: LocationLabel;
  /** Current locale label is available for writing into favorites. */
  isReady: boolean;
  isResolving: boolean;
  /**
   * Wait until the current locale city name is fetched, then return a
   * location payload safe to write into favorites.
   */
  ensureLocalizedLocation: () => Promise<SelectedLocation>;
};

/**
 * Resolves the display name for `location` in the active locale.
 * Store favorites are patched only after the network label arrives.
 */
export function useLocalizedLocation(
  location: SelectedLocation,
): LocalizedLocationState {
  const locale = useAppStore((s) => s.locale);
  const favoriteMatch = useAppStore((s) =>
    s.favorites.find((item) => item.id === location.id),
  );
  const patchLocationLabels = useAppStore((s) => s.patchLocationLabels);

  const merged: SelectedLocation = favoriteMatch
    ? {
        ...location,
        ...favoriteMatch,
        labels: {
          ...location.labels,
          ...favoriteMatch.labels,
        },
      }
    : location;

  const cached = merged.labels?.[locale] ?? null;
  const fallback = getLocationLabel(merged, locale);

  const [resolved, setResolved] = useState<LocationLabel | null>(cached);
  const [isResolving, setIsResolving] = useState(!cached);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (cached) {
      setResolved(cached);
      setIsResolving(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    let cancelled = false;
    setIsResolving(true);
    // Clear so we don't briefly treat the previous locale name as "ready".
    setResolved(null);

    void (async () => {
      try {
        const label = await resolveLocationLabel(merged, locale);
        if (cancelled || requestId !== requestIdRef.current) return;

        if (label) {
          setResolved(label);
          // Favorites/recent update only after this locale's name is fetched.
          patchLocationLabels(merged.id, locale, label);
        } else {
          setResolved(fallback);
        }
      } catch {
        if (cancelled || requestId !== requestIdRef.current) return;
        setResolved(fallback);
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setIsResolving(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- identity deps
  }, [
    locale,
    merged.id,
    merged.name,
    merged.latitude,
    merged.longitude,
    cached?.name,
    patchLocationLabels,
  ]);

  const label = resolved ?? cached ?? fallback;
  const isReady = Boolean(cached) || (Boolean(resolved) && !isResolving);

  const ensureLocalizedLocation = useCallback(async () => {
    const existing = useAppStore
      .getState()
      .favorites.find((item) => item.id === merged.id);
    const base: SelectedLocation = existing
      ? {
          ...merged,
          ...existing,
          labels: { ...merged.labels, ...existing.labels },
        }
      : { ...merged };

    if (hasLocaleLabel(base, locale)) {
      return base;
    }

    // Prefer in-flight result; otherwise fetch now and wait.
    const labelForLocale =
      resolved && !isResolving
        ? resolved
        : await resolveLocationLabel(base, locale);

    if (!labelForLocale) {
      throw new Error("Failed to resolve localized city name");
    }

    patchLocationLabels(base.id, locale, labelForLocale);

    return {
      ...base,
      labels: {
        ...base.labels,
        [locale]: labelForLocale,
      },
    };
  }, [isResolving, locale, merged, patchLocationLabels, resolved]);

  return {
    label,
    isReady,
    isResolving,
    ensureLocalizedLocation,
  };
}
