import { ApiCode } from "@/lib/api/codes";
import { fail, ok } from "@/lib/api/response";
import {
  fetchForecast,
  UpstreamError,
} from "@/lib/open-meteo/client";
import { weatherQuerySchema } from "@/lib/open-meteo/schemas";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = weatherQuerySchema.safeParse({
      lat: searchParams.get("lat"),
      lon: searchParams.get("lon"),
      name: searchParams.get("name") ?? undefined,
    });

    if (!parsed.success) {
      return fail(ApiCode.INVALID_PARAMS, "Invalid latitude or longitude");
    }

    const data = await fetchForecast(parsed.data);
    return ok(data);
  } catch (error) {
    if (error instanceof UpstreamError) {
      return fail(ApiCode.UPSTREAM_FAILED, error.message);
    }
    return fail(ApiCode.UNKNOWN, "Unexpected server error");
  }
}
