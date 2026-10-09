"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocationResult } from "@/types/api";
import type { Locale } from "@/lib/i18n/types";

export type SelectedLocation = Pick<
  LocationResult,
  "id" | "name" | "latitude" | "longitude" | "country" | "admin1"
>;

const DEFAULT_LOCATION: SelectedLocation = {
  id: 1668341,
  name: "Taipei",
  latitude: 25.0478,
  longitude: 121.5319,
  country: "Taiwan",
  admin1: "Taipei",
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
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      locale: "en",
      recent: [],
      favorites: [DEFAULT_LOCATION],
      setLocale: (locale) => set({ locale }),
      addRecent: (location) => {
        const recent = [
          location,
          ...get().recent.filter((item) => item.id !== location.id),
        ].slice(0, 5);
        set({ recent });
      },
      toggleFavorite: (location) => {
        const exists = get().favorites.some((item) => item.id === location.id);
        if (exists) {
          set({
            favorites: get().favorites.filter((item) => item.id !== location.id),
          });
          return;
        }
        set({ favorites: [...get().favorites, location] });
      },
      removeFavorite: (id) => {
        set({
          favorites: get().favorites.filter((item) => item.id !== id),
        });
      },
      isFavorite: (id) => get().favorites.some((item) => item.id === id),
      getFavorite: (id) => get().favorites.find((item) => item.id === id),
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
        const favorites =
          Array.isArray(stored.favorites) && stored.favorites.length > 0
            ? stored.favorites
            : current.favorites;
        return {
          ...current,
          ...stored,
          favorites,
        };
      },
    },
  ),
);

export { DEFAULT_LOCATION };
