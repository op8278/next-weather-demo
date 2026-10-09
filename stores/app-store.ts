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
  location: SelectedLocation;
  recent: SelectedLocation[];
  setLocale: (locale: Locale) => void;
  setLocation: (location: SelectedLocation) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      locale: "en",
      location: DEFAULT_LOCATION,
      recent: [],
      setLocale: (locale) => set({ locale }),
      setLocation: (location) => {
        const recent = [
          location,
          ...get().recent.filter((item) => item.id !== location.id),
        ].slice(0, 5);
        set({ location, recent });
      },
    }),
    {
      name: "weather-app-store",
      partialize: (state) => ({
        locale: state.locale,
        location: state.location,
        recent: state.recent,
      }),
    },
  ),
);

export { DEFAULT_LOCATION };
