export type ApiResponse<T> = {
  code: number;
  data: T | null;
  msg: string;
};

export type LocationResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  timezone?: string;
};

export type GeocodeData = {
  results: LocationResult[];
};

export type HourlyForecastItem = {
  time: string;
  temperature: number;
  weatherCode: number;
  isDay: boolean;
};

export type DailyForecastItem = {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationProbabilityMax: number | null;
};

export type CurrentWeather = {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
};

export type WeatherData = {
  location: {
    name: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
};
