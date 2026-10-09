import { z } from "zod";

export const geocodeQuerySchema = z
  .object({
    q: z.string().trim().min(1).max(100).optional(),
    id: z.coerce.number().int().positive().optional(),
    lang: z.enum(["en", "zh"]).default("en"),
  })
  .refine((value) => Boolean(value.q) || Boolean(value.id), {
    message: "Either q or id is required",
  });

export const weatherQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  name: z.string().trim().min(1).max(120).optional(),
});

const openMeteoLocationFields = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  country: z.string().optional().default(""),
  admin1: z.string().optional(),
  timezone: z.string().optional(),
});

export const openMeteoGeocodeSchema = z.object({
  results: z.array(openMeteoLocationFields).optional(),
});

/** `/v1/get` returns a single location object (not wrapped in results). */
export const openMeteoLocationSchema = openMeteoLocationFields;

export const openMeteoForecastSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  current: z.object({
    time: z.string(),
    temperature_2m: z.number(),
    apparent_temperature: z.number(),
    relative_humidity_2m: z.number(),
    weather_code: z.number(),
    wind_speed_10m: z.number(),
    is_day: z.number(),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
    weather_code: z.array(z.number()),
    is_day: z.array(z.number()),
  }),
  daily: z.object({
    time: z.array(z.string()),
    weather_code: z.array(z.number()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    precipitation_probability_max: z.array(z.number().nullable()),
  }),
});
