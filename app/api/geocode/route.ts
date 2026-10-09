import { ApiCode } from "@/lib/api/codes";
import { fail, ok } from "@/lib/api/response";
import {
  getLocationById,
  searchLocations,
  UpstreamError,
} from "@/lib/open-meteo/client";
import { geocodeQuerySchema } from "@/lib/open-meteo/schemas";
import { toOpenMeteoLanguage } from "@/lib/weather/location-label";
import type { Locale } from "@/lib/i18n/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || undefined;
    const idParam = searchParams.get("id");

    const parsed = geocodeQuerySchema.safeParse({
      q,
      id: idParam ?? undefined,
      lang: searchParams.get("lang") ?? "en",
    });

    if (!parsed.success) {
      return fail(ApiCode.INVALID_PARAMS, "Invalid search query");
    }

    const language = toOpenMeteoLanguage(parsed.data.lang as Locale);

    // Prefer exact id lookup when resolving localized labels.
    if (parsed.data.id != null) {
      const location = await getLocationById(parsed.data.id, language);
      if (!location) {
        return fail(ApiCode.LOCATION_NOT_FOUND, "Location not found");
      }
      return ok({ results: [location] });
    }

    const data = await searchLocations(parsed.data.q!, language);

    if (data.results.length === 0) {
      return fail(ApiCode.LOCATION_NOT_FOUND, "No locations found");
    }

    return ok(data);
  } catch (error) {
    if (error instanceof UpstreamError) {
      return fail(ApiCode.UPSTREAM_FAILED, error.message);
    }
    return fail(ApiCode.UNKNOWN, "Unexpected server error");
  }
}
