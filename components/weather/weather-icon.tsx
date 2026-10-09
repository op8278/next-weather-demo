"use client";

import {
  getWeatherDescription,
  getWeatherIconKind,
  type WeatherIconKind,
} from "@/lib/weather/map-codes";
import type { Locale } from "@/lib/i18n/types";

type WeatherIconProps = {
  code: number;
  locale: Locale;
  isDay?: boolean;
  size?: number;
  className?: string;
};

function Sun({ night }: { night?: boolean }) {
  if (night) {
    return (
      <path
        d="M18 8.5a7.5 7.5 0 1 0 5.4 12.7A9.2 9.2 0 1 1 18 8.5Z"
        fill="currentColor"
        fillOpacity="0.92"
      />
    );
  }
  return (
    <g fill="currentColor">
      <circle cx="16" cy="16" r="5.5" fillOpacity="0.95" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none">
        <path d="M16 3.5v2.8M16 25.7v2.8M3.5 16h2.8M25.7 16h2.8M7.2 7.2l2 2M22.8 22.8l2 2M7.2 24.8l2-2M22.8 9.2l2-2" />
      </g>
    </g>
  );
}

function Cloud({ opacity = 0.95 }: { opacity?: number }) {
  return (
    <path
      d="M10.5 22.5h12.2a4.8 4.8 0 0 0 .4-9.6 6.6 6.6 0 0 0-12.7-1.7 4.4 4.4 0 0 0 .1 11.3Z"
      fill="currentColor"
      fillOpacity={opacity}
    />
  );
}

function Drops({ heavy }: { heavy?: boolean }) {
  return (
    <g fill="currentColor" fillOpacity="0.9">
      <path d="M12 23.2c0 1.1-.8 1.8-1.5 1.8S9 24.3 9 23.2 10.5 20.5 10.5 20.5 12 22.1 12 23.2Z" />
      <path d="M17 24.2c0 1.1-.8 1.8-1.5 1.8S14 25.3 14 24.2 15.5 21.5 15.5 21.5 17 23.1 17 24.2Z" />
      {heavy ? (
        <path d="M22 23.2c0 1.1-.8 1.8-1.5 1.8S19 24.3 19 23.2 20.5 20.5 20.5 20.5 22 22.1 22 23.2Z" />
      ) : null}
    </g>
  );
}

function Flakes() {
  return (
    <g
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      fill="none"
      opacity="0.95"
    >
      <path d="M11 23v4M9.2 24.2l3.6 1.6M9.2 25.8l3.6-1.6" />
      <path d="M18 22.5v4M16.2 23.7l3.6 1.6M16.2 25.3l3.6-1.6" />
    </g>
  );
}

function Bolt() {
  return (
    <path
      d="M16.8 18.8 14 24.5h2.2l-1.4 5.2 5.6-7.4h-2.6l1.6-3.5Z"
      fill="currentColor"
      fillOpacity="0.95"
    />
  );
}

function IconGraphic({
  kind,
  isDay,
}: {
  kind: WeatherIconKind;
  isDay: boolean;
}) {
  switch (kind) {
    case "clear":
      return <Sun night={!isDay} />;
    case "mainlyClear":
      return (
        <>
          <g transform="translate(-2 -3) scale(0.78)">
            <Sun night={!isDay} />
          </g>
          <g transform="translate(2 2)">
            <Cloud opacity={0.88} />
          </g>
        </>
      );
    case "partlyCloudy":
      return (
        <>
          <g transform="translate(-1 -4) scale(0.7)">
            <Sun night={!isDay} />
          </g>
          <Cloud />
        </>
      );
    case "overcast":
      return (
        <>
          <g transform="translate(0 -2)" opacity="0.55">
            <Cloud />
          </g>
          <Cloud />
        </>
      );
    case "fog":
      return (
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9">
          <path d="M7 13h18M6 17h20M8 21h16" />
        </g>
      );
    case "drizzle":
      return (
        <>
          <Cloud opacity={0.9} />
          <g transform="translate(2.4 4.6) scale(0.85)">
            <Drops />
          </g>
        </>
      );
    case "rain":
    case "showers":
      return (
        <>
          <Cloud />
          <Drops heavy />
        </>
      );
    case "freezingRain":
      return (
        <>
          <Cloud />
          <Drops />
          <g transform="translate(6 0)">
            <Flakes />
          </g>
        </>
      );
    case "snow":
    case "snowShowers":
      return (
        <>
          <Cloud />
          <Flakes />
        </>
      );
    case "thunderstorm":
      return (
        <>
          <Cloud />
          <Bolt />
        </>
      );
    default:
      return (
        <circle
          cx="16"
          cy="16"
          r="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          opacity="0.7"
        />
      );
  }
}

export function WeatherIcon({
  code,
  locale,
  isDay = true,
  size = 24,
  className = "",
}: WeatherIconProps) {
  const kind = getWeatherIconKind(code);
  const label = getWeatherDescription(code, locale);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`inline-block shrink-0 text-white ${className}`}
      role="img"
      aria-label={label}
    >
      <IconGraphic kind={kind} isDay={isDay} />
    </svg>
  );
}
