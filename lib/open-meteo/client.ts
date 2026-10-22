import type { GeocodeData, LocationResult, WeatherData } from "@/types/api";
import { httpsGetJson } from "@/lib/open-meteo/http";
import {
  openMeteoForecastSchema,
  openMeteoGeocodeSchema,
  openMeteoLocationSchema,
} from "@/lib/open-meteo/schemas";

const GEOCODE_SEARCH_URL = "https://geocoding-api.open-meteo.com/v1/search";
const GEOCODE_GET_URL = "https://geocoding-api.open-meteo.com/v1/get";
const REVERSE_GEOCODE_URL =
  "https://api.bigdatacloud.net/data/reverse-geocode-client";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export class UpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UpstreamError";
  }
}

function toLocationResult(item: {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  timezone?: string;
}): LocationResult {
  return {
    id: item.id,
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude,
    country: item.country,
    admin1: item.admin1,
    timezone: item.timezone,
  };
}

export async function searchLocations(
  query: string,
  language = "en",
): Promise<GeocodeData> {
  const url = new URL(GEOCODE_SEARCH_URL);
  url.searchParams.set("name", query);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", language);
  url.searchParams.set("format", "json");

  let json: unknown;
  try {
    json = await httpsGetJson(url.toString());
  } catch {
    throw new UpstreamError("Failed to reach geocoding service");
  }

  const parsed = openMeteoGeocodeSchema.safeParse(json);
  if (!parsed.success) {
    throw new UpstreamError("Invalid geocoding response");
  }

  return {
    results: (parsed.data.results ?? []).map(toLocationResult),
  };
}

function searchName(name: string) {
  const simplified = name
    .replace(/(特别行政区|市|省|區|区|縣|县)$/u, "")
    .trim();
  return simplified || name;
}

function distanceKm(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
) {
  const earthRadiusKm = 6371;
  const latDelta = ((toLat - fromLat) * Math.PI) / 180;
  const lonDelta = ((toLon - fromLon) * Math.PI) / 180;
  const fromLatRad = (fromLat * Math.PI) / 180;
  const toLatRad = (toLat * Math.PI) / 180;
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(fromLatRad) * Math.cos(toLatRad) * Math.sin(lonDelta / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Nearest Open-Meteo place for a device coordinate. */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
  language = "en",
): Promise<GeocodeData> {
  const url = new URL(REVERSE_GEOCODE_URL);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("localityLanguage", language);

  let json: unknown;
  try {
    json = await httpsGetJson(url.toString());
  } catch {
    throw new UpstreamError("Failed to reach geocoding service");
  }

  const place =
    json && typeof json === "object"
      ? (json as { city?: unknown; locality?: unknown })
      : null;
  const placeName = [place?.city, place?.locality].find(
    (value): value is string => typeof value === "string" && value.length > 0,
  );

  if (!placeName) {
    return { results: [] };
  }

  const query = searchName(placeName);
  const searched = await searchLocations(query, language);
  const nearest = searched.results
    .map((item) => ({
      item,
      distance: distanceKm(latitude, longitude, item.latitude, item.longitude),
    }))
    .filter((candidate) => candidate.distance <= 80)
    .sort((a, b) => a.distance - b.distance)[0];

  return { results: nearest ? [nearest.item] : [] };
}

/** Exact lookup by Open-Meteo / GeoNames location id (no fuzzy name match). */
export async function getLocationById(
  id: number,
  language = "en",
): Promise<LocationResult | null> {
  const url = new URL(GEOCODE_GET_URL);
  url.searchParams.set("id", String(id));
  url.searchParams.set("language", language);
  url.searchParams.set("format", "json");

  let json: unknown;
  try {
    json = await httpsGetJson(url.toString());
  } catch {
    throw new UpstreamError("Failed to reach geocoding service");
  }

  // Open-Meteo returns an error object when the id does not exist.
  if (
    json &&
    typeof json === "object" &&
    "error" in json &&
    (json as { error?: boolean }).error
  ) {
    return null;
  }

  const parsed = openMeteoLocationSchema.safeParse(json);
  if (!parsed.success) {
    throw new UpstreamError("Invalid location lookup response");
  }

  return toLocationResult(parsed.data);
}

export async function fetchForecast(params: {
  lat: number;
  lon: number;
  name?: string;
}): Promise<WeatherData> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(params.lat));
  url.searchParams.set("longitude", String(params.lon));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "weather_code",
      "wind_speed_10m",
      "is_day",
    ].join(","),
  );
  url.searchParams.set(
    "hourly",
    ["temperature_2m", "weather_code", "is_day"].join(","),
  );
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
    ].join(","),
  );
  url.searchParams.set("forecast_days", "7");

  let json: unknown;
  try {
    json = await httpsGetJson(url.toString());
  } catch {
    throw new UpstreamError("Failed to reach forecast service");
  }

  const parsed = openMeteoForecastSchema.safeParse(json);
  if (!parsed.success) {
    throw new UpstreamError("Invalid forecast response");
  }

  const data = parsed.data;
  // Keep full-day hourly (incl. past hours) so today's day-sheet curve has data.
  const hourly = data.hourly.time.map((time, index) => ({
    time,
    temperature: data.hourly.temperature_2m[index]!,
    weatherCode: data.hourly.weather_code[index]!,
    isDay: data.hourly.is_day[index] === 1,
  }));

  const daily = data.daily.time.map((date, index) => ({
    date,
    weatherCode: data.daily.weather_code[index]!,
    tempMax: data.daily.temperature_2m_max[index]!,
    tempMin: data.daily.temperature_2m_min[index]!,
    precipitationProbabilityMax:
      data.daily.precipitation_probability_max[index] ?? null,
  }));

  return {
    location: {
      name: params.name?.trim() || `${params.lat.toFixed(2)}, ${params.lon.toFixed(2)}`,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
    },
    current: {
      time: data.current.time,
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day === 1,
    },
    hourly,
    daily,
  };
}
