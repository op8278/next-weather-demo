"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/types";
import { hasLocaleLabel } from "@/lib/weather/location-label";
import { resolveLocationLabel } from "@/lib/weather/resolve-location-label";
import { useAppStore, type SelectedLocation } from "@/stores/app-store";

/** Fill missing localized place names when locale changes. */
export function useResolveLocationLabels(
  extraLocations: SelectedLocation[] = [],
) {
  const locale = useAppStore((s) => s.locale);
  const favorites = useAppStore((s) => s.favorites);
  const recent = useAppStore((s) => s.recent);
  const patchLocationLabelsBatch = useAppStore(
    (s) => s.patchLocationLabelsBatch,
  );
  const [isResolving, setIsResolving] = useState(false);

  const extraKey = extraLocations.map((item) => item.id).join(",");
  const extrasRef = useRef(extraLocations);
  extrasRef.current = extraLocations;

  const missingKey = useMemo(() => {
    const seen = new Set<number>();
    const ids: number[] = [];

    for (const item of [...favorites, ...recent, ...extrasRef.current]) {
      if (seen.has(item.id) || hasLocaleLabel(item, locale)) continue;
      seen.add(item.id);
      ids.push(item.id);
    }

    return ids.join(",");
  }, [favorites, locale, recent, extraKey]);

  useEffect(() => {
    if (!missingKey) {
      setIsResolving(false);
      return;
    }

    const idSet = new Set(
      missingKey.split(",").map(Number).filter(Number.isFinite),
    );
    const snapshot = [...favorites, ...recent, ...extrasRef.current].filter(
      (item, index, arr) =>
        idSet.has(item.id) &&
        arr.findIndex((x) => x.id === item.id) === index &&
        !hasLocaleLabel(item, locale),
    );

    if (snapshot.length === 0) {
      setIsResolving(false);
      return;
    }

    let cancelled = false;
    setIsResolving(true);

    void (async () => {
      const results = await Promise.all(
        snapshot.map(async (location) => {
          try {
            const label = await resolveLocationLabel(location, locale);
            return label ? { id: location.id, label } : null;
          } catch {
            return null;
          }
        }),
      );

      const updates = results.filter(
        (item): item is NonNullable<typeof item> => item != null,
      );

      // Only persist into store after all resolves finish for this locale.
      if (!cancelled && updates.length > 0) {
        patchLocationLabelsBatch(locale, updates);
      }
      if (!cancelled) {
        setIsResolving(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [locale, missingKey, patchLocationLabelsBatch]);

  return { isResolving };
}
