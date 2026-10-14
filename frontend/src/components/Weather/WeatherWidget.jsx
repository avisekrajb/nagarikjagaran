import React from "react";
import { CloudSun, Droplets } from "lucide-react";
import useWeather from "../../hooks/useWeather";

export default function WeatherWidget() {
  const { weather } = useWeather();
  if (!weather) return null;
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <CloudSun size={15} className="text-brand-600" />
      <div className="leading-tight">
        <p className="text-[11px] font-bold text-slate-600">{weather.city}</p>
        <p className="text-[11px] font-bold text-brand-600">{weather.temp}°C</p>
      </div>
    </div>
  );
}