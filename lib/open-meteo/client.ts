import type { GeocodeData, WeatherData } from "@/types/api";
import { httpsGetJson } from "@/lib/open-meteo/http";
import {
  openMeteoForecastSchema,
  openMeteoGeocodeSchema,
} from "@/lib/open-meteo/schemas";

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export class UpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UpstreamError";
  }
}

export async function searchLocations(query: string): Promise<GeocodeData> {
  const url = new URL(GEOCODE_URL);
  url.searchParams.set("name", query);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", "en");
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

  const results = (parsed.data.results ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude,
    country: item.country,
    admin1: item.admin1,
    timezone: item.timezone,
  }));

  return { results };
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
  const now = new Date(data.current.time);
  const hourly = data.hourly.time
    .map((time, index) => ({
      time,
      temperature: data.hourly.temperature_2m[index]!,
      weatherCode: data.hourly.weather_code[index]!,
      isDay: data.hourly.is_day[index] === 1,
    }))
    .filter((item) => new Date(item.time) >= now)
    .slice(0, 24);

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
