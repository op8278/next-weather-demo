import type { Locale } from "@/lib/i18n/types";

const weatherDescriptions: Record<
  number,
  { en: string; zh: string }
> = {
  0: { en: "Clear", zh: "晴" },
  1: { en: "Mainly clear", zh: "大部晴朗" },
  2: { en: "Partly cloudy", zh: "局部多云" },
  3: { en: "Overcast", zh: "阴" },
  45: { en: "Fog", zh: "雾" },
  48: { en: "Depositing rime fog", zh: "霜雾" },
  51: { en: "Light drizzle", zh: "小毛毛雨" },
  53: { en: "Drizzle", zh: "毛毛雨" },
  55: { en: "Dense drizzle", zh: "浓毛毛雨" },
  56: { en: "Light freezing drizzle", zh: "轻度冻毛毛雨" },
  57: { en: "Freezing drizzle", zh: "冻毛毛雨" },
  61: { en: "Slight rain", zh: "小雨" },
  63: { en: "Rain", zh: "中雨" },
  65: { en: "Heavy rain", zh: "大雨" },
  66: { en: "Light freezing rain", zh: "轻度冻雨" },
  67: { en: "Freezing rain", zh: "冻雨" },
  71: { en: "Slight snow", zh: "小雪" },
  73: { en: "Snow", zh: "中雪" },
  75: { en: "Heavy snow", zh: "大雪" },
  77: { en: "Snow grains", zh: "雪粒" },
  80: { en: "Slight rain showers", zh: "小阵雨" },
  81: { en: "Rain showers", zh: "阵雨" },
  82: { en: "Violent rain showers", zh: "强阵雨" },
  85: { en: "Slight snow showers", zh: "小阵雪" },
  86: { en: "Heavy snow showers", zh: "强阵雪" },
  95: { en: "Thunderstorm", zh: "雷暴" },
  96: { en: "Thunderstorm with hail", zh: "雷暴伴冰雹" },
  99: { en: "Thunderstorm with heavy hail", zh: "强雷暴伴冰雹" },
};

export function getWeatherDescription(
  code: number,
  locale: Locale,
): string {
  const entry = weatherDescriptions[code];
  if (!entry) {
    return locale === "zh" ? "未知" : "Unknown";
  }
  return entry[locale];
}

export type WeatherMood = "clear" | "cloudy" | "fog" | "rain" | "snow" | "storm";

export function getWeatherMood(code: number): WeatherMood {
  if (code === 0 || code === 1) return "clear";
  if (code === 2 || code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 85 && code <= 86) return "snow";
  if (code >= 95) return "storm";
  return "rain";
}

export function getBackgroundGradient(
  mood: WeatherMood,
  isDay: boolean,
): string {
  if (!isDay) {
    switch (mood) {
      case "clear":
        return "linear-gradient(180deg, #1a2744 0%, #0d1526 55%, #0a1020 100%)";
      case "cloudy":
        return "linear-gradient(180deg, #2a3344 0%, #161c28 55%, #0f141d 100%)";
      case "fog":
        return "linear-gradient(180deg, #3a4250 0%, #1e2430 55%, #141820 100%)";
      case "snow":
        return "linear-gradient(180deg, #2c3a4e 0%, #1a2433 55%, #121820 100%)";
      case "storm":
        return "linear-gradient(180deg, #1f2433 0%, #12161f 55%, #0b0e14 100%)";
      default:
        return "linear-gradient(180deg, #243044 0%, #141c2a 55%, #0e1420 100%)";
    }
  }

  switch (mood) {
    case "clear":
      return "linear-gradient(180deg, #5b8fd6 0%, #7eabdf 40%, #a8c5e8 100%)";
    case "cloudy":
      return "linear-gradient(180deg, #7a8ea3 0%, #93a4b5 45%, #b0bdc9 100%)";
    case "fog":
      return "linear-gradient(180deg, #9aa6b2 0%, #b0b8c0 50%, #c4cad0 100%)";
    case "snow":
      return "linear-gradient(180deg, #8fa3b8 0%, #a8b8c8 45%, #c5d0da 100%)";
    case "storm":
      return "linear-gradient(180deg, #4a5568 0%, #5c6878 45%, #748090 100%)";
    default:
      return "linear-gradient(180deg, #5f7a96 0%, #7a92a8 45%, #9aafc0 100%)";
  }
}
