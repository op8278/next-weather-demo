import { en } from "@/lib/i18n/messages/en";
import { zh } from "@/lib/i18n/messages/zh";
import type { Locale, MessageKey, Messages } from "@/lib/i18n/types";
import { ApiCode } from "@/lib/api/codes";
import { isApiError } from "@/lib/api/client";

const dictionaries: Record<Locale, Messages> = { en, zh };

export function t(locale: Locale, key: MessageKey): string {
  return dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
}

export function getErrorMessage(locale: Locale, error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case ApiCode.INVALID_PARAMS:
        return t(locale, "errorInvalidParams");
      case ApiCode.LOCATION_NOT_FOUND:
        return t(locale, "errorLocationNotFound");
      case ApiCode.UPSTREAM_FAILED:
        return t(locale, "errorUpstream");
      case ApiCode.UNKNOWN:
        return error.message === "Network request failed"
          ? t(locale, "errorNetwork")
          : t(locale, "errorGeneric");
      default:
        return error.message || t(locale, "errorGeneric");
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return t(locale, "errorGeneric");
}

export type { Locale, MessageKey };
