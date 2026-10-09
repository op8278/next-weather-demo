"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocationResult } from "@/types/api";
import type { Locale } from "@/lib/i18n/types";

export type LocationLabel = {
  name: string;
  country: string;
  admin1?: string;
};

export type SelectedLocation = Pick<
  LocationResult,
  "id" | "name" | "latitude" | "longitude" | "country" | "admin1"
> & {
  labels?: Partial<Record<Locale, LocationLabel>>;
};

type AppState = {
  locale: Locale;
  recent: SelectedLocation[];
  favorites: SelectedLocation[];
  setLocale: (locale: Locale) => void;
  addRecent: (location: SelectedLocation) => void;
  toggleFavorite: (location: SelectedLocation) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  getFavorite: (id: number) => SelectedLocation | undefined;
  patchLocationLabels: (
    id: number,
    locale: Locale,
    label: LocationLabel,
  ) => void;
  patchLocationLabelsBatch: (
    locale: Locale,
    updates: Array<{ id: number; label: LocationLabel }>,
  ) => void;
};

function mergeLocation(
  existing: SelectedLocation | undefined,
  next: SelectedLocation,
): SelectedLocation {
  if (!existing) return next;
  return {
    ...existing,
    ...next,
    labels: {
      ...existing.labels,
      ...next.labels,
    },
  };
}

function patchList(
  list: SelectedLocation[],
  id: number,
  locale: Locale,
  label: LocationLabel,
): SelectedLocation[] {
  return list.map((item) => {
    if (item.id !== id) return item;
    return {
      ...item,
      labels: {
        ...item.labels,
        [locale]: label,
      },
    };
  });
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      locale: "en",
      recent: [],
      favorites: [],
      setLocale: (locale) => set({ locale }),
      addRecent: (location) => {
        const recent = [
          location,
          ...get().recent.filter((item) => item.id !== location.id),
        ].slice(0, 5);
        set({ recent });
      },
      toggleFavorite: (location) => {
        const existing = get().favorites.find((item) => item.id === location.id);
        if (existing) {
          set({
            favorites: get().favorites.filter((item) => item.id !== location.id),
          });
          return;
        }
        set({
          favorites: [...get().favorites, mergeLocation(existing, location)],
        });
      },
      removeFavorite: (id) => {
        set({
          favorites: get().favorites.filter((item) => item.id !== id),
        });
      },
      isFavorite: (id) => get().favorites.some((item) => item.id === id),
      getFavorite: (id) => get().favorites.find((item) => item.id === id),
      patchLocationLabels: (id, locale, label) => {
        set({
          favorites: patchList(get().favorites, id, locale, label),
          recent: patchList(get().recent, id, locale, label),
        });
      },
      patchLocationLabelsBatch: (locale, updates) => {
        if (updates.length === 0) return;
        let favorites = get().favorites;
        let recent = get().recent;
        for (const { id, label } of updates) {
          favorites = patchList(favorites, id, locale, label);
          recent = patchList(recent, id, locale, label);
        }
        set({ favorites, recent });
      },
    }),
    {
      name: "weather-app-store",
      partialize: (state) => ({
        locale: state.locale,
        recent: state.recent,
        favorites: state.favorites,
      }),
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<AppState>;
        return {
          ...current,
          ...stored,
          favorites: Array.isArray(stored.favorites)
            ? stored.favorites
            : current.favorites,
        };
      },
    },
  ),
);
