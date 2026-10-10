"use client";

import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/stores/app-store";

export function RefreshButton() {
  const locale = useAppStore((s) => s.locale);
  const queryClient = useQueryClient();
  const fetching = useIsFetching({ queryKey: ["weather"] });
  const busy = fetching > 0;

  function handleRefresh() {
    if (busy) return;
    void queryClient.invalidateQueries({ queryKey: ["weather"] });
  }

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={busy}
      aria-label={t(locale, "refresh")}
      title={t(locale, "refresh")}
      aria-busy={busy}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/16 disabled:cursor-wait disabled:opacity-50 cursor-pointer"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={busy ? "animate-spin" : undefined}
      >
        <path
          d="M19.5 12a7.5 7.5 0 1 1-2.1-5.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M19.5 4.5v4.2h-4.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
