import { Suspense } from "react";
import { WeatherDetailPage } from "@/components/weather/weather-detail-page";

function DetailFallback() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[#10141c] text-sm text-white/70">
      Loading…
    </div>
  );
}

export default function WeatherPage() {
  return (
    <Suspense fallback={<DetailFallback />}>
      <WeatherDetailPage />
    </Suspense>
  );
}
