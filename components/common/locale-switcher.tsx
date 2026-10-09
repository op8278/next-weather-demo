"use client";

import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { useAppStore } from "@/stores/app-store";

export function LocaleSwitcher() {
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);

  const options: Locale[] = ["zh", "en"];

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1"
      role="group"
      aria-label={t(locale, "language")}
    >
      {options.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer ${
              active
                ? "bg-white text-slate-800"
                : "text-white/80 hover:text-white"
            }`}
          >
            {option === "zh" ? "中文" : "EN"}
          </button>
        );
      })}
    </div>
  );
}
