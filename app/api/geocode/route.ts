import { ApiCode } from "@/lib/api/codes";
import { fail, ok } from "@/lib/api/response";
import {
  searchLocations,
  UpstreamError,
} from "@/lib/open-meteo/client";
import { geocodeQuerySchema } from "@/lib/open-meteo/schemas";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = geocodeQuerySchema.safeParse({
      q: searchParams.get("q") ?? "",
    });

    if (!parsed.success) {
      return fail(ApiCode.INVALID_PARAMS, "Invalid search query");
    }

    const data = await searchLocations(parsed.data.q);

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
