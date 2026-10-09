"use client";

import { useId } from "react";
import type { Locale } from "@/lib/i18n/types";
import type { HourlyForecastItem } from "@/types/api";

type TemperatureCurveProps = {
  items: HourlyForecastItem[];
  locale: Locale;
  timezone: string;
};

const WIDTH = 360;
const HEIGHT = 176;
const PAD_X = 18;
const PAD_TOP = 28;
const PAD_BOTTOM = 32;

function formatHour(time: string, timezone: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    hour: "numeric",
    hour12: locale === "en",
    timeZone: timezone,
  }).format(new Date(time));
}

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function TemperatureCurve({
  items,
  locale,
  timezone,
}: TemperatureCurveProps) {
  const fillId = useId();

  if (items.length === 0) return null;

  const temps = items.map((item) => item.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const span = Math.max(maxTemp - minTemp, 1);
  const innerWidth = WIDTH - PAD_X * 2;
  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const points = items.map((item, index) => {
    const x =
      items.length === 1
        ? WIDTH / 2
        : PAD_X + (index / (items.length - 1)) * innerWidth;
    const y =
      PAD_TOP + ((maxTemp - item.temperature) / span) * innerHeight;
    return { x, y, item, index };
  });

  const line = smoothPath(points);
  const last = points[points.length - 1]!;
  const fill = `${line} L ${last.x} ${HEIGHT - PAD_BOTTOM} L ${points[0]!.x} ${HEIGHT - PAD_BOTTOM} Z`;

  const minIndex = temps.indexOf(minTemp);
  const maxIndex = temps.indexOf(maxTemp);
  const labeled = new Set([minIndex, maxIndex]);

  const tickStep =
    items.length <= 8 ? 1 : items.length <= 16 ? 3 : 4;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label={items
        .map(
          (item) =>
            `${formatHour(item.time, timezone, locale)} ${Math.round(item.temperature)}°`,
        )
        .join(", ")}
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.28" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${fillId})`} />
      <path
        d={line}
        fill="none"
        stroke="white"
        strokeOpacity="0.88"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((point) =>
        labeled.has(point.index) ? (
          <g key={`dot-${point.item.time}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="3.2"
              fill="white"
              fillOpacity="0.95"
            />
            <text
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              fill="white"
              fillOpacity="0.92"
              fontSize="11"
              fontWeight="500"
            >
              {Math.round(point.item.temperature)}°
            </text>
          </g>
        ) : null,
      )}
      {points.map((point) =>
        point.index % tickStep === 0 || point.index === points.length - 1 ? (
          <text
            key={`tick-${point.item.time}`}
            x={point.x}
            y={HEIGHT - 10}
            textAnchor="middle"
            fill="white"
            fillOpacity="0.55"
            fontSize="10"
          >
            {formatHour(point.item.time, timezone, locale)}
          </text>
        ) : null,
      )}
    </svg>
  );
}
